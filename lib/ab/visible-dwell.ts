/** Monotonic visible-tab dwell. Flushing consumes time so pagehide/cleanup cannot duplicate it. */
export class VisibleDwell {
 private entered:number|null=null
 private total=0
 update(visible:boolean,now:number):number {
  if(this.entered!==null){this.total+=Math.max(0,now-this.entered);this.entered=null}
  if(visible)this.entered=now
  const elapsed=Math.min(1800000,Math.floor(this.total));this.total=0
  return elapsed
 }
}
