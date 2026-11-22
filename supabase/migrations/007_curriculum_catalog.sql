begin;
alter table public.passages add column topic text not null default 'Umum';
alter table public.listening add column topic text not null default 'Umum';
alter table public.questions add column topic text not null default 'Umum';
alter table public.grammar_points add column topic text not null default 'Umum';
create or replace view public.reading_passages with (security_invoker=true) as select * from public.passages;
create or replace view public.listening_items with (security_invoker=true) as select * from public.listening;
create index passages_topic_page on public.passages(level,topic,title,id);
create index listening_topic_page on public.listening(level,topic,title,id);
create index questions_topic_page on public.questions(level,topic,section,id);
create index grammar_topic_page on public.grammar_points(level,topic,pattern,id);
create index vocabulary_topic_japanese_page on public.vocabulary(level,topic,japanese,id);
create table public.curriculum_units (
 id uuid primary key default gen_random_uuid(), level public.jlpt_level not null, position int not null check(position>0),
 topic text not null, title text not null, grammar_pattern text not null,
 passage_id uuid not null references public.passages on delete cascade,
 listening_id uuid not null references public.listening on delete cascade,
 unique(level,position),unique(level,topic)
);
alter table public.curriculum_units enable row level security;
revoke all on public.curriculum_units from anon,authenticated;
grant select on public.curriculum_units to authenticated;
create policy curriculum_read on public.curriculum_units for select to authenticated using(true);
commit;
