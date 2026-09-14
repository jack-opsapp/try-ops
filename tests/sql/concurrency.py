"""Local scratch Postgres only. Actual independent sessions contend for one lease."""
import concurrent.futures, json, subprocess, time, uuid
PSQL=['/opt/homebrew/bin/psql','-h','/private/tmp','-p','55491','-d','tryops_engine_final2','-v','ON_ERROR_STOP=1','-Atc']
suffix=uuid.uuid4().hex
def claim(i):
    return json.loads(subprocess.check_output(PSQL+["select public.claim_tryops_run('parallel-proof-%s-%d','health');"%(suffix,i)],text=True))
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    results=list(pool.map(claim,range(8)))
assert sum(r['status']=='claimed' for r in results)==1,results
assert sum(r['status']=='busy' for r in results)==7,results
print('PASS: 8 concurrent database sessions -> 1 exclusive claim, 7 busy')
claimed=next(r for r in results if r['status']=='claimed')
subprocess.check_call(PSQL+["select public.finish_tryops_run('%s','%s','{\"status\":\"verified\"}');"%(claimed['run_id'],claimed['lease_token'])])

# Hold the route lock while a same-key claimant waits; commit success first.
key='same-key-'+uuid.uuid4().hex
interactive=PSQL[:-1]+['-Atq']
owner=subprocess.Popen(interactive,stdin=subprocess.PIPE,stdout=subprocess.PIPE,text=True,bufsize=1)
owner.stdin.write("begin; select public.claim_tryops_run('%s','health','same-hash');\n"%key);owner.stdin.flush()
first=json.loads(owner.stdout.readline())
with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
    waiter=pool.submit(subprocess.check_output,PSQL[:-1]+['-Atq','-c',"set application_name='tryops-samekey-waiter'; select public.claim_tryops_run('%s','health','same-hash');"%key],text=True)
    deadline=time.monotonic()+5
    waiting=False
    while time.monotonic()<deadline:
        waiting=subprocess.check_output(PSQL+["select exists(select 1 from pg_stat_activity where application_name='tryops-samekey-waiter' and wait_event_type='Lock');"],text=True).strip()=='t'
        if waiting: break
        time.sleep(.02)
    assert waiting,'Second session never waited on the route lock'
    owner.stdin.write("select public.finish_tryops_run('%s','%s','{\"status\":\"committed-before-waiter\"}'); commit;\n"%(first['run_id'],first['lease_token']));owner.stdin.flush()
    finished=json.loads(owner.stdout.readline());assert finished['status']=='succeeded'
    reply=json.loads(waiter.result(timeout=5))
    assert reply['status']=='complete' and reply['result']['status']=='committed-before-waiter',reply
owner.stdin.close();owner.wait(timeout=5)
print('PASS: same-key waiter observes committed success after route lock, never reopens completed mutation')
