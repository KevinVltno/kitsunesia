-- Enum changes are committed before the updated routines use the new activities.
alter type public.study_kind add value if not exists 'kanji';
alter type public.study_kind add value if not exists 'bunpou';

begin;
create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
alter type public.jlpt rename to jlpt_level;
alter table public.profiles add column active_level public.jlpt_level not null default 'N5',
 add column level_selected boolean not null default false,
 add column new_card_limit int not null default 10 check(new_card_limit between 1 and 100);
grant update(active_level,level_selected,new_card_limit) on public.profiles to authenticated;
alter table public.kana add column level public.jlpt_level not null default 'N5',
 add column category text not null default 'dasar' check(category in ('dasar','dakuten','yoon')),
 add column audio_path text;
alter table public.vocabulary add column romaji text not null default '',
 add column part_of_speech text not null default 'kosakata',
 add column example_translation text not null default '',
 add column audio_path text;
alter table public.questions add column section text not null default 'moji-goi'
 check(section in ('moji-goi','bunpou','dokkai','choukai')),
 add column placement boolean not null default false;
update public.questions set section=case when passage_id is not null then 'dokkai' when listening_id is not null then 'choukai' else 'moji-goi' end;
update public.questions set section='bunpou' where id='00000000-0000-4000-8000-000000000019';
alter table public.attempts add column level public.jlpt_level;
update public.attempts a set level=q.level from public.questions q where q.id=a.question_id;
create view public.reading_passages with (security_invoker=true) as select * from public.passages;
create view public.listening_items with (security_invoker=true) as select * from public.listening;
revoke all on public.reading_passages,public.listening_items from anon,authenticated;
grant select,insert,update,delete on public.reading_passages,public.listening_items to authenticated;

create table public.level_targets (
 level public.jlpt_level primary key, vocabulary int not null check(vocabulary>0),
 kanji int not null check(kanji>0), grammar int not null check(grammar>0)
);
create table public.kanji (
 id uuid primary key default gen_random_uuid(), level public.jlpt_level not null,
 character text not null unique check(char_length(character)=1), onyomi text not null, kunyomi text not null,
 meaning text not null, strokes int not null check(strokes between 1 and 64), examples text not null, stroke_path text
);
create table public.grammar_points (
 id uuid primary key default gen_random_uuid(), level public.jlpt_level not null,
 pattern text not null, explanation text not null, formula text not null,
 examples text not null, common_errors text not null
);
create table public.user_progress (
 user_id uuid not null references public.profiles on delete cascade,
 grammar_id uuid not null references public.grammar_points on delete cascade,
 mastered_at timestamptz not null default now(), primary key(user_id,grammar_id)
);
create table public.srs_cards (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade,
 vocabulary_id uuid references public.vocabulary on delete cascade, kanji_id uuid references public.kanji on delete cascade,
 repetitions int not null default 0, ease numeric not null default 2.5, interval_days int not null default 0,
 due_date date not null default public.jakarta_today(), introduced_on date not null default public.jakarta_today(),
 check(num_nonnulls(vocabulary_id,kanji_id)=1), unique(user_id,vocabulary_id),unique(user_id,kanji_id)
);
create table public.srs_events (
 id uuid primary key, user_id uuid not null references public.profiles on delete cascade
);
alter table public.activity add column card_review boolean not null default false;
alter table public.bookmarks add column kanji_id uuid references public.kanji on delete cascade;
alter table public.bookmarks add column level public.jlpt_level not null default 'N5';
alter table public.bookmarks drop constraint if exists bookmarks_check;
alter table public.bookmarks drop constraint if exists bookmarks_user_id_sentence_key;
alter table public.bookmarks add check(num_nonnulls(vocabulary_id,sentence,kanji_id)=1), add unique(user_id,kanji_id);
alter table public.bookmarks add unique(user_id,level,sentence);
create index bookmarks_level_page on public.bookmarks(user_id,level,id);

create index srs_due on public.srs_cards(user_id,due_date);
create index srs_introduced on public.srs_cards(user_id,introduced_on);
create index attempts_level_date on public.attempts(user_id,level,created_at desc);
create index questions_section_level on public.questions(level,section,id);
create index placement_level on public.questions(level,id) where placement;
create index questions_passage on public.questions(passage_id) where passage_id is not null;
create index questions_listening on public.questions(listening_id) where listening_id is not null;
create index kana_level_position on public.kana(level,script,category,position);
create index profiles_name_page on public.profiles(name,id);
create index notes_user_order on public.notes(user_id,created_at desc,id);
do $$
declare t text; pair text[]; op_schema text;
begin
 select n.nspname into op_schema from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='pg_trgm';
 foreach t in array array['level_targets','kanji','grammar_points'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  execute format('create policy content_read on public.%I for select to authenticated using(true)',t);
  execute format('create policy admin_write on public.%I for all to authenticated using(public.is_admin()) with check(public.is_admin())',t);
 end loop;
 foreach t in array array['user_progress','srs_cards','srs_events'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
  execute format('create policy own_read on public.%I for select to authenticated using(user_id=auth.uid())',t);
 end loop;
 foreach pair slice 1 in array array[
  ['vocabulary','japanese'],['vocabulary','reading'],['vocabulary','meaning'],['vocabulary','topic'],['vocabulary','part_of_speech'],
  ['kanji','character'],['kanji','meaning'],['kanji','onyomi'],['kanji','kunyomi'],
  ['grammar_points','pattern'],['passages','title'],['listening','title'],['questions','prompt'],
  ['study_plan_templates','title'],['profiles','name'],['notes','body'],['bookmarks','sentence'],['attempts','response'],['kana','glyph'],['kana','romaji']
 ] loop
  execute format('create index %I on public.%I using gin (%I %I.gin_trgm_ops)',pair[1]||'_'||pair[2]||'_search',pair[1],pair[2],op_schema);
  if pair[1] not in ('profiles','notes','bookmarks','attempts','kana') then
   execute format('create index %I on public.%I (level,%I,id)',pair[1]||'_'||pair[2]||'_page',pair[1],pair[2]);
  end if;
 end loop;
end $$;
revoke insert,delete on public.level_targets from authenticated;
revoke update on public.level_targets from authenticated;
grant update(vocabulary,kanji,grammar) on public.level_targets to authenticated;
create unique index vocabulary_identity on public.vocabulary(level,japanese,reading);
create unique index grammar_identity on public.grammar_points(level,pattern);
create unique index standalone_question_identity on public.questions(level,section,prompt) where passage_id is null and listening_id is null;

insert into public.srs_cards(user_id,vocabulary_id,repetitions,ease,interval_days,due_date,introduced_on)
select user_id,vocabulary_id,repetitions,ease,interval_days,due_date,least(due_date,public.jakarta_today()-1) from public.reviews;
update public.profiles p set active_level=s.level,level_selected=true from public.study_plans s where p.id=s.user_id;

create function public.study_level_summary() returns jsonb
language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(x) order by x.level),'[]'::jsonb) from (
  select t.*,
   (select count(*) from public.vocabulary v where v.level<=t.level) vocabulary_available,
   (select count(*) from public.kanji k where k.level<=t.level) kanji_available,
   (select count(*) from public.grammar_points g where g.level<=t.level) grammar_available,
   (select count(*) from public.srs_cards s join public.vocabulary v on v.id=s.vocabulary_id where s.user_id=auth.uid() and s.repetitions>=3 and v.level<=t.level) vocabulary_mastered,
   (select count(*) from public.srs_cards s join public.kanji k on k.id=s.kanji_id where s.user_id=auth.uid() and s.repetitions>=3 and k.level<=t.level) kanji_mastered,
   (select count(*) from public.user_progress u join public.grammar_points g on g.id=u.grammar_id where u.user_id=auth.uid() and g.level<=t.level) grammar_mastered,
   (select count(*) from public.attempts a where a.user_id=auth.uid() and a.level=t.level) answers,
   (select count(*) from public.attempts a where a.user_id=auth.uid() and a.level=t.level and a.correct) correct
  from public.level_targets t
 ) x
$$;

create function public.srs_deck(content_kind text, target_level public.jlpt_level, query text default '', topic_filter text default '', type_filter text default '')
returns jsonb language sql stable security invoker set search_path='' as $$
 with catalog as (
  select v.id, v.japanese front, v.reading, v.meaning, v.romaji, v.example, v.example_translation, v.topic, v.part_of_speech, v.audio_path
  from public.vocabulary v where content_kind='kosakata' and v.level=target_level
  union all
  select k.id,k.character,concat_ws(' · ',nullif(k.onyomi,''),nullif(k.kunyomi,'')),k.meaning,'',k.examples,'','','kanji',null
  from public.kanji k where content_kind='kanji' and k.level=target_level
 ), limits as (
  select greatest(0,p.new_card_limit-(select count(*) from public.srs_cards where user_id=p.id and introduced_on=public.jakarta_today()))::int as available
  from public.profiles p where p.id=auth.uid()
 ), candidates as (
  select c.*,s.id is null as new_card,s.due_date
  from catalog c left join public.srs_cards s on s.user_id=auth.uid() and
   (case when content_kind='kosakata' then s.vocabulary_id else s.kanji_id end)=c.id
  where (topic_filter='' or topic=topic_filter) and (type_filter='' or part_of_speech=type_filter)
  and (query='' or front ilike '%'||query||'%' or reading ilike '%'||query||'%' or meaning ilike '%'||query||'%' or topic ilike '%'||query||'%')
  and (s.id is null or s.due_date<=public.jakarta_today())
 ), queue as (
  (select * from candidates where not new_card order by due_date,id limit 20)
  union all
  (select * from candidates where new_card order by id limit least(20,coalesce((select available from limits),0)))
 )
 select coalesce(jsonb_agg(to_jsonb(queue) order by new_card,due_date,id),'[]'::jsonb) from queue
$$;

create function public.rate_card(event_id uuid, content_kind public.study_kind, content_id uuid, quality int, elapsed int, task_id uuid default null)
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
 update public.activity set card_review=true where id=event_id and user_id=uid;
 insert into public.user_achievements(user_id,code)
 select uid,a.code from public.achievements a where a.code='words100'
 and (select count(*) from public.srs_cards s where s.user_id=uid and s.vocabulary_id is not null and repetitions>=3)>=100
 on conflict do nothing;
end $$;

create function public.complete_grammar(event_id uuid, point uuid, elapsed int, task_id uuid default null)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Silakan masuk'; end if;
 insert into public.user_progress(user_id,grammar_id) values(auth.uid(),point) on conflict do nothing;
 perform public.log_study(event_id,'bunpou',elapsed,task_id);
end $$;

create function public.import_content(kind text, items jsonb, apply_changes boolean default false) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare item jsonb; errors jsonb:='[]'; n int:=1; accepted int:=0; seen text[]:='{}'; fingerprint text; lev public.jlpt_level;
 passage uuid; audio_ref uuid; placement boolean; linked_count int; seen_passages uuid[]:='{}';
begin
 if not public.is_admin() then raise exception 'Akses admin diperlukan'; end if;
 if kind not in ('vocabulary','kanji','grammar_points','questions') or jsonb_typeof(items)<>'array' or jsonb_array_length(items)>500 then raise exception 'Jenis atau ukuran impor tidak valid (maksimal 500 baris)'; end if;
 for item in select value from jsonb_array_elements(items) loop
  n:=n+1;
  begin
   lev:=(item->>'level')::public.jlpt_level;
   if lev is null then raise exception 'Level wajib diisi'; end if;
   if kind='vocabulary' then
    if coalesce(trim(item->>'japanese'),'')='' or coalesce(trim(item->>'reading'),'')='' or coalesce(trim(item->>'meaning'),'')='' or coalesce(trim(item->>'topic'),'')='' or coalesce(trim(item->>'part_of_speech'),'')='' then raise exception 'Kata, bacaan, arti, topik, dan jenis kata wajib diisi'; end if;
    fingerprint:=concat_ws('|',lev,item->>'japanese',item->>'reading');
    if exists(select 1 from public.vocabulary where level=lev and japanese=item->>'japanese' and reading=item->>'reading') then raise exception 'Kosakata sudah ada'; end if;
    if apply_changes then insert into public.vocabulary(level,japanese,reading,meaning,topic,romaji,part_of_speech,example,example_translation,audio_path)
    values(lev,item->>'japanese',item->>'reading',item->>'meaning',item->>'topic',coalesce(item->>'romaji',''),item->>'part_of_speech',coalesce(item->>'example',''),coalesce(item->>'example_translation',''),nullif(item->>'audio_path','')); end if;
   elsif kind='kanji' then
    if coalesce(char_length(item->>'character'),0)<>1 or coalesce(trim(item->>'meaning'),'')='' or coalesce((item->>'strokes')::int,0) not between 1 and 64 then raise exception 'Karakter, arti, dan jumlah goresan 1–64 wajib diisi'; end if;
    fingerprint:=item->>'character';
    if exists(select 1 from public.kanji where character=fingerprint) then raise exception 'Kanji sudah ada'; end if;
    if apply_changes then insert into public.kanji(level,character,meaning,onyomi,kunyomi,strokes,examples,stroke_path)
    values(lev,fingerprint,item->>'meaning',coalesce(item->>'onyomi',''),coalesce(item->>'kunyomi',''),(item->>'strokes')::int,coalesce(item->>'examples',''),nullif(item->>'stroke_path','')); end if;
   elsif kind='grammar_points' then
    if coalesce(trim(item->>'pattern'),'')='' or coalesce(trim(item->>'explanation'),'')='' or coalesce(trim(item->>'formula'),'')='' or coalesce(trim(item->>'examples'),'')='' or coalesce(trim(item->>'common_errors'),'')='' then raise exception 'Pola, penjelasan, rumus, contoh, dan kesalahan umum wajib diisi'; end if;
    fingerprint:=concat_ws('|',lev,item->>'pattern');
    if exists(select 1 from public.grammar_points where level=lev and pattern=item->>'pattern') then raise exception 'Pola sudah ada'; end if;
    if apply_changes then insert into public.grammar_points(level,pattern,explanation,formula,examples,common_errors)
    values(lev,item->>'pattern',item->>'explanation',item->>'formula',item->>'examples',item->>'common_errors'); end if;
   else
    if coalesce(item->>'section','') not in ('moji-goi','bunpou','dokkai','choukai') or coalesce(trim(item->>'prompt'),'')='' or coalesce(trim(item->>'explanation'),'')='' or coalesce(jsonb_array_length(item->'answers'),0)=0 then raise exception 'Bagian JLPT, pertanyaan, jawaban, dan pembahasan wajib diisi'; end if;
    if jsonb_array_length(item->'options')>0 and (jsonb_array_length(item->'options')<2 or not ((item->'options') @> (item->'answers')) or (select count(distinct value) from jsonb_array_elements_text(item->'options'))<>jsonb_array_length(item->'options')) then raise exception 'Pilihan harus unik dan mencakup jawaban'; end if;
    passage:=nullif(item->>'passage_id','')::uuid;
    audio_ref:=nullif(item->>'listening_id','')::uuid;
    placement:=coalesce(nullif(item->>'placement','')::boolean,false);
    if passage is not null and audio_ref is not null then raise exception 'Pilih satu jenis materi terkait'; end if;
    if placement and num_nonnulls(passage,audio_ref)>0 then raise exception 'Soal penempatan tidak boleh memerlukan materi terkait'; end if;
    if passage is not null then
     if item->>'section'<>'dokkai' or not exists(select 1 from public.passages where id=passage and level=lev) then raise exception 'Bacaan harus satu level dengan soal dan berada di bagian dokkai'; end if;
     select count(*) into linked_count from public.questions where passage_id=passage;
     if not apply_changes then linked_count:=linked_count+(select count(*) from unnest(seen_passages) x where x=passage); end if;
     if linked_count>=3 then raise exception 'Bacaan sudah memiliki tiga soal'; end if;
    end if;
    if audio_ref is not null and (item->>'section'<>'choukai' or not exists(select 1 from public.listening where id=audio_ref and level=lev) or coalesce(trim(item->>'transcript'),'')='') then raise exception 'Soal choukai memerlukan audio selevel dan transkrip'; end if;
    fingerprint:=concat_ws('|',lev,item->>'section',item->>'prompt',coalesce(passage::text,''),coalesce(audio_ref::text,''));
    if exists(select 1 from public.questions where level=lev and section=item->>'section' and prompt=item->>'prompt' and passage_id is not distinct from passage and listening_id is not distinct from audio_ref) then raise exception 'Soal sudah ada'; end if;
    if fingerprint=any(seen) then raise exception 'Duplikat dalam CSV'; end if;
    if apply_changes then perform public.save_question((item-'id')||jsonb_build_object('placement',placement)); end if;
    if passage is not null then seen_passages:=array_append(seen_passages,passage); end if;
   end if;
   if fingerprint=any(seen) then raise exception 'Duplikat dalam CSV'; end if;
   seen:=array_append(seen,fingerprint);accepted:=accepted+1;
  exception when others then errors:=errors||jsonb_build_array(jsonb_build_object('row',n,'message',sqlerrm));
  end;
 end loop;
 return jsonb_build_object('accepted',accepted,'errors',errors);
end $$;

revoke execute on function public.study_level_summary(),public.srs_deck(text,public.jlpt_level,text,text,text),public.rate_card(uuid,public.study_kind,uuid,int,int,uuid),public.complete_grammar(uuid,uuid,int,uuid),public.import_content(text,jsonb,boolean) from public,anon;
grant execute on function public.study_level_summary(),public.srs_deck(text,public.jlpt_level,text,text,text),public.rate_card(uuid,public.study_kind,uuid,int,int,uuid),public.complete_grammar(uuid,uuid,int,uuid),public.import_content(text,jsonb,boolean) to authenticated;
-- The legacy review RPC would bypass the new daily cap.
revoke execute on function public.review_word(uuid,uuid,int,int,uuid) from authenticated;
commit;
