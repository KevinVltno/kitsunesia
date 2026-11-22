import {useEffect,useRef,useState,type ReactNode} from 'react'
import {useMutation,useQueryClient} from '@tanstack/react-query'
import {Link} from 'react-router-dom'
import {ArrowUpRight,Check,Flame,BookOpen,Headphones,Languages,PencilLine,Layers3,ListChecks,BookA,Text} from 'lucide-react'
import {db,eventArgs,labels,levels,message,rpc,type Kind,type Level} from './data'

export const modules=[
 {id:'huruf',icon:Languages,desc:'Hiragana & Katakana',color:'purple'},
 {id:'menulis',icon:PencilLine,desc:'Latihan goresan kana',color:'amber'},
 {id:'kanji',icon:BookA,desc:'Bacaan, arti, dan goresan',color:'amber'},
 {id:'kosakata',icon:Layers3,desc:'Kartu hafalan SM-2',color:'green'},
 {id:'bunpou',icon:Text,desc:'Pola dan contoh kalimat',color:'blue'},
 {id:'membaca',icon:BookOpen,desc:'Bacaan dengan furigana',color:'rose'},
 {id:'latihan',icon:ListChecks,desc:'Soal dan pembahasan',color:'blue'},
 {id:'mendengar',icon:Headphones,desc:'Latihan pemahaman audio',color:'amber'},
] as const
export function Kitsu({sad=false,className=''}:{sad?:boolean;className?:string}){
 return <img className={'kitsu '+className} src={sad?'/kitsu-sedih.png':'/kitsu.png'} alt={sad?'Kitsu menyemangati':'Kitsu melambaikan tangan'}/>
}
export function Brand(){return <Link to="/" className="brand"><span className="brand-mark"><Kitsu/></span><span>Kitsunesia<small>日本語を学ぼう</small></span></Link>}
export function Empty({children}:{children:ReactNode}){return <div className="empty panel"><Kitsu/><p>{children}</p></div>}
export function Title({title,children}:{title:string;children?:ReactNode}){return <header className="page-title"><h1>{title}</h1>{children&&<p>{children}</p>}</header>}
export function ErrorLine({error}:{error:unknown}){return error?<p className="error" role="alert">{message(error)}</p>:null}
export function LevelPicker({value,onChange}:{value:Level;onChange:(level:Level)=>void}){
 return <div className="segmented" aria-label="Level JLPT">{levels.map(x=><button type="button" key={x} className={x===value?'chosen':''} aria-pressed={x===value} onClick={()=>onChange(x)}>{x}</button>)}</div>
}
export function Meter({value,label}:{value:number;label:string}){return <progress aria-label={label} value={Math.min(100,value)} max={100}/>}
export function ModuleGrid(){
 return <div className="modules">{modules.map(({id,icon:Icon,desc,color})=><Link className="module panel" key={id} to={'/'+id}><span className={'tile '+color}><Icon size={21}/></span><span><strong>{labels[id]}</strong><small>{desc}</small></span><ArrowUpRight className="module-arrow" size={17}/></Link>)}</div>
}
export function useElapsed(){
 const elapsed=useRef(0)
 useEffect(()=>{
  const timer=window.setInterval(()=>{if(!document.hidden)elapsed.current++},1000)
  return ()=>window.clearInterval(timer)
 },[])
 return {minutes:()=>Math.min(240,Math.max(1,Math.round(elapsed.current/60))),reset:()=>{elapsed.current=0}}
}
export function Finish({kind,task,disabled=false}:{kind:Kind;task:string|null;disabled?:boolean}){
 const [finished,setFinished]=useState(false)
 const elapsed=useElapsed()
 const cache=useQueryClient()
 const event=useRef<string>(crypto.randomUUID())
 const save=useMutation({mutationFn:()=>rpc('log_study',{...eventArgs(elapsed.minutes(),task),event_id:event.current,activity_kind:kind}),onSuccess:()=>{setFinished(true);void cache.invalidateQueries()}})
 return <div className="finish"><button className="primary" disabled={disabled||save.isPending||finished||!db} onClick={()=>save.mutate()}><Check size={17}/>{finished?'Sesi tercatat':save.isPending?'Menyimpan…':'Selesaikan sesi'}</button><ErrorLine error={save.error}/></div>
}
export function Feedback({correct,children}:{correct:boolean;children:ReactNode}){return <div className={'feedback '+(correct?'correct':'incorrect')} role="status"><Kitsu sad={!correct}/><div><strong>{correct?'Bagus, benar!':'Tetap semangat!'}</strong><div>{children}</div></div></div>}
export function Streak({days}:{days:number}){return <span className="streak-chip"><Flame size={17}/><strong>{days} hari streak</strong></span>}
