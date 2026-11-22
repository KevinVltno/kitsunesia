begin;
create or replace function public.make_plan(template uuid, exam date, minutes int, weekdays int[]) returns uuid
language plpgsql security definer set search_path='' as $$
declare t public.study_plan_templates; plan uuid; start_on date:=public.jakarta_today(); finish_on date; i int; slot int:=0;
begin
 if auth.uid() is null then raise exception 'Silakan masuk'; end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 select * into strict t from public.study_plan_templates where id=template;
 if exam < start_on or weekdays is null or array_position(weekdays,null) is not null then raise exception 'Level atau tanggal ujian tidak valid'; end if;
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
create or replace function public.save_question(data jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
declare q uuid:=coalesce((data->>'id')::uuid,gen_random_uuid());
 reading uuid:=nullif(data->>'passage_id','')::uuid;
 audio uuid:=nullif(data->>'listening_id','')::uuid;
 question_level public.jlpt_level:=(data->>'level')::public.jlpt_level;
begin
 if not public.is_admin() then raise exception 'Akses admin diperlukan'; end if;
 if coalesce((data->>'placement')::boolean,false) and num_nonnulls(reading,audio)>0 then
  raise exception 'Soal penempatan harus dapat dikerjakan tanpa materi terkait';
 end if;
 if reading is not null then
  if coalesce(nullif(data->>'section',''),'dokkai')<>'dokkai' then raise exception 'Gunakan bagian dokkai untuk soal bacaan'; end if;
  perform 1 from public.passages where id=reading and level=question_level for update;
  if not found then raise exception 'Level soal harus sama dengan level bacaan'; end if;
  if (select count(*) from public.questions where passage_id=reading and id<>q)>=3 then
   raise exception 'Setiap bacaan memiliki maksimal tiga soal';
  end if;
 end if;
 if audio is not null and not exists(select 1 from public.listening where id=audio and level=question_level) then
  raise exception 'Level soal harus sama dengan level audio';
 end if;
 if audio is not null and (coalesce(nullif(data->>'section',''),'choukai')<>'choukai' or coalesce(trim(data->>'transcript'),'')='') then
  raise exception 'Gunakan bagian choukai dan isi transkrip untuk soal audio';
 end if;
 insert into public.questions(id,level,prompt,options,passage_id,listening_id,section,placement) values(
 q,question_level,data->>'prompt',array(select jsonb_array_elements_text(data->'options')),reading,audio,coalesce(nullif(data->>'section',''),case when reading is not null then 'dokkai' when audio is not null then 'choukai' else 'moji-goi' end),coalesce((data->>'placement')::boolean,false))
 on conflict(id) do update set level=excluded.level,prompt=excluded.prompt,options=excluded.options,passage_id=excluded.passage_id,listening_id=excluded.listening_id,section=excluded.section,placement=excluded.placement;
 insert into public.answer_keys values(q,array(select jsonb_array_elements_text(data->'answers')),data->>'explanation',data->>'transcript')
 on conflict(question_id) do update set answers=excluded.answers,explanation=excluded.explanation,transcript=excluded.transcript;
 return q;
end $$;
create function public.set_attempt_level() returns trigger language plpgsql set search_path='' as $$
begin
 select level into new.level from public.questions where id=new.question_id;
 return new;
end $$;
create trigger set_attempt_level before insert on public.attempts for each row execute function public.set_attempt_level();
revoke execute on function public.set_attempt_level() from public,anon,authenticated;
create function public.placement_answer(event_id uuid, question uuid, reply text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare k public.answer_keys;
begin
 if auth.uid() is null or reply is null or length(trim(reply)) not between 1 and 400 then raise exception 'Jawaban tidak valid'; end if;
 select a.* into strict k from public.answer_keys a join public.questions q on q.id=a.question_id where q.id=question and q.placement;
 return jsonb_build_object('id',event_id,'question_id',question,'response',reply,'correct',
  exists(select 1 from unnest(k.answers) x where lower(trim(normalize(x,NFKC)))=lower(trim(normalize(reply,NFKC)))),
  'explanation',k.explanation,'transcript',null,'created_at',now());
end $$;
revoke execute on function public.placement_answer(uuid,uuid,text) from public,anon;
grant execute on function public.placement_answer(uuid,uuid,text) to authenticated;
create view public.bookmark_entries with (security_invoker=true) as
 select b.id,b.user_id,coalesce(v.level,k.level,b.level) level,
  coalesce(v.japanese,k.character,b.sentence) title,
  coalesce(v.meaning,k.meaning,'') meaning,
  coalesce(v.reading,k.onyomi,'') reading
 from public.bookmarks b left join public.vocabulary v on v.id=b.vocabulary_id left join public.kanji k on k.id=b.kanji_id;
revoke all on public.bookmark_entries from anon,authenticated;
grant select on public.bookmark_entries to authenticated;
create function public.daily_stats() returns jsonb
language sql stable security invoker set search_path='' as $$
 with studied as (
  select distinct day from public.activity where user_id=auth.uid() and minutes>0 and day<=public.jakarta_today()
 ), numbered as (select day,row_number() over(order by day desc)::int n from studied),
 start as (select coalesce(max(day),public.jakarta_today()-2) as day from studied)
 select jsonb_build_object(
  'days',(select count(*) from numbered,start where start.day>=public.jakarta_today()-1 and numbered.day=start.day-(n-1)),
  'minutes',coalesce(sum(minutes),0),'cards',count(*) filter(where card_review or kind='kosakata'))
 from public.activity where user_id=auth.uid() and day=public.jakarta_today()
$$;
revoke execute on function public.daily_stats() from public,anon;
grant execute on function public.daily_stats() to authenticated;
commit;
