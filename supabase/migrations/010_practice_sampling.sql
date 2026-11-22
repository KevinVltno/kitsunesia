begin;
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
 insert into public.questions(id,level,prompt,options,passage_id,listening_id,section,placement,topic) values(
 q,question_level,data->>'prompt',array(select jsonb_array_elements_text(data->'options')),reading,audio,coalesce(nullif(data->>'section',''),case when reading is not null then 'dokkai' when audio is not null then 'choukai' else 'moji-goi' end),coalesce((data->>'placement')::boolean,false),coalesce(nullif(trim(data->>'topic'),''),'Umum'))
 on conflict(id) do update set level=excluded.level,prompt=excluded.prompt,options=excluded.options,passage_id=excluded.passage_id,listening_id=excluded.listening_id,section=excluded.section,placement=excluded.placement,topic=coalesce(nullif(trim(data->>'topic'),''),public.questions.topic);
 insert into public.answer_keys values(q,array(select jsonb_array_elements_text(data->'answers')),data->>'explanation',data->>'transcript')
 on conflict(question_id) do update set answers=excluded.answers,explanation=excluded.explanation,transcript=excluded.transcript;
 return q;
end $$;

create function public.sample_practice(target_level public.jlpt_level, target_topic text default null)
returns setof public.questions language sql volatile security invoker set search_path='' as $$
 select (s.item).* from (
  select q as item,row_number() over(partition by q.section order by random()) as position
  from public.questions q
  where q.level=target_level and not q.placement and (target_topic is null or q.topic=target_topic)
 ) s where s.position<=5
 order by case (s.item).section when 'moji-goi' then 1 when 'bunpou' then 2 when 'dokkai' then 3 else 4 end,s.position
$$;
revoke execute on function public.sample_practice(public.jlpt_level,text) from public,anon;
grant execute on function public.sample_practice(public.jlpt_level,text) to authenticated;
commit;
