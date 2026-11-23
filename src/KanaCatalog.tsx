import {useEffect,useRef,useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Link,useSearchParams} from 'react-router-dom'
import {Check,LayoutGrid,List,Volume2,X} from 'lucide-react'
import {db,needDb,reject,type KanaItem} from './data'
import {useLessonLevel} from './Levels'
import {Search} from './Paging'
import {Empty,ErrorLine,Finish,Title} from './ui'

export const scripts={hiragana:'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',katakana:'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'}
export const romaji='a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n'.split(' ')
type Script=keyof typeof scripts
const voiced='がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゔ'
const voicedReading='ga gi gu ge go za ji zu ze zo da ji du de do ba bi bu be bo pa pi pu pe po vu'.split(' ')
const pairs='きゃきゅきょしゃしゅしょちゃちゅちょにゃにゅにょひゃひゅひょみゃみゅみょりゃりゅりょぎゃぎゅぎょじゃじゅじょびゃびゅびょぴゃぴゅぴょ'
const pairReadings='kya kyu kyo sha shu sho cha chu cho nya nyu nyo hya hyu hyo mya myu myo rya ryu ryo gya gyu gyo ja ju jo bya byu byo pya pyu pyo'.split(' ')
const groupNames={dasar:['Vokal','Baris K','Baris S','Baris T','Baris N','Baris H','Baris M','Baris Y','Baris R','Baris W dan N'],dakuten:['Dakuten G','Dakuten Z','Dakuten D','Dakuten B','Handakuten P','Bunyi V'],yoon:['Kya','Sha','Cha','Nya','Hya','Mya','Rya','Gya','Ja','Bya','Pya']} as const
type Category=keyof typeof groupNames
type Group={id:string;name:string;items:KanaItem[]}
function previewItems(script:Script):KanaItem[]{
 const convert=(s:string)=>script==='hiragana'?s:s.replace(/[\u3041-\u3096]/g,c=>String.fromCharCode(c.charCodeAt(0)+96))
 return [
  ...[...scripts[script]].map((glyph,i)=>({glyph,romaji:romaji[i],position:i+1,category:'dasar',audio_path:null})),
  ...[...voiced].map((glyph,i)=>({glyph:convert(glyph),romaji:voicedReading[i],position:47+i,category:'dakuten',audio_path:'extra-0-'+i+'.mp3'})),
  ...pairReadings.map((reading,i)=>({glyph:convert(pairs.slice(2*i,2*i+2)),romaji:reading,position:77+i,category:'yoon',audio_path:'extra-1-'+i+'.mp3'})),
 ].map(item=>({...item,script,level:'N5'}))
}
function groupItems(items:KanaItem[]){
 const groups=new Map<string,Group>()
 for(const item of items){
  const category=item.category as Category
  const pos=item.position
  const row=category==='dasar'?(pos<=35?Math.floor((pos-1)/5):pos<=38?7:pos<=43?8:9):category==='dakuten'?Math.floor((pos-47)/5):Math.floor((pos-77)/3)
  const name=groupNames[category]?.[row]??'Kana tambahan'
  const id=category+'-'+row
  if(!groups.has(id))groups.set(id,{id,name,items:[]})
  groups.get(id)!.items.push(item)
 }
 return [...groups.values()]
}
export function Kana(){
 const [params,setParams]=useSearchParams()
 const {task}=useLessonLevel()
 const script=params.get('script')==='katakana'?'katakana':'hiragana'
 const name=script==='hiragana'?'Hiragana':'Katakana'
 const [view,setView]=useState<'groups'|'table'>('groups')
 const [family,setFamily]=useState('')
 const [search,setSearch]=useState('')
 const [active,setActive]=useState('')
 const [studied,setStudied]=useState(false)
 const [session,setSession]=useState<{name:string;items:KanaItem[]}>()
 const [audioError,setAudioError]=useState('')
 const query=useQuery({queryKey:['kana','chart',script],enabled:!!db,queryFn:async({signal})=>{
  const r=await needDb().from('kana').select('*').eq('script',script).eq('level','N5').order('position').order('glyph').limit(250).abortSignal(signal)
  reject(r.error);return r.data as KanaItem[]
 }})
 const items=db?query.data??[]:previewItems(script)
 const groups=groupItems(items)
 const term=search.trim().toLowerCase()
 const filtered=groups.filter(g=>!family||family===g.id).map(group=>({...group,items:group.items.filter(item=>!term||item.glyph.includes(term)||item.romaji.toLowerCase().includes(term)||group.name.toLowerCase().includes(term))})).filter(g=>g.items.length)
 const player=useRef<HTMLAudioElement|null>(null)
 const playback=useRef(0)
 useEffect(()=>()=>{playback.current++;player.current?.pause();window.speechSynthesis?.cancel()},[])
 async function play(item:KanaItem){
  const request=++playback.current
  setActive(item.glyph);setAudioError('')
  player.current?.pause();window.speechSynthesis?.cancel()
  let source='/kana-audio/'+encodeURIComponent(item.audio_path??item.romaji+'.mp3')
  if(db&&item.audio_path?.includes('/')){
   const r=await db.storage.from('learning-audio').createSignedUrl(item.audio_path,3600)
   if(request!==playback.current)return
   if(r.error){setAudioError('Audio belum bisa dimuat.');return}
   source=r.data.signedUrl
  }
  const audio=new Audio(source)
  player.current=audio
  try{await audio.play();if(request===playback.current)setStudied(true)}catch{
   if(request!==playback.current)return
   const voice=window.speechSynthesis?.getVoices().find(v=>v.lang.startsWith('ja'))
   if(!voice){setAudioError('Audio belum bisa diputar.');return}
   const utterance=new SpeechSynthesisUtterance(item.glyph)
   utterance.voice=voice;utterance.lang='ja-JP'
   utterance.onerror=()=>setAudioError('Audio belum bisa diputar.')
   window.speechSynthesis.speak(utterance);setStudied(true)
  }
 }
 function switchScript(value:Script){
  const next=new URLSearchParams(params);next.set('script',value);setParams(next)
  setFamily('');setSearch('');setActive('');setSession(undefined)
 }
 function practice(name:string,pool:KanaItem[],mixed=false){
  const chosen=pool.slice()
  if(mixed)for(let i=chosen.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[chosen[i],chosen[j]]=[chosen[j],chosen[i]]}
  setSession({name,items:mixed?chosen.slice(0,10):chosen})
 }
 const errors=<>{audioError&&<p className="error" role="alert">{audioError}</p>}<ErrorLine error={query.error}/></>
 return <div className="kana-library">
  <Title title="Huruf Kana">Pelajari bentuk dan bunyi kana. Mulai dari vokal, lalu lanjut ke dakuten dan yōon.</Title>
  {session?<><button className="secondary" onClick={()=>setSession(undefined)}>Kembali ke materi</button>
   <KanaPractice session={session} all={items} play={play} onAnswer={()=>setStudied(true)}/>{errors}
  </>:<>
   <div className="panel kana-controls">
    <div className="toolbar"><div className="segmented" aria-label="Jenis aksara">
     {(['hiragana','katakana'] as const).map(value=><button key={value} className={value===script?'chosen':''} aria-pressed={value===script} onClick={()=>switchScript(value)}>{value==='hiragana'?'Hiragana':'Katakana'}</button>)}
    </div><div className="segmented" aria-label="Tampilan huruf">
     <button className={view==='groups'?'chosen':''} aria-pressed={view==='groups'} onClick={()=>setView('groups')}><LayoutGrid size={15}/> Per kelompok</button>
     <button className={view==='table'?'chosen':''} aria-pressed={view==='table'} onClick={()=>{setView('table');setFamily('')}}><List size={15}/> Tabel huruf</button>
    </div></div>
    <Search value={search} onChange={value=>{setSearch(value);setFamily('')}}>
     {view==='groups'&&<label>Kelompok<select value={family} onChange={e=>setFamily(e.target.value)}><option value="">Semua kelompok</option>{groups.map(group=><option key={group.id} value={group.id}>{group.name}</option>)}</select></label>}
    </Search>
   </div>
   {errors}
   <div className="section-line kana-list-heading"><div><h2>{name}</h2><small>{filtered.reduce((n,g)=>n+g.items.length,0)} huruf</small></div>
    <button className="primary" disabled={!items.length} onClick={()=>practice('Latihan campuran',items,true)}>Latihan campuran</button>
   </div>
   {db&&query.isPending?<p role="status">Memuat huruf…</p>:!filtered.length?<Empty>Tidak ada huruf yang cocok.</Empty>:<div className={view==='table'?'panel kana-chart':'kana-groups'}>
    {filtered.map(group=><section key={group.id} className={view==='groups'?'panel kana-set':'kana-chart-row'}>
     <div className="section-line"><h3>{group.name}</h3>{view==='groups'&&<button className="secondary" onClick={()=>practice(group.name,group.items)}>Latih kelompok</button>}</div>
     <div className="kana-cells">{group.items.map(item=><div key={item.glyph} className={'kana-cell '+(active===item.glyph?'active':'')}>
      <button type="button" onClick={()=>void play(item)} aria-label={'Dengar '+item.glyph+' '+item.romaji}><strong lang="ja">{item.glyph}</strong><span>{item.romaji} <Volume2 size={14}/></span></button>
      <Link to={'/menulis?kana='+encodeURIComponent(item.glyph)}>Tulis<span className="sr-only"> {item.glyph}</span></Link>
     </div>)}</div>
    </section>)}
   </div>}
  </>}
  <Finish kind="huruf" task={task} disabled={!studied}/>
 </div>
}
function KanaPractice({session,all,play,onAnswer}:{session:{name:string;items:KanaItem[]};all:KanaItem[];play:(item:KanaItem)=>void;onAnswer:()=>void}){
 const [index,setIndex]=useState(0)
 const [answer,setAnswer]=useState('')
 const [score,setScore]=useState(0)
 const item=session.items[index]
 if(!item)return <section className="panel content-card stack"><h2>Latihan selesai</h2><p>{score} dari {session.items.length} jawaban benar.</p><button className="secondary" onClick={()=>{setIndex(0);setAnswer('');setScore(0)}}>Ulangi latihan</button></section>
 const unique=[...new Set([item.romaji,...session.items.map(x=>x.romaji),...all.map(x=>x.romaji)])].slice(0,4)
 const offset=(index+item.position)%unique.length
 const options=[...unique.slice(offset),...unique.slice(0,offset)]
 return <section className="panel content-card stack kana-practice">
  <div className="section-line"><h2>{session.name}</h2><span className="level-pill">{index+1} dari {session.items.length}</span></div>
  <p>Apa bacaan huruf ini?</p><div className="preview-glyph" lang="ja">{item.glyph}</div>
  <div className="preview-options">{options.map(option=><button key={option} type="button" disabled={!!answer} className={answer===option?'selected':''} onClick={()=>{setAnswer(option);if(option===item.romaji)setScore(n=>n+1);onAnswer()}}>{option}</button>)}</div>
  {answer&&<div className="toolbar"><p role="status">{answer===item.romaji?<Check size={15}/>:<X size={15}/>} Dibaca <strong>{item.romaji}</strong>.</p><button className="secondary" onClick={()=>play(item)}><Volume2 size={15}/> Dengar</button><button className="primary" onClick={()=>{setIndex(index+1);setAnswer('')}}>{index+1===session.items.length?'Lihat hasil':'Huruf berikutnya'}</button></div>}
 </section>
}
