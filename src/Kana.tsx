import {useEffect,useRef,useState,type PointerEvent} from 'react'
import {useNavigate,useSearchParams} from 'react-router-dom'
import {RotateCcw} from 'lucide-react'
import {useQuery} from '@tanstack/react-query'
import {db,needDb,reject,type KanaItem,type Kanji} from './data'
import {useLessonLevel} from './Levels'
import {Pages,Search,usePage,usePaging} from './Paging'
import {Empty,ErrorLine,Finish,Title} from './ui'
import {scripts,romaji} from './KanaCatalog'
export {Kana} from './KanaCatalog'

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
 const [mode,setMode]=useState<'kana'|'kanji'>(kanjiId||!requested&&level!=='N5'?'kanji':'kana')
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
 return <><Title title="Latihan menulis">Ikuti urutan goresan dan nilai sendiri hasil tulisanmu.</Title><div className="segmented"><button className={mode==='kana'?'chosen':''} onClick={()=>setMode('kana')}>Kana</button><button className={mode==='kanji'?'chosen':''} onClick={()=>setMode('kanji')}>Kanji</button></div>
 {mode==='kanji'&&<><Search value={p.search} onChange={p.setSearch}/><Pages page={p.page} count={list.data?.count??0} onChange={p.setPage}/></>}
 {mode==='kana'&&<div className="toolbar"><button className="secondary" disabled={kanaIndex<=0} onClick={()=>setKana(choices[kanaIndex-1].glyph)}>Huruf sebelumnya</button><button className="secondary" disabled={kanaIndex<0||kanaIndex>=choices.length-1} onClick={()=>setKana(choices[kanaIndex+1].glyph)}>Huruf berikutnya</button></div>}
 <ErrorLine error={kanaList.error}/>
 <ErrorLine error={list.error||item.error}/>{!glyph?<Empty>Pilih kanji yang tersedia pada level ini.</Empty>:<section className="panel content-card writing"><div className="toolbar">{mode==='kana'?<label>Huruf<select value={kana} onChange={e=>setKana(e.target.value)}>{!choices.some(item=>item.glyph===kana)&&<option>{kana}</option>}{Object.keys(scripts).map(script=><optgroup key={script} label={script==='hiragana'?'Hiragana':'Katakana'}>{choices.filter(item=>item.script===script).map(item=><option value={item.glyph} key={item.glyph}>{item.glyph} · {item.romaji}</option>)}</optgroup>)}</select></label>:<label>Kanji<select value={kanji?.id} onChange={e=>{const next=new URLSearchParams(params);next.set('kanji',e.target.value);nav('/menulis?'+next.toString())}}>{[...new Map([...(list.data?.items??[]),...(kanji?[kanji]:[])].map(k=>[k.id,k])).values()].map(k=><option value={k.id} key={k.id}>{k.character} · {k.meaning}</option>)}</select></label>}<label className="inline"><input type="checkbox" checked={overlay} onChange={e=>setOverlay(e.target.checked)}/> Urutan goresan</label></div>
 <div className="canvas-area">{overlay&&(diagramError?<span className="fallback-glyph">{glyph}</span>:<div className="stroke-overlay">{paths.map((path,i)=><img key={i} src={path} onError={()=>setDiagramError(true)} alt={'Urutan goresan '+[...glyph][i]}/>)}</div>)}<canvas ref={canvas} width="420" height="420" onPointerDown={e=>draw(e,'start')} onPointerMove={e=>draw(e,'move')} onPointerUp={release} onLostPointerCapture={release} onPointerCancel={release} aria-label={'Papan gambar '+glyph}/></div>
 {overlay&&diagramError&&<p className="muted">Diagram goresan belum tersedia untuk huruf ini.</p>}<div className="toolbar"><button className="secondary" onClick={clear}><RotateCcw size={16}/> Hapus</button><label className="inline"><input type="checkbox" checked={assessed} disabled={!hasInk} onChange={e=>setAssessed(e.target.checked)}/> Saya sudah membandingkan tulisan dengan panduan</label></div></section>}{glyph&&<Finish key={glyph} kind={mode==='kanji'&&task&&params.get('studyKind')==='kanji'?'kanji':'menulis'} task={task} disabled={!assessed}/>}</>
}
