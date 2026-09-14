CREATE OR REPLACE FUNCTION public.create_notification_if_new_with_identity(p_user_id uuid, p_company_id uuid, p_type text, p_title text, p_body text, p_persistent boolean DEFAULT false, p_action_url text DEFAULT NULL::text, p_action_label text DEFAULT NULL::text, p_project_id text DEFAULT NULL::text, p_deep_link_type text DEFAULT NULL::text, p_dedupe_key text DEFAULT NULL::text)
 RETURNS TABLE(notification_id uuid, created boolean, incident_version bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
declare
  v_notification_id uuid;
  v_incident_version bigint;
  v_dedupe_key text := nullif(btrim(p_dedupe_key), '');
  v_type text := nullif(btrim(p_type), '');
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'service role required'
      using errcode = '42501';
  end if;

  if p_user_id is null
     or p_company_id is null
     or v_type is null
     or nullif(btrim(p_title), '') is null
     or nullif(btrim(p_body), '') is null then
    raise exception 'notification identity and content are required'
      using errcode = '22023';
  end if;

  if v_dedupe_key is null then
    raise exception 'notification dedupe key is required'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
      from public.users as u
      join public.companies as c
        on c.id = u.company_id
     where u.id = p_user_id
       and u.company_id = p_company_id
       and u.deleted_at is null
       and coalesce(u.is_active, false)
       and c.deleted_at is null
  ) then
    raise exception 'notification recipient is unavailable'
      using errcode = '42501';
  end if;

  if v_type = 'ai_provider_quota' then
    perform pg_catalog.pg_advisory_xact_lock(
      private.openai_quota_notification_lock_key(
        p_user_id,
        p_company_id,
        v_dedupe_key
      )
    );

    update public.notifications as notification
       set incident_version = notification.incident_version + 1,
           is_read = false
     where notification.user_id = p_user_id::text
       and notification.company_id = p_company_id::text
       and notification.type = 'ai_provider_quota'
       and notification.dedupe_key = v_dedupe_key
       and notification.resolved_at is null
    returning notification.id, notification.incident_version
         into v_notification_id, v_incident_version;

    if v_notification_id is not null then
      return query select v_notification_id, false, v_incident_version;
      return;
    end if;
  end if;

  insert into public.notifications as notification (
    user_id,
    company_id,
    type,
    title,
    body,
    is_read,
    persistent,
    action_url,
    action_label,
    project_id,
    deep_link_type,
    dedupe_key,
    incident_version
  )
  values (
    p_user_id::text,
    p_company_id::text,
    v_type,
    btrim(p_title),
    btrim(p_body),
    false,
    p_persistent,
    nullif(btrim(p_action_url), ''),
    nullif(btrim(p_action_label), ''),
    nullif(btrim(p_project_id), ''),
    nullif(btrim(p_deep_link_type), ''),
    v_dedupe_key,
    case when v_type = 'ai_provider_quota' then 1 else 0 end
  )
  on conflict do nothing
  returning notification.id, notification.incident_version
       into v_notification_id, v_incident_version;

  if v_notification_id is not null then
    return query select v_notification_id, true, v_incident_version;
    return;
  end if;

  -- A non-cooperating writer could race the advisory-lock protocol. Re-touch
  -- the exact row after ON CONFLICT so this observation is never lost.
  if v_type = 'ai_provider_quota' then
    update public.notifications as notification
       set incident_version = notification.incident_version + 1,
           is_read = false
     where notification.user_id = p_user_id::text
       and notification.company_id = p_company_id::text
       and notification.type = 'ai_provider_quota'
       and notification.dedupe_key = v_dedupe_key
       and notification.resolved_at is null
    returning notification.id, notification.incident_version
         into v_notification_id, v_incident_version;

    if v_notification_id is not null then
      return query select v_notification_id, false, v_incident_version;
      return;
    end if;
  end if;

  -- ON CONFLICT waits for the competing insert. Re-read the exact open row so
  -- callers receive its stable identity without treating it as newly created.
  select notification.id, notification.incident_version
    into v_notification_id, v_incident_version
    from public.notifications as notification
   where notification.user_id = p_user_id::text
     and notification.company_id = p_company_id::text
     and notification.type = v_type
     and notification.dedupe_key is not distinct from v_dedupe_key
     and notification.is_read = false
     and notification.resolved_at is null
   order by notification.created_at desc, notification.id desc
   limit 1;

  if v_notification_id is null then
    raise exception 'notification insert could not be reconciled'
      using errcode = '55000';
  end if;

  return query select v_notification_id, false, v_incident_version;
end;
$function$

