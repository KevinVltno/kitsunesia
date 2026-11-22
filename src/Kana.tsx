import {useEffect,useRef,useState,type PointerEvent} from 'react'
import {Link,useNavigate,useSearchParams} from 'react-router-dom'
import {Volume2,RotateCcw} from 'lucide-react'
import {useQuery} from '@tanstack/react-query'
import {db,needDb,reject,type KanaItem,type Kanji} from './data'
import {useLessonLevel} from './Levels'
import {PAGE_SIZE,Pages,Search,usePage,usePaging} from './Paging'
import {Empty,ErrorLine,Finish,Title} from './ui'

const scripts={
 hiragana:'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',
 katakana:'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
}
const romaji='a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n'.split(' ')
type Script=keyof typeof scripts
export function Kana(){
 const {level,task}=useLessonLevel()
 return <KanaLevel key={level} level={level} task={task}/>
}
function KanaLevel({level,task}:{level:KanaItem['level'];task:string|null}){
 const [category,setCategory]=useState('dasar')
 const p=usePaging()
 const [script,setScript]=useState<Script>('hiragana')
 const [active,setActive]=useState('')
 const [audioError,setAudioError]=useState('')
 const data=usePage<KanaItem>('kana',{...p,level,sort:'position',columns:['glyph','romaji'],filters:{script,...(!p.search.trim()?{category}:{})}})
 const fallback:KanaItem[]=!db&&level==='N5'&&category==='dasar'?[...scripts[script]].map((glyph,i)=>({glyph,romaji:romaji[i],level,script,category,position:i+1,audio_path:null})).filter(x=>!p.search||x.glyph.includes(p.search)||x.romaji.includes(p.search)):[]
 const items=data.data?.items??fallback.slice(p.page*PAGE_SIZE,(p.page+1)*PAGE_SIZE)
 const player=useRef<HTMLAudioElement|null>(null)
 const playback=useRef(0)
 useEffect(()=>()=>{playback.current++;player.current?.pause();window.speechSynthesis?.cancel()},[])
 async function play(item:KanaItem){
  const {glyph}=item
  const request=++playback.current
  setActive(glyph);setAudioError('')
  player.current?.pause()
  window.speechSynthesis?.cancel()
  let source='/kana-audio/'+encodeURIComponent(item.audio_path??item.romaji+'.mp3')
  if(db&&item.audio_path?.includes('/')){
   const r=await db.storage.from('learning-audio').createSignedUrl(item.audio_path,3600)
   if(request!==playback.current)return
   if(r.error){setAudioError('Audio tidak tersedia di Storage.');return}
   source=r.data.signedUrl
  }
  const audio=new Audio(source)
  player.current=audio
  void audio.play().catch(()=>{
   if(player.current!==audio)return
   if(!('speechSynthesis' in window)){setAudioError('Audio kana tidak tersedia di perangkat ini.');return}
   const utterance=new SpeechSynthesisUtterance(glyph)
   utterance.lang='ja-JP'
   utterance.voice=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith('ja'))??null
   utterance.onerror=()=>setAudioError('Aktifkan suara bahasa Jepang pada perangkatmu.')
   window.speechSynthesis.cancel();window.speechSynthesis.speak(utterance)
  })
 }
 return <><Title title="Huruf Kana">JLPT {level} · Hiragana dan katakana dasar, dakuten, serta yōon.</Title><div className="segmented">{(['hiragana','katakana'] as const).map(s=><button key={s} className={script===s?'chosen':''} onClick={()=>{setScript(s);p.setPage(0);setActive('')}}>{s==='hiragana'?'Hiragana':'Katakana'}</button>)}</div>
 <div className="segmented kana-categories" aria-label="Kelompok kana">{Object.entries({dasar:'Dasar',dakuten:'Dakuten dan handakuten',yoon:'Yōon · kya, gya, ja'}).map(([group,label])=><button key={group} className={category===group?'chosen':''} aria-pressed={category===group} onClick={()=>{setCategory(group);p.setSearch('');setActive('')}}>{label}</button>)}</div><Search value={p.search} onChange={p.setSearch}/><ErrorLine error={data.error}/>
 {items.length?<div className="kana-grid">{items.map(item=><article className={'panel kana '+(item.glyph===active?'active':'')} key={item.glyph}><button onClick={()=>play(item)} aria-label={'Dengar '+item.glyph+' '+item.romaji}><strong lang="ja">{item.glyph}</strong><span>{item.romaji} <Volume2 size={15}/></span></button><Link to={'/menulis?kana='+encodeURIComponent(item.glyph)}>Tulis</Link></article>)}</div>:(!db||!data.isPending)&&<Empty>Belum ada huruf yang cocok pada kelompok dan level ini.</Empty>}
 <Pages page={p.page} count={data.data?.count??fallback.length} onChange={p.setPage}/>
 {audioError&&<p className="error" role="alert">{audioError}</p>}<Finish kind="huruf" task={task} disabled={!active}/></>
}

export function Writing(){
 const {level}=useLessonLevel()
 return <WritingLevel key={level}/>
}
function WritingLevel(){
 const [params]=useSearchParams()
 const {level,task}=useLessonLevel()
 const kanjiId=params.get('kanji')
 const nav=useNavigate()
 const initial=params.get('kana')??''
 const requested=/^[\u3041-\u30fa]{1,2}$/.test(initial)?initial:''
 const [mode,setMode]=useState<'kana'|'kanji'>(kanjiId||level!=='N5'?'kanji':'kana')
 const p=usePaging()
 const list=usePage<Kanji>('kanji',{...p,level,active:mode==='kanji',columns:['character','meaning','onyomi','kunyomi'],sort:'character'})
 const item=useQuery({queryKey:['kanji','writing',kanjiId],enabled:!!db&&!!kanjiId,queryFn:async()=>{
  const r=await needDb().from('kanji').select('*').eq('id',kanjiId!).maybeSingle()
  reject(r.error);return r.data as Kanji|null
 }})
 const [kana,setKana]=useState(requested||'あ')
 const kanaList=useQuery({queryKey:['kana','writing'],enabled:!!db&&mode==='kana',queryFn:async()=>{
  const r=await needDb().from('kana').select('glyph,script,romaji').eq('level','N5').order('position').order('glyph').limit(250)
  reject(r.error)
  return (r.data??[]) as Pick<KanaItem,'glyph'|'script'|'romaji'>[]
 }})
 const choices=(kanaList.data??Object.entries(scripts).flatMap(([script,chars])=>[...chars].map((glyph,i)=>({glyph,script,romaji:romaji[i]})))).slice().sort((a,b)=>a.script.localeCompare(b.script))
 const kanaIndex=choices.findIndex(item=>item.glyph===kana)
 const kanji=(item.data?.level===level?item.data:null)??list.data?.items[0]
 const glyph=mode==='kanji'?kanji?.character??'':kana
 const [overlay,setOverlay]=useState(true)
 const [hasInk,setInk]=useState(false)
 const [assessed,setAssessed]=useState(false)
 const [diagramError,setDiagramError]=useState(false)
 const canvas=useRef<HTMLCanvasElement>(null)
 const pointer=useRef<number|null>(null)
 const paths=[...glyph].map(char=>'/kanjivg/'+(mode==='kanji'&&kanji?.stroke_path&&/^[0-9a-f]{5,6}(?:-[0-9a-z]+)?\.svg$/i.test(kanji.stroke_path)?kanji.stroke_path:char.codePointAt(0)!.toString(16).padStart(5,'0')+'.svg'))
 function clear(){
  const c=canvas.current
  c?.getContext('2d')?.clearRect(0,0,c.width,c.height)
  setInk(false);setAssessed(false)
 }
 useEffect(()=>{clear();setDiagramError(false)},[glyph])
 function draw(e:PointerEvent<HTMLCanvasElement>,mode:'start'|'move'){
  const c=e.currentTarget
  const ctx=c.getContext('2d')
  if(!ctx)return
  const box=c.getBoundingClientRect()
  const x=(e.clientX-box.left)*c.width/box.width
  const y=(e.clientY-box.top)*c.height/box.height
  ctx.strokeStyle='#30264e';ctx.fillStyle='#30264e';ctx.lineWidth=7;ctx.lineJoin='round';ctx.lineCap='round'
  if(mode==='start'){
   if(pointer.current!==null)return
   c.setPointerCapture(e.pointerId);pointer.current=e.pointerId
   ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill()
   ctx.beginPath();ctx.moveTo(x,y);setInk(true);setAssessed(false)
  }else if(pointer.current===e.pointerId){ctx.lineTo(x,y);ctx.stroke()}
 }
 const release=(e:PointerEvent<HTMLCanvasElement>)=>{if(pointer.current===e.pointerId)pointer.current=null}
 return <><Title title="Latihan menulis">Ikuti urutan goresan dan nilai sendiri hasil tulisanmu.</Title><div className="segmented"><button className={mode==='kana'?'chosen':''} disabled={level!=='N5'} onClick={()=>setMode('kana')}>Kana</button><button className={mode==='kanji'?'chosen':''} onClick={()=>setMode('kanji')}>Kanji</button></div>
 {mode==='kanji'&&<><Search value={p.search} onChange={p.setSearch}/><Pages page={p.page} count={list.data?.count??0} onChange={p.setPage}/></>}
 {mode==='kana'&&<div className="toolbar"><button className="secondary" disabled={kanaIndex<=0} onClick={()=>setKana(choices[kanaIndex-1].glyph)}>Huruf sebelumnya</button><button className="secondary" disabled={kanaIndex<0||kanaIndex>=choices.length-1} onClick={()=>setKana(choices[kanaIndex+1].glyph)}>Huruf berikutnya</button></div>}
 <ErrorLine error={kanaList.error}/>
 <ErrorLine error={list.error||item.error}/>{!glyph?<Empty>Pilih kanji yang tersedia pada level ini.</Empty>:<section className="panel content-card writing"><div className="toolbar">{mode==='kana'?<label>Huruf<select value={kana} onChange={e=>setKana(e.target.value)}>{!choices.some(item=>item.glyph===kana)&&<option>{kana}</option>}{Object.keys(scripts).map(script=><optgroup key={script} label={script==='hiragana'?'Hiragana':'Katakana'}>{choices.filter(item=>item.script===script).map(item=><option value={item.glyph} key={item.glyph}>{item.glyph} · {item.romaji}</option>)}</optgroup>)}</select></label>:<label>Kanji<select value={kanji?.id} onChange={e=>{const next=new URLSearchParams(params);next.set('kanji',e.target.value);nav('/menulis?'+next.toString())}}>{[...new Map([...(list.data?.items??[]),...(kanji?[kanji]:[])].map(k=>[k.id,k])).values()].map(k=><option value={k.id} key={k.id}>{k.character} · {k.meaning}</option>)}</select></label>}<label className="inline"><input type="checkbox" checked={overlay} onChange={e=>setOverlay(e.target.checked)}/> Urutan goresan</label></div>
 <div className="canvas-area">{overlay&&(diagramError?<span className="fallback-glyph">{glyph}</span>:<div className="stroke-overlay">{paths.map((path,i)=><img key={i} src={path} onError={()=>setDiagramError(true)} alt={'Urutan goresan '+[...glyph][i]}/>)}</div>)}<canvas ref={canvas} width="420" height="420" onPointerDown={e=>draw(e,'start')} onPointerMove={e=>draw(e,'move')} onPointerUp={release} onLostPointerCapture={release} onPointerCancel={release} aria-label={'Papan gambar '+glyph}/></div>
 {overlay&&diagramError&&<p className="muted">Diagram goresan belum tersedia untuk huruf ini.</p>}<div className="toolbar"><button className="secondary" onClick={clear}><RotateCcw size={16}/> Hapus</button><label className="inline"><input type="checkbox" checked={assessed} disabled={!hasInk} onChange={e=>setAssessed(e.target.checked)}/> Saya sudah membandingkan tulisan dengan panduan</label></div></section>}{glyph&&<Finish key={glyph} kind={mode==='kanji'&&task&&params.get('studyKind')==='kanji'?'kanji':'menulis'} task={task} disabled={!assessed}/>}</>
}
