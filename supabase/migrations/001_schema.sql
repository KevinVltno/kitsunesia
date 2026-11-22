begin;
create type public.jlpt as enum ('N5','N4','N3','N2','N1');
create type public.study_kind as enum ('huruf','menulis','kosakata','membaca','latihan','mendengar');
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 name text not null default '', role text not null default 'user' check(role in ('user','admin')),
 goal_minutes int not null default 20 check(goal_minutes between 1 and 240),
 goal_cards int not null default 10 check(goal_cards between 1 and 200)
);
create function public.new_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id,name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')); return new; end $$;
create trigger kitsunesia_profile after insert on auth.users for each row execute function public.new_profile();
insert into public.profiles(id) select id from auth.users on conflict do nothing;
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin')
$$;
create table public.kana (
 glyph text primary key, script text not null check(script in ('hiragana','katakana')),
 romaji text not null, position int not null
);
create table public.vocabulary (
 id uuid primary key default gen_random_uuid(), level public.jlpt not null, topic text not null,
 japanese text not null, reading text not null, meaning text not null, example text not null default ''
);
create table public.passages (
 id uuid primary key default gen_random_uuid(), level public.jlpt not null, title text not null,
 body text not null, translation text not null
);
create table public.listening (
 id uuid primary key default gen_random_uuid(), level public.jlpt not null, title text not null, path text not null
);
create table public.questions (
 id uuid primary key default gen_random_uuid(), level public.jlpt not null, prompt text not null,
 options text[] not null default '{}', passage_id uuid references public.passages on delete cascade,
 listening_id uuid references public.listening on delete cascade, check(num_nonnulls(passage_id,listening_id)<=1)
);
create table public.answer_keys (
 question_id uuid primary key references public.questions on delete cascade,
 answers text[] not null check(cardinality(answers)>0), explanation text not null, transcript text
);
create table public.study_plan_templates (
 id uuid primary key default gen_random_uuid(), level public.jlpt not null, title text not null,
 weeks int not null check(weeks between 1 and 52),
 activities public.study_kind[] not null check(cardinality(activities) between 1 and 20 and array_position(activities,null) is null)
);
create table public.study_plans (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade unique,
 template_id uuid references public.study_plan_templates on delete set null, level public.jlpt not null,
 exam_date date, daily_minutes int not null check(daily_minutes between 5 and 240),
 days int[] not null check(cardinality(days) between 1 and 7 and days <@ array[1,2,3,4,5,6,7]),
 start_date date not null
);
create table public.study_tasks (
 id uuid primary key default gen_random_uuid(), plan_id uuid not null references public.study_plans on delete cascade,
 due_date date not null, kind public.study_kind not null, minutes int not null check(minutes>0), completed_at timestamptz
);
create table public.bookmarks (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references public.profiles on delete cascade,
 vocabulary_id uuid references public.vocabulary on delete cascade, sentence text,
 check(num_nonnulls(vocabulary_id,sentence)=1), unique(user_id,vocabulary_id), unique(user_id,sentence)
);
create table public.notes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references public.profiles on delete cascade,
 body text not null check(length(trim(body))>0), created_at timestamptz not null default now()
);
create table public.achievements (
 code text primary key, title text not null, description text not null
);
create table public.user_achievements (
 user_id uuid references public.profiles on delete cascade, code text references public.achievements,
 earned_at timestamptz not null default now(), primary key(user_id,code)
);
create table public.reviews (
 user_id uuid references public.profiles on delete cascade, vocabulary_id uuid references public.vocabulary on delete cascade,
 repetitions int not null default 0, ease numeric not null default 2.5, interval_days int not null default 0,
 due_date date not null default current_date, primary key(user_id,vocabulary_id)
);
create table public.activity (
 id uuid primary key, user_id uuid not null references public.profiles on delete cascade,
 day date not null, kind public.study_kind not null, minutes int not null check(minutes between 0 and 240)
);
create index activity_user_day on public.activity(user_id,day desc);
create index study_tasks_plan_due on public.study_tasks(plan_id,due_date);
create table public.attempts (
 id uuid primary key, user_id uuid not null references public.profiles on delete cascade,
 question_id uuid references public.questions on delete set null, response text not null, correct boolean not null,
 explanation text not null, transcript text, created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon,authenticated;
grant select,update(name,goal_minutes,goal_cards) on public.profiles to authenticated;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy profile_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
do $$
declare t text;
begin
 foreach t in array array['kana','vocabulary','passages','listening','questions','study_plan_templates','achievements','answer_keys'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  execute format('create policy admin_write on public.%I for all to authenticated using(public.is_admin()) with check(public.is_admin())',t);
  if t <> 'answer_keys' then execute format('create policy content_read on public.%I for select to authenticated using(true)',t); end if;
 end loop;
 foreach t in array array['study_plans','bookmarks','notes','user_achievements','reviews','activity','attempts'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
  execute format('create policy own_read on public.%I for select to authenticated using(user_id=auth.uid())',t);
  if t in ('bookmarks','notes') then
   execute format('grant insert,update,delete on public.%I to authenticated',t);
   execute format('create policy own_write on public.%I for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid())',t);
  end if;
 end loop;
end $$;
alter table public.study_tasks enable row level security;
revoke all on public.study_tasks from authenticated,anon;
grant select on public.study_tasks to authenticated;
create policy tasks_read on public.study_tasks for select to authenticated using(exists(select 1 from public.study_plans p where p.id=plan_id and p.user_id=auth.uid()));
insert into storage.buckets(id,name,public) values('learning-audio','learning-audio',false) on conflict(id) do nothing;
create policy audio_read on storage.objects for select to authenticated using(bucket_id='learning-audio');
create policy audio_admin on storage.objects for all to authenticated using(bucket_id='learning-audio' and public.is_admin()) with check(bucket_id='learning-audio' and public.is_admin());

create function public.jakarta_today() returns date language sql stable set search_path='' as $$
 select (now() at time zone 'Asia/Jakarta')::date
$$;
create function public.make_plan(template uuid, exam date, minutes int, weekdays int[]) returns uuid
language plpgsql security definer set search_path='' as $$
declare t public.study_plan_templates; plan uuid; start_on date:=public.jakarta_today(); finish_on date; i int; slot int:=0;
begin
 if auth.uid() is null then raise exception 'Silakan masuk'; end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 select * into strict t from public.study_plan_templates where id=template;
 if t.level not in ('N5','N4') or exam < start_on or weekdays is null or array_position(weekdays,null) is not null then raise exception 'Level atau tanggal ujian tidak valid'; end if;
 finish_on:=least(start_on+t.weeks*7-1,coalesce(exam,start_on+t.weeks*7-1));
 if not exists(select 1 from generate_series(0,finish_on-start_on) as s(n) where extract(isodow from start_on+n)::int=any(weekdays)) then
  raise exception 'Tidak ada hari belajar sebelum tanggal ujian';
 end if;
 delete from public.study_plans where user_id=auth.uid();
 insert into public.study_plans(user_id,template_id,level,exam_date,daily_minutes,days,start_date)
 values(auth.uid(),template,t.level,exam,minutes,weekdays,start_on) returning id into plan;
 for i in 0..(finish_on-start_on) loop
  if extract(isodow from start_on+i)::int=any(weekdays) then
   insert into public.study_tasks(plan_id,due_date,kind,minutes)
   values(plan,start_on+i,t.activities[1+slot%cardinality(t.activities)],minutes);
   slot:=slot+1;
  end if;
 end loop;
 return plan;
end $$;
create function public.reschedule() returns int language plpgsql security definer set search_path='' as $$
declare p public.study_plans; t record; next_day date; n int:=0; today date:=public.jakarta_today();
begin
 if auth.uid() is null then raise exception 'Silakan masuk'; end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 select * into strict p from public.study_plans where user_id=auth.uid();
 next_day:=today;
 for t in select id from public.study_tasks where plan_id=p.id and due_date<today and completed_at is null order by due_date,id loop
  while extract(isodow from next_day)::int<>all(p.days) or exists(select 1 from public.study_tasks where plan_id=p.id and due_date=next_day) loop
   next_day:=next_day+1;
   exit when p.exam_date is not null and next_day>p.exam_date;
  end loop;
  exit when p.exam_date is not null and next_day>p.exam_date;
  update public.study_tasks set due_date=next_day where id=t.id;
  n:=n+1;
 end loop;
 return n;
end $$;
create function public.log_study(event_id uuid, activity_kind public.study_kind, elapsed int, task_id uuid default null) returns void
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); today date:=public.jakarta_today(); streak int; inserted uuid;
begin
 if uid is null then raise exception 'Silakan masuk'; end if;
 perform 1 from public.profiles where id=uid for update;
 insert into public.activity values(event_id,uid,today,activity_kind,elapsed) on conflict(id) do nothing returning id into inserted;
 if inserted is null then return; end if;
 if task_id is not null then
  update public.study_tasks t set completed_at=now() from public.study_plans p
  where t.plan_id=p.id and p.user_id=uid and t.id=task_id and t.kind=activity_kind and t.completed_at is null;
 else
  update public.study_tasks set completed_at=now() where id=(
   select t.id from public.study_tasks t join public.study_plans p on p.id=t.plan_id
   where p.user_id=uid and t.due_date=today and t.kind=activity_kind and t.completed_at is null order by t.id limit 1
  );
 end if;
 with days as (select distinct day from public.activity where user_id=uid and minutes>0),
 numbered as (select day,row_number() over(order by day desc)::int as n from days)
 select count(*) into streak from numbered where day=today-(n-1);
 insert into public.user_achievements(user_id,code)
 select uid,code from public.achievements where (code='streak7' and streak>=7)
 or (code='words100' and (select count(*) from public.reviews where user_id=uid and repetitions>=3)>=100)
 on conflict do nothing;
end $$;
create function public.review_word(event_id uuid, word uuid, quality int, elapsed int, task_id uuid default null) returns void
language plpgsql security definer set search_path='' as $$
declare r public.reviews; uid uuid:=auth.uid();
begin
 if uid is null or quality is null or quality not between 0 and 5 then raise exception 'Penilaian tidak valid'; end if;
 perform 1 from public.profiles where id=uid for update;
 if exists(select 1 from public.activity where id=event_id and user_id=uid) then return; end if;
 insert into public.reviews(user_id,vocabulary_id) values(uid,word) on conflict do nothing;
 select * into strict r from public.reviews where user_id=uid and vocabulary_id=word;
 if quality<3 then r.repetitions:=0; r.interval_days:=1;
 else
  r.interval_days:=case r.repetitions when 0 then 1 when 1 then 6 else round(r.interval_days*r.ease)::int end;
  r.repetitions:=r.repetitions+1;
 end if;
 r.ease:=greatest(1.3,r.ease+0.1-(5-quality)*(0.08+(5-quality)*0.02));
 update public.reviews set repetitions=r.repetitions,ease=r.ease,interval_days=r.interval_days,due_date=public.jakarta_today()+r.interval_days
 where user_id=uid and vocabulary_id=word;
 perform public.log_study(event_id,'kosakata',elapsed,task_id);
end $$;
create function public.submit_answer(event_id uuid, question uuid, reply text, session_minutes int default null, task_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare k public.answer_keys; a public.attempts; q public.questions; kind public.study_kind;
begin
 if auth.uid() is null then raise exception 'Silakan masuk'; end if;
 if reply is null or length(trim(reply)) not between 1 and 400 then raise exception 'Jawaban tidak valid'; end if;
 select * into strict k from public.answer_keys where question_id=question;
 select * into strict q from public.questions where id=question;
 insert into public.attempts(id,user_id,question_id,response,correct,explanation,transcript)
 values(event_id,auth.uid(),question,reply,exists(select 1 from unnest(k.answers) x where lower(trim(normalize(x,NFKC)))=lower(trim(normalize(reply,NFKC)))),k.explanation,k.transcript)
 on conflict(id) do nothing;
 select * into strict a from public.attempts where id=event_id and user_id=auth.uid();
 if session_minutes is not null and a.question_id=question then
  kind:=case when q.passage_id is not null then 'membaca' when q.listening_id is not null then 'mendengar' else 'latihan' end;
  perform public.log_study(event_id,kind,session_minutes,task_id);
 end if;
 return to_jsonb(a);
end $$;
create function public.save_question(data jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
declare q uuid:=coalesce((data->>'id')::uuid,gen_random_uuid());
 reading uuid:=nullif(data->>'passage_id','')::uuid;
 audio uuid:=nullif(data->>'listening_id','')::uuid;
 question_level public.jlpt:=(data->>'level')::public.jlpt;
begin
 if not public.is_admin() then raise exception 'Akses admin diperlukan'; end if;
 if reading is not null then
  perform 1 from public.passages where id=reading and level=question_level for update;
  if not found then raise exception 'Level soal harus sama dengan level bacaan'; end if;
  if (select count(*) from public.questions where passage_id=reading and id<>q)>=3 then
   raise exception 'Setiap bacaan memiliki maksimal tiga soal';
  end if;
 end if;
 if audio is not null and not exists(select 1 from public.listening where id=audio and level=question_level) then
  raise exception 'Level soal harus sama dengan level audio';
 end if;
 insert into public.questions(id,level,prompt,options,passage_id,listening_id) values(
 q,question_level,data->>'prompt',array(select jsonb_array_elements_text(data->'options')),reading,audio)
 on conflict(id) do update set level=excluded.level,prompt=excluded.prompt,options=excluded.options,passage_id=excluded.passage_id,listening_id=excluded.listening_id;
 insert into public.answer_keys values(q,array(select jsonb_array_elements_text(data->'answers')),data->>'explanation',data->>'transcript')
 on conflict(question_id) do update set answers=excluded.answers,explanation=excluded.explanation,transcript=excluded.transcript;
 return q;
end $$;
revoke execute on function public.new_profile() from public,anon,authenticated;
revoke execute on function public.make_plan(uuid,date,int,int[]),public.reschedule(),public.log_study(uuid,public.study_kind,int,uuid),public.review_word(uuid,uuid,int,int,uuid),public.submit_answer(uuid,uuid,text,int,uuid),public.save_question(jsonb),public.is_admin() from public,anon;
grant execute on function public.make_plan(uuid,date,int,int[]),public.reschedule(),public.log_study(uuid,public.study_kind,int,uuid),public.review_word(uuid,uuid,int,int,uuid),public.submit_answer(uuid,uuid,text,int,uuid),public.save_question(jsonb),public.is_admin() to authenticated;
commit;
