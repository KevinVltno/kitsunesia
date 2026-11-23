begin;
alter table public.activity add column recorded_at timestamptz, add column material text, add column level public.jlpt_level;
alter table public.activity alter column recorded_at set default now();
create index activity_recent_session on public.activity(user_id,day desc,recorded_at desc nulls last,id desc);
create index attempts_recent_user on public.attempts(user_id,created_at desc,id desc);
create or replace function public.rate_card(event_id uuid, content_kind public.study_kind, content_id uuid, quality int, elapsed int, task_id uuid default null)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); r public.srs_cards; lim int;
begin
 if uid is null or quality is null or quality not between 0 and 5 or content_kind is null or content_kind not in ('kosakata','kanji') then raise exception 'Ulasan tidak valid'; end if;
 select new_card_limit into strict lim from public.profiles where id=uid for update;
 if exists(select 1 from public.srs_events where id=event_id and user_id=uid) then return; end if;
 select * into r from public.srs_cards where user_id=uid and (case when content_kind='kosakata' then vocabulary_id else kanji_id end)=content_id;
 if not found then
  if (select count(*) from public.srs_cards where user_id=uid and introduced_on=public.jakarta_today())>=lim then raise exception 'Batas kartu baru hari ini tercapai'; end if;
  insert into public.srs_cards(user_id,vocabulary_id,kanji_id) values(uid,
   case when content_kind='kosakata' then content_id end,case when content_kind='kanji' then content_id end) returning * into r;
 elsif r.due_date>public.jakarta_today() then raise exception 'Kartu belum jatuh tempo'; end if;
 if quality<3 then r.repetitions:=0;r.interval_days:=1;
 else r.interval_days:=case r.repetitions when 0 then 1 when 1 then 6 else least(36500,round(r.interval_days*r.ease)::int) end;r.repetitions:=r.repetitions+1;end if;
 r.ease:=greatest(1.3,r.ease+0.1-(5-quality)*(0.08+(5-quality)*0.02));
 update public.srs_cards set repetitions=r.repetitions,ease=r.ease,interval_days=r.interval_days,due_date=public.jakarta_today()+r.interval_days where id=r.id;
 insert into public.srs_events values(event_id,uid);
 perform public.log_study(event_id,content_kind,elapsed,task_id);
 update public.activity set card_review=true, material=coalesce(
  (select japanese from public.vocabulary where id=r.vocabulary_id),
  (select character from public.kanji where id=r.kanji_id)),
  level=coalesce((select v.level from public.vocabulary v where v.id=r.vocabulary_id),
   (select k.level from public.kanji k where k.id=r.kanji_id))
 where id=event_id and user_id=uid and kind=content_kind;
 insert into public.user_achievements(user_id,code)
 select uid,a.code from public.achievements a where a.code='words100'
 and (select count(*) from public.srs_cards s where s.user_id=uid and s.vocabulary_id is not null and repetitions>=3)>=100
 on conflict do nothing;
end $$;
create or replace function public.complete_grammar(event_id uuid, point uuid, elapsed int, task_id uuid default null)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Silakan masuk'; end if;
 insert into public.user_progress(user_id,grammar_id) values(auth.uid(),point) on conflict do nothing;
 perform public.log_study(event_id,'bunpou',elapsed,task_id);
 update public.activity a set material=g.pattern,level=g.level from public.grammar_points g
 where g.id=point and a.id=event_id and a.user_id=auth.uid() and a.kind='bunpou';
end $$;

create function public.admin_learning_users(term text default '', page_index int default 0)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.is_admin() then raise exception 'Akses admin diperlukan' using errcode='42501'; end if;
 if page_index is null or page_index not between 0 and 100000 then raise exception 'Halaman tidak valid'; end if;
 with matches as (
  select p.id,p.name,p.role,p.active_level,u.email
  from public.profiles p join auth.users u on u.id=p.id
  where strpos(lower(concat_ws(' ',p.name,u.email,p.id::text)),lower(left(trim(coalesce(term,'')),100)))>0
 ), page as (
  select * from matches order by coalesce(nullif(name,''),email,''),id offset page_index*18 limit 18
 )
 select jsonb_build_object('count',(select count(*) from matches),'items',coalesce((
  select jsonb_agg(to_jsonb(page) order by coalesce(nullif(name,''),email,''),id) from page
 ),'[]'::jsonb)) into result;
 return result;
end $$;

create function public.admin_learning_progress(learner uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare active public.jlpt_level; result jsonb;
begin
 if not public.is_admin() then raise exception 'Akses admin diperlukan' using errcode='42501'; end if;
 select p.active_level into active from public.profiles p where p.id=learner;
 if not found then raise exception 'Pengguna tidak ditemukan' using errcode='P0002'; end if;
 with activity_rows as (
  select x.id,x.day,x.recorded_at as at,x.kind,coalesce(x.level,a.level) level,x.minutes,
    coalesce(x.material,p.title,l.title,nullif(q.topic,'Umum'),q.section) material
  from (select * from public.activity where user_id=learner order by day desc,recorded_at desc nulls last,id desc limit 12) x
  left join public.attempts a on a.id=x.id and a.user_id=learner
  left join public.questions q on q.id=a.question_id
  left join public.passages p on p.id=q.passage_id
  left join public.listening l on l.id=q.listening_id
 ), answer_rows as (
  select a.id,(a.created_at at time zone 'Asia/Jakarta')::date as day,a.created_at as at,
   case when q.passage_id is not null then 'membaca'::public.study_kind
    when q.listening_id is not null then 'mendengar'::public.study_kind else 'latihan'::public.study_kind end kind,
   a.level,null::int minutes,coalesce(p.title,l.title,nullif(q.topic,'Umum'),q.section) material
  from (select * from public.attempts where user_id=learner order by created_at desc,id desc limit 12) a
  left join public.questions q on q.id=a.question_id
  left join public.passages p on p.id=q.passage_id
  left join public.listening l on l.id=q.listening_id
  where not exists(select 1 from public.activity x where x.id=a.id and x.user_id=learner)
 ), recent as (
  select * from (select * from activity_rows union all select * from answer_rows) entries
  order by day desc,at desc nulls last,id desc limit 12
 ), active_results as (
  select count(*) answered,count(*) filter(where correct) correct from public.attempts where user_id=learner and level=active
 )
 select jsonb_build_object(
  'active_level',active,
  'words',jsonb_build_object(
   'done',(select count(*) from public.srs_cards s join public.vocabulary v on v.id=s.vocabulary_id where s.user_id=learner and s.repetitions>=3 and v.level=active),
   'total',(select count(*) from public.vocabulary v where v.level=active)),
  'kanji',jsonb_build_object(
   'done',(select count(*) from public.srs_cards s join public.kanji k on k.id=s.kanji_id where s.user_id=learner and s.repetitions>=3 and k.level=active),
   'total',(select count(*) from public.kanji k where k.level=active)),
  'grammar',jsonb_build_object(
   'done',(select count(*) from public.user_progress u join public.grammar_points g on g.id=u.grammar_id where u.user_id=learner and g.level=active),
   'total',(select count(*) from public.grammar_points g where g.level=active)),
  'practice',(select to_jsonb(active_results) from active_results),
  'week_minutes',(select coalesce(sum(minutes),0) from public.activity where user_id=learner and day between public.jakarta_today()-6 and public.jakarta_today()),
  'plan',(select jsonb_build_object(
    'level',p.level,'done',count(t.id) filter(where t.completed_at is not null),'total',count(t.id),
    'next_kind',(select s.kind from public.study_tasks s where s.plan_id=p.id and s.completed_at is null order by s.due_date,s.id limit 1),
    'next_date',(select s.due_date from public.study_tasks s where s.plan_id=p.id and s.completed_at is null order by s.due_date,s.id limit 1)
   ) from public.study_plans p left join public.study_tasks t on t.plan_id=p.id where p.user_id=learner group by p.id),
  'recent',coalesce((select jsonb_agg(to_jsonb(recent) order by day desc,at desc nulls last,id desc) from recent),'[]'::jsonb)
 ) into result;
 return result;
end $$;
revoke execute on function public.admin_learning_users(text,int),public.admin_learning_progress(uuid) from public,anon;
grant execute on function public.admin_learning_users(text,int),public.admin_learning_progress(uuid) to authenticated;
commit;
