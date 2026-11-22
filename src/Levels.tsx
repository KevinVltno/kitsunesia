import {createContext,useContext,useState,type ReactNode} from 'react'
import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {useNavigate,useSearchParams} from 'react-router-dom'
import {db,isLevel,levels,needDb,reject,rpc,type Level,type Profile,type Question,type Attempt} from './data'
import {Empty,ErrorLine,Feedback,LevelPicker,Title} from './ui'

export type Summary={level:Level;vocabulary:number;kanji:number;grammar:number;vocabulary_available:number;kanji_available:number;grammar_available:number;vocabulary_mastered:number;kanji_mastered:number;grammar_mastered:number;answers:number;correct:number}
const LevelContext=createContext<{level:Level;setLevel:(level:Level,onSuccess?:()=>void)=>void;error:unknown;pending:boolean}>({level:'N5',setLevel:()=>{},error:null,pending:false})
export const useLevel=()=>useContext(LevelContext)
export function LevelProvider({profile,children}:{profile?:Profile;children:ReactNode}){
 const [local,setLocal]=useState<Level>('N5')
 const cache=useQueryClient()
 const save=useMutation({mutationFn:async(level:Level)=>{
  if(!profile)return
  reject((await needDb().from('profiles').update({active_level:level,level_selected:true}).eq('id',profile.id)).error)
 },onSuccess:async(_,level)=>{setLocal(level);await cache.invalidateQueries({queryKey:['profiles']})}})
 return <LevelContext.Provider value={{level:profile?.active_level??local,setLevel:(level,onSuccess)=>save.mutate(level,{onSuccess}),error:save.error,pending:save.isPending}}>{children}</LevelContext.Provider>
}
export function useLessonLevel(){
 const [params]=useSearchParams()
 const {level,setLevel}=useLevel()
 const task=params.get('task')
 const override=params.get('level')
 return {level:task&&isLevel(override)?override:level,setLevel,task}
}
export function useSummaries(){
 return useQuery({queryKey:['level-summary'],queryFn:()=>rpc<Summary[]>('study_level_summary'),enabled:!!db})
}
export function recommendation(s:Summary){
 const i=levels.indexOf(s.level)
 return i<levels.length-1&&s.vocabulary_mastered>=s.vocabulary*.8&&s.answers>0&&s.correct/s.answers>=.7?levels[i+1]:null
}
export function Placement(){
 const {setLevel,pending,error}=useLevel()
 const [choice,setChoice]=useState<Level>('N5')
 const [testing,setTesting]=useState(false)
 const [index,setIndex]=useState(0)
 const [answer,setAnswer]=useState('')
 const [results,setResults]=useState<Attempt[]>([])
 const [event,setEvent]=useState(()=>crypto.randomUUID())
 const nav=useNavigate()
 const questions=useQuery({queryKey:['placement'],enabled:testing&&!!db,queryFn:async()=>{
  const rows=await Promise.all(levels.map(async level=>{
   const r=await needDb().from('questions').select('*').eq('placement',true).eq('level',level).order('id').limit(1)
   reject(r.error);return (r.data??[]) as Question[]
  }))
  return rows.flat()
 }})
 const q=questions.data?.[index]
 const result=results[index]
 const submit=useMutation({mutationFn:()=>rpc<Attempt>('placement_answer',{event_id:event,question:q!.id,reply:answer}),onSuccess:a=>setResults(old=>[...old,a])})
 let suggested:Level='N5'
 for(const [i,r] of results.entries()){
  if(!r.correct)break
  suggested=questions.data?.[i]?.level??suggested
 }
 function pick(level:Level){setLevel(level,()=>nav('/'))}
 return <><Title title="Pilih level JLPT">Mulai dari level pilihanmu atau coba tes penempatan lima soal.</Title><ErrorLine error={error||questions.error||submit.error}/>
 <section className="panel content-card stack"><h2>Pilih manual</h2><LevelPicker value={choice} onChange={setChoice}/><button className="primary" disabled={pending} onClick={()=>pick(choice)}>Gunakan {choice}</button>{!testing&&db&&<button className="secondary" onClick={()=>setTesting(true)}>Mulai tes penempatan</button>}</section>
 {testing&&(questions.isPending?<p>Memuat tes…</p>:q?<section className="panel content-card stack"><h2>Soal {index+1} dari {questions.data?.length} · {q.level}</h2><p>{q.prompt}</p>
 <form className="stack" onSubmit={e=>{e.preventDefault();if(answer.trim()&&!result)submit.mutate()}}>{q.options.length?q.options.map(o=><label className="option" key={o}><input type="radio" checked={answer===o} disabled={!!result||submit.isPending} onChange={()=>setAnswer(o)}/>{o}</label>):<label>Jawaban<input value={answer} disabled={!!result||submit.isPending} onChange={e=>setAnswer(e.target.value)} maxLength={400}/></label>}{!result&&<button className="primary" disabled={!answer.trim()||submit.isPending}>Periksa</button>}</form>
 {result&&<><Feedback correct={result.correct}>{result.explanation}</Feedback><button className="secondary" onClick={()=>{setIndex(index+1);setAnswer('');setEvent(crypto.randomUUID());submit.reset()}}>Lanjut</button></>}</section>:results.length?<section className="panel content-card stack"><h2>Saran mulai dari {suggested}</h2><p>{results.filter(r=>r.correct).length} jawaban benar dari {results.length} soal.</p><button className="primary" disabled={pending} onClick={()=>pick(suggested)}>Gunakan {suggested}</button></section>:<Empty>Soal penempatan belum tersedia.</Empty>)}
 </>
}
