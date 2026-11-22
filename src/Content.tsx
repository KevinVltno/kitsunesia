import {useRef,useState} from 'react'
import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {Link,useSearchParams} from 'react-router-dom'
import {BookmarkPlus,Eye} from 'lucide-react'
import {db,needDb,reject,rpc,type Bookmark,type Grammar,type Kanji} from './data'
import {useLessonLevel} from './Levels'
import {Pages,Search,usePage,usePaging} from './Paging'
import {Empty,ErrorLine,Title,useElapsed} from './ui'

export function SaveBookmark({word,kanji,sentence}:{word?:string;kanji?:string;sentence?:string}){
 const {level}=useLessonLevel()
 const [saved,setSaved]=useState<string|null|undefined>()
 const cache=useQueryClient()
 const column=word?'vocabulary_id':kanji?'kanji_id':'sentence'
 const value=word??kanji??sentence??''
 const item=useQuery({queryKey:['bookmarks',column,value,sentence?level:null],enabled:!!db&&!!value,queryFn:async()=>{
  const query=needDb().from('bookmarks').select('id').eq(column,value)
  if(sentence)query.eq('level',level)
  const r=await query.maybeSingle()
  reject(r.error)
  return (r.data as Pick<Bookmark,'id'>|null)?.id??null
 }})
 const active=saved===undefined?item.data:saved
 const change=useMutation({mutationFn:async()=>{
  const table=needDb().from('bookmarks')
  if(active){reject((await table.delete().eq('id',active)).error);return null}
  const r=await table.insert({[column]:value,level}).select('id').single()
  reject(r.error)
  return r.data!.id as string
 },onSuccess:async id=>{setSaved(id);await Promise.all([cache.invalidateQueries({queryKey:['bookmarks']}),cache.invalidateQueries({queryKey:['bookmark_entries']})]);setSaved(undefined)}})
 return <><button className="secondary" aria-pressed={!!active} disabled={!db||item.isPending||change.isPending} onClick={()=>change.mutate()}><BookmarkPlus size={16}/>{active?'Hapus bookmark':'Simpan bookmark'}</button><ErrorLine error={item.error||change.error}/></>
}
const bundledAudio=Object.fromEntries(Object.entries(import.meta.glob<string>('../supabase/audio/**/*.mp3',{eager:true,query:'?url',import:'default'})).map(([file,url])=>{
 const path=file.replace('../supabase/audio/','')
 return [path.includes('/')?path:'seed/'+path,url]
}))
export function useAudioUrl(path:string|null|undefined){
 return useQuery({queryKey:['audio-url',path],enabled:!!path&&(!!db||!!bundledAudio[path]),staleTime:30*60_000,queryFn:async()=>{
  if(path&&Object.hasOwn(bundledAudio,path))return bundledAudio[path]
  const r=await needDb().storage.from('learning-audio').createSignedUrl(path!,3600)
  reject(r.error);return r.data!.signedUrl
 }})
}
export function Media({path}:{path:string}){
 const url=useAudioUrl(path)
 const player=useRef<HTMLAudioElement>(null)
 const [error,setError]=useState('')
 return <><ErrorLine error={url.error||error&&new Error(error)}/>{url.isPending?<p>Memuat audio…</p>:url.data&&<div className="toolbar"><audio ref={player} controls src={url.data} onError={()=>setError('Audio gagal dimuat.')}/><button className="secondary" onClick={()=>{if(player.current){player.current.currentTime=0;void player.current.play().catch(()=>setError('Audio gagal diputar.'))}}}>Putar ulang</button></div>}</>
}

type Card={id:string;front:string;reading:string;meaning:string;romaji:string;example:string;example_translation:string;topic:string;part_of_speech:string;audio_path:string|null;new_card:boolean}
export function Deck({kind}:{kind:'kosakata'|'kanji'}){
 const {level,task}=useLessonLevel()
 const [params]=useSearchParams()
 const [search,setSearch]=useState('')
 const [topic,setTopic]=useState(params.get('topik')??'')
 const [type,setType]=useState('')
 const [flipped,setFlipped]=useState(false)
 const [notice,setNotice]=useState('')
 const elapsed=useElapsed()
 const cache=useQueryClient()
 const event=useRef(crypto.randomUUID())
 const cards=useQuery({queryKey:['srs',kind,level,search,topic,type],enabled:!!db,queryFn:()=>rpc<Card[]>('srs_deck',{content_kind:kind,target_level:level,query:search.trim(),topic_filter:topic.trim(),type_filter:type.trim()})})
 const card=cards.data?.[0]
 const review=useMutation({mutationFn:(quality:number)=>rpc('rate_card',{event_id:event.current,content_kind:kind,content_id:card!.id,quality,elapsed:elapsed.minutes(),task_id:task}),onSuccess:async()=>{
  setFlipped(false);setNotice('Ulasan tersimpan. Jadwal kartu diperbarui.');elapsed.reset();event.current=crypto.randomUUID()
  await cache.invalidateQueries()
 }})
 function filter(set:(value:string)=>void,value:string){set(value);setFlipped(false);setNotice('')}
 return <><Search value={search} onChange={v=>filter(setSearch,v)}>{kind==='kosakata'&&<><label>Topik (nama persis)<input value={topic} onChange={e=>filter(setTopic,e.target.value)}/></label><label>Jenis kata (nama persis)<input value={type} onChange={e=>filter(setType,e.target.value)}/></label></>}</Search>
 <ErrorLine error={cards.error||review.error}/>{notice&&<p className="success" role="status">{notice}</p>}
 {db&&cards.isPending?<p>Memuat kartu…</p>:card?<section className="panel content-card flashcard"><div className="section-line"><span className="level-pill">{level}</span><span>{card.new_card?'Kartu baru':'Ulasan jatuh tempo'}</span></div><div className="flash-face"><strong lang="ja">{card.front}</strong>{flipped?<><p lang="ja">{card.reading} {card.romaji&&'· '+card.romaji}</p><h2>{card.meaning}</h2><p lang="ja">{card.example}</p><p>{card.example_translation}</p>{card.audio_path&&<Media path={card.audio_path}/>}</>:<button className="primary" onClick={()=>setFlipped(true)}><Eye size={17}/> Lihat arti</button>}</div>
 {flipped&&<><p>Seberapa baik kamu mengingatnya?</p><div className="ratings">{['Tidak ingat','Keliru','Hampir ingat','Sulit','Cukup lancar','Lancar'].map((label,i)=><button className="secondary" key={label} disabled={review.isPending} onClick={()=>review.mutate(i)}>{label}</button>)}</div></>}
 <SaveBookmark key={card.id} word={kind==='kosakata'?card.id:undefined} kanji={kind==='kanji'?card.id:undefined}/></section>:<Empty>{db?'Tidak ada kartu jatuh tempo yang cocok, atau jatah kartu baru hari ini sudah habis.':'Hubungkan Supabase untuk membuka kartu.'}</Empty>}</>
}
export function Vocabulary(){
 const {level}=useLessonLevel()
 const [params]=useSearchParams()
 const [catalog,setCatalog]=useState(!!params.get('topik'))
 return <><Title title="Kosakata">JLPT {level} · Pelajari kata baru dan ulangi dengan SM-2.</Title><div className="toolbar"><button className="secondary" aria-pressed={catalog} onClick={()=>setCatalog(!catalog)}>{catalog?'Buka kartu hafalan':'Buka daftar kosakata'}</button></div>{catalog?<WordCatalog key={level}/>:<Deck key={level} kind="kosakata"/>}</>
}
type WordRow={id:string;japanese:string;reading:string;romaji:string;meaning:string;part_of_speech:string;topic:string;example:string;example_translation:string;audio_path:string|null}
function WordCatalog(){
 const {level}=useLessonLevel()
 const [params]=useSearchParams()
 const topic=params.get('topik')
 const p=usePaging()
 const items=usePage<WordRow>('vocabulary',{...p,level,columns:['japanese','reading','meaning','topic','part_of_speech'],sort:'japanese',filters:topic?{topic}:{}})
 return <>{topic&&<p className="muted">Topik {topic} · <Link to="/jalur">Jalur belajar</Link></p>}<Search value={p.search} onChange={p.setSearch}/><ErrorLine error={items.error}/>{items.data?.items.map(w=><article key={w.id} className="panel content-card stack"><h2 lang="ja"><ruby>{w.japanese}<rt>{w.reading}</rt></ruby></h2><p>{[w.romaji,w.meaning,w.part_of_speech,w.topic].filter(Boolean).join(' · ')}</p>{w.example&&<p lang="ja">{w.example}</p>}{w.example_translation&&<p>{w.example_translation}</p>}{w.audio_path&&<Media path={w.audio_path}/>}<SaveBookmark word={w.id}/></article>)}<Pages page={p.page} count={items.data?.count??0} onChange={p.setPage}/>{items.data?.count===0&&<Empty>Belum ada kosakata yang cocok.</Empty>}</>
}
export function KanjiLesson(){
 const {level}=useLessonLevel()
 const [deck,setDeck]=useState(false)
 return <><Title title="Kanji">JLPT {level} · Bacaan, arti, dan urutan goresan.</Title><button className="secondary" aria-pressed={deck} onClick={()=>setDeck(!deck)}>{deck?'Lihat daftar kanji':'Buka kartu hafalan'}</button>{deck?<Deck key={level} kind="kanji"/>:<KanjiCatalog key={level}/>}</>
}
function KanjiCatalog(){
 const {level,task}=useLessonLevel()
 const p=usePaging()
 const data=usePage<Kanji>('kanji',{...p,level,columns:['character','meaning','onyomi','kunyomi'],sort:'character'})
 return <><Search value={p.search} onChange={p.setSearch}/><ErrorLine error={data.error}/>{data.data?.items.map(k=><article key={k.id} className="panel content-card stack"><div className="section-line"><h2 lang="ja" className="kanji-character">{k.character}</h2><span className="level-pill">{k.strokes} goresan</span></div><p>{k.meaning}</p><p>Onyomi {k.onyomi||'—'} · Kunyomi {k.kunyomi||'—'}</p><p>{k.examples}</p><div className="toolbar"><Link className="secondary" to={'/menulis?kanji='+k.id+(task?'&task='+task+'&level='+level+'&studyKind=kanji':'')}>Latihan goresan</Link><SaveBookmark kanji={k.id}/></div></article>)}<Pages page={p.page} count={data.data?.count??0} onChange={p.setPage}/>{(!db||data.data?.count===0)&&<Empty>Belum ada kanji yang cocok.</Empty>}</>
}
export function GrammarLesson(){
 const {level}=useLessonLevel()
 return <GrammarCatalog key={level}/>
}
function GrammarCatalog(){
 const {level,task}=useLessonLevel()
 const [params]=useSearchParams()
 const topic=params.get('topik')
 const p=usePaging()
 const data=usePage<Grammar>('grammar_points',{...p,level,columns:['pattern','topic'],sort:'pattern',filters:topic?{topic}:{}})
 return <><Title title="Tata bahasa">JLPT {level} · Pelajari pola, contoh, dan kesalahan umum.</Title>{topic&&<p className="muted">Topik {topic} · <Link to="/jalur">Jalur belajar</Link></p>}<Search value={p.search} onChange={p.setSearch}/><ErrorLine error={data.error}/>{data.data?.items.map(g=><article key={g.id} className="panel content-card stack"><h2 lang="ja">{g.pattern}</h2><p>{g.explanation}</p><div><strong>Rumus</strong><p>{g.formula}</p></div><div><strong>Contoh</strong><p>{g.examples}</p></div><div><strong>Kesalahan umum</strong><p>{g.common_errors}</p></div><GrammarFinish id={g.id} task={task}/></article>)}<Pages page={p.page} count={data.data?.count??0} onChange={p.setPage}/>{(!db||data.data?.count===0)&&<Empty>Belum ada pola yang cocok.</Empty>}</>
}
function GrammarFinish({id,task}:{id:string;task:string|null}){
 const cache=useQueryClient()
 const elapsed=useElapsed()
 const event=useRef(crypto.randomUUID())
 const done=useQuery({queryKey:['user_progress',id],queryFn:async()=>{
  const r=await needDb().from('user_progress').select('grammar_id').eq('grammar_id',id).maybeSingle()
  reject(r.error);return !!r.data
 }})
 const save=useMutation({mutationFn:()=>rpc('complete_grammar',{event_id:event.current,point:id,elapsed:elapsed.minutes(),task_id:task}),onSuccess:()=>cache.invalidateQueries()})
 return <><button className="primary" disabled={save.isPending||save.isSuccess||!!done.data&&!task} onClick={()=>save.mutate()}>{save.isSuccess||done.data&&!task?'Sudah dipelajari':'Tandai dipelajari'}</button><ErrorLine error={done.error||save.error}/></>
}
