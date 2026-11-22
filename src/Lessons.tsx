import {useRef,useState} from 'react'
import {Link,useSearchParams} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Headphones,RotateCcw} from 'lucide-react'
import {db,needDb,reject,type Audio,type Passage,type Question} from './data'
import {useLessonLevel} from './Levels'
import {Pages,Search,usePage,usePaging} from './Paging'
import {SaveBookmark,useAudioUrl} from './Content'
import {Quiz,RubyText} from './Quiz'
import {Empty,ErrorLine,Title} from './ui'

function useQuestions(key:'passage_id'|'listening_id',id?:string){
 return useQuery({queryKey:['questions',key,id],enabled:!!db&&!!id,queryFn:async()=>{
  const r=await needDb().from('questions').select('*').eq(key,id!).order('id').limit(20)
  reject(r.error);return (r.data??[]) as Question[]
 }})
}
export function Reading(){
 const {level}=useLessonLevel()
 return <ReadingLevel key={level}/>
}
function ReadingLevel(){
 const {level,task}=useLessonLevel()
 const [params]=useSearchParams()
 const material=params.get('materi')
 const [selected,setSelected]=useState<Passage>()
 const p=usePaging()
 const list=usePage<Passage>('reading_passages',{...p,level,columns:['title','topic'],sort:'title',filters:material?{id:material}:{}})
 const current=selected??(material?list.data?.items[0]:undefined)
 return <><Title title="Membaca">JLPT {level} · Baca berita latihan, pengumuman, atau cerita pendek, lalu jawab soal.</Title>
 {current?<>{material?<Link className="secondary" to="/jalur">Kembali ke jalur belajar</Link>:<button className="secondary" onClick={()=>setSelected(undefined)}>Kembali ke daftar</button>}<ReadingItem item={current} task={task}/></>:material?<><Link className="secondary" to="/jalur">Kembali ke jalur belajar</Link><ErrorLine error={list.error}/>{list.isPending?<p role="status">Memuat materi…</p>:<Empty>Materi tidak tersedia di level aktif. <Link to="/membaca">Lihat daftar</Link></Empty>}</>:<><Search value={p.search} onChange={p.setSearch}><button type="button" className="secondary" aria-pressed={p.search==='Berita latihan'} onClick={()=>p.setSearch(p.search==='Berita latihan'?'':'Berita latihan')}>Berita singkat</button></Search><ErrorLine error={list.error}/>{list.data?.items.map(item=><button className="panel content-card list-choice" key={item.id} onClick={()=>setSelected(item)}>{item.title}</button>)}{(!db||list.data?.count===0)&&<Empty>Belum ada bacaan yang cocok.</Empty>}<Pages page={p.page} count={list.data?.count??0} onChange={p.setPage}/></>}</>
}
function ReadingItem({item,task}:{item:Passage;task:string|null}){
 const [furigana,setFurigana]=useState(true)
 const [translation,setTranslation]=useState(false)
 const [sentenceIndex,setSentenceIndex]=useState(0)
 const qs=useQuestions('passage_id',item.id)
 const sentences:string[]=item.body.replace(/\[([^|]+)\|[^\]]+\]/g,'$1').match(/[^。！？]+[。！？]?/g)??[]
 const sentence=sentences[sentenceIndex]
 return <><section className="panel content-card stack"><h2>{item.title}</h2><div className="toolbar"><label className="inline"><input type="checkbox" checked={furigana} onChange={e=>setFurigana(e.target.checked)}/> Furigana</label><label className="inline"><input type="checkbox" checked={translation} onChange={e=>setTranslation(e.target.checked)}/> Terjemahan</label></div><p className="reading-text" lang="ja"><RubyText body={item.body} furigana={furigana}/></p>{translation&&<p>{item.translation}</p>}
 {sentence&&<div className="toolbar"><label>Kalimat<select value={sentenceIndex} onChange={e=>setSentenceIndex(Number(e.target.value))}>{sentences.map((s,i)=><option key={i} value={i}>{s}</option>)}</select></label><SaveBookmark key={sentence} sentence={sentence}/></div>}</section>
 <ErrorLine error={qs.error}/>{qs.isPending?<p>Memuat soal…</p>:<Quiz questions={qs.data??[]} task={task}/>}</>
}
function Player({item,task}:{item:Audio;task:string|null}){
 const player=useRef<HTMLAudioElement>(null)
 const [played,setPlayed]=useState(false)
 const [playError,setPlayError]=useState('')
 const url=useAudioUrl(item.path)
 const p=usePaging()
 const qs=usePage<Question>('questions',{...p,columns:['prompt'],filters:{listening_id:item.id}})
 function replay(){
  if(!player.current)return
  player.current.currentTime=0
  void player.current.play().catch(()=>setPlayError('Audio tidak dapat diputar.'))
 }
 return <><section className="panel content-card stack"><h2><Headphones size={22}/> {item.title}</h2>{url.data&&<><audio ref={player} controls preload="metadata" src={url.data} onPlay={()=>{setPlayed(true);setPlayError('')}} onError={()=>setPlayError('Audio tidak dapat dimuat.')}/><button className="secondary" onClick={replay}><RotateCcw size={16}/> Putar ulang</button></>}{url.isPending&&<p>Memuat audio…</p>}<ErrorLine error={url.error||playError&&new Error(playError)}/></section><section className="panel content-card stack"><h2>Soal pemahaman</h2><Search value={p.search} onChange={p.setSearch}/><Pages page={p.page} count={qs.data?.count??0} onChange={p.setPage}/></section><ErrorLine error={qs.error}/>{qs.isPending||qs.isPlaceholderData?<p>Memuat soal…</p>:<Quiz key={p.page+'-'+p.search} questions={qs.data?.items??[]} task={task} enabled={played}/>}</>
}
export function Listening(){
 const {level}=useLessonLevel()
 return <ListeningLevel key={level}/>
}
function ListeningLevel(){
 const {level,task}=useLessonLevel()
 const [params]=useSearchParams()
 const material=params.get('materi')
 const [selected,setSelected]=useState<Audio>()
 const p=usePaging()
 const list=usePage<Audio>('listening_items',{...p,level,columns:['title','topic'],sort:'title',filters:material?{id:material}:{}})
 const current=selected??(material?list.data?.items[0]:undefined)
 return <><Title title="Mendengar">JLPT {level} · Dengarkan audio, lalu cocokkan jawaban dengan transkrip.</Title>
 {current?<>{material?<Link className="secondary" to="/jalur">Kembali ke jalur belajar</Link>:<button className="secondary" onClick={()=>setSelected(undefined)}>Kembali ke daftar</button>}<Player key={current.id} item={current} task={task}/></>:material?<><Link className="secondary" to="/jalur">Kembali ke jalur belajar</Link><ErrorLine error={list.error}/>{list.isPending?<p role="status">Memuat materi…</p>:<Empty>Materi tidak tersedia di level aktif. <Link to="/mendengar">Lihat daftar</Link></Empty>}</>:<><Search value={p.search} onChange={p.setSearch}/><ErrorLine error={list.error}/>{list.data?.items.map(item=><button className="panel content-card list-choice" key={item.id} onClick={()=>setSelected(item)}>{item.title}</button>)}{(!db||list.data?.count===0)&&<Empty>Belum ada audio yang cocok.</Empty>}<Pages page={p.page} count={list.data?.count??0} onChange={p.setPage}/></>}</>
}
