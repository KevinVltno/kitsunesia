import {useEffect,useRef,useState,type FormEvent} from 'react'
import {Link,useSearchParams} from 'react-router-dom'
import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {db,needDb,reject,rpc,sectionLabels,type Attempt,type Audio,type Passage,type Question,type Section} from './data'
import {Media} from './Content'
import {useLessonLevel} from './Levels'
import {Pages,Search,usePage,usePaging} from './Paging'
import {Empty,ErrorLine,Feedback,Title,useElapsed} from './ui'

export function RubyText({body,furigana}:{body:string;furigana:boolean}){
 return <>{body.split(/(\[[^\[\]|]+\|[^\[\]]+\])/g).map((part,i)=>{
  if(!part.startsWith('[')||!part.endsWith(']')||!part.includes('|'))return part
  const [base,kana]=part.slice(1,-1).split('|')
  return furigana?<ruby key={i}>{base}<rt>{kana}</rt></ruby>:base
 })}</>
}

function ContextMaterial({q,exam}:{q:Question;exam:boolean}){
 const reading=useQuery({queryKey:['passage',q.passage_id],enabled:!!q.passage_id,queryFn:async()=>{
  const r=await needDb().from('reading_passages').select('*').eq('id',q.passage_id!).single()
  reject(r.error);return r.data as Passage
 }})
 const listening=useQuery({queryKey:['listening-item',q.listening_id],enabled:!!q.listening_id,queryFn:async()=>{
  const r=await needDb().from('listening_items').select('*').eq('id',q.listening_id!).single()
  reject(r.error);return r.data as Audio
 }})
 return <><ErrorLine error={reading.error||listening.error}/>{reading.data&&<div><h3>{reading.data.title}</h3><p className="reading-text" lang="ja"><RubyText body={reading.data.body} furigana={!exam}/></p></div>}{listening.data&&<Media path={listening.data.path}/>}</>
}

export function Quiz({questions,task,enabled=true,examMinutes,showContext=false,exercise=false}:{questions:Question[];task:string|null;enabled?:boolean;examMinutes?:number;showContext?:boolean;exercise?:boolean}){
 const [index,setIndex]=useState(0)
 const [reply,setReply]=useState('')
 const [results,setResults]=useState<Attempt[]>([])
 const [deadline]=useState(()=>examMinutes?Date.now()+examMinutes*60_000:null)
 const [seconds,setSeconds]=useState(examMinutes?examMinutes*60:0)
 const event=useRef(crypto.randomUUID())
 const finishEvent=useRef(crypto.randomUUID())
 const cache=useQueryClient()
 const elapsed=useElapsed()
 const q=questions[index]
 const result=results[index]
 const finished=!q||!!deadline&&seconds===0
 useEffect(()=>{
  if(!deadline||finished)return
  const update=()=>setSeconds(Math.max(0,Math.ceil((deadline-Date.now())/1000)))
  const timer=window.setInterval(update,250)
  return ()=>window.clearInterval(timer)
 },[deadline,finished])
 const log=useMutation({mutationFn:()=>rpc('log_study',{event_id:finishEvent.current,activity_kind:'latihan',elapsed:elapsed.minutes(),task_id:task}),onSuccess:()=>cache.invalidateQueries()})
 const submit=useMutation({mutationFn:()=>rpc<Attempt>('submit_answer',{
  event_id:event.current,question:q.id,reply,session_minutes:!exercise&&index+1===questions.length?elapsed.minutes():null,task_id:exercise?null:task,
 }),onSuccess:answer=>{
  setResults(prev=>[...prev,answer])
  void cache.invalidateQueries()
  if(deadline){setReply('');setIndex(index+1);event.current=crypto.randomUUID()}
 }})
 const shouldLog=exercise&&finished&&results.length>0&&!submit.isPending
 const {mutate:record,isIdle}=log
 useEffect(()=>{if(shouldLog&&isIdle)record()},[record,shouldLog,isIdle])
 function answer(e:FormEvent<HTMLFormElement>){e.preventDefault();if(reply.trim()&&!result&&!submit.isPending&&enabled&&(!deadline||Date.now()<deadline))submit.mutate()}
 if(!questions.length)return <Empty>Soal untuk materi ini belum tersedia.</Empty>
 if(finished)return <section className="panel content-card stack"><h2>{deadline&&seconds===0?'Waktu habis':'Hasil latihan'}</h2><p>{results.filter(r=>r.correct).length} dari {questions.length} jawaban benar. {questions.length-results.length>0&&String(questions.length-results.length)+' soal belum dijawab.'}</p>
 <ErrorLine error={submit.error||log.error}/>{log.isError&&<button className="secondary" onClick={()=>log.mutate()}>Coba simpan sesi lagi</button>}
 {deadline&&results.map((r,i)=><Feedback key={r.id} correct={r.correct}><strong>{questions[i].prompt}</strong><p>{r.explanation}</p>{r.transcript&&<p lang="ja">{r.transcript}</p>}</Feedback>)}</section>
 return <section className="panel content-card stack"><div className="section-line"><h2>Soal {index+1} dari {questions.length}</h2><span className="level-pill">{q.level}</span>{deadline&&<strong aria-label="Sisa waktu">{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</strong>}</div>
 {showContext&&<ContextMaterial key={q.id} q={q} exam={!!deadline}/>}<p>{q.prompt}</p>
 <form className="stack" onSubmit={answer}>{q.options.length?<fieldset><legend>Pilih jawaban</legend>{q.options.map(option=><label className="option" key={option}><input type="radio" name={'answer-'+q.id} checked={option===reply} onChange={()=>setReply(option)} disabled={!!result||submit.isPending}/>{option}</label>)}</fieldset>:<label>Jawaban<input value={reply} onChange={e=>setReply(e.target.value)} disabled={!!result||submit.isPending} required maxLength={400}/></label>}
 {!result&&<button className="primary" disabled={!reply.trim()||!enabled||submit.isPending}>{deadline?'Simpan jawaban':'Periksa jawaban'}</button>}</form>
 <ErrorLine error={submit.error}/>{result&&!deadline&&<><Feedback correct={result.correct}><p>{result.explanation}</p>{result.transcript&&<p lang="ja"><strong>Transkrip</strong><br/>{result.transcript}</p>}</Feedback><button className="secondary" onClick={()=>{setReply('');setIndex(index+1);event.current=crypto.randomUUID();submit.reset()}}>{index+1===questions.length?'Lihat skor':'Soal berikutnya'}</button></>}</section>
}
type Session={questions:Question[];minutes?:number;key:string}
type History=Attempt&{questions:{prompt:string}|null}
export function Exercises(){
 const {level,task}=useLessonLevel()
 return <ExerciseLevel key={level} level={level} task={task}/>
}
function ExerciseLevel({level,task}:{level:Question['level'];task:string|null}){
 const [params]=useSearchParams()
 const topic=params.get('topik')
 const [section,setSection]=useState<Section>(level==='N5'||topic?'moji-goi':'bunpou')
 const [history,setHistory]=useState(false)
 const [session,setSession]=useState<Session|null>(null)
 const [minutes,setMinutes]=useState(20)
 const p=usePaging()
 const listing=usePage<Question>('questions',{...p,level,columns:['prompt'],filters:{section,...(topic?{topic}:{})},active:!history&&!session})
 const start=useMutation({mutationFn:async()=>{
  const questions=await rpc<Question[]>('sample_practice',{target_level:level,target_topic:topic})
  return {questions,minutes,key:crypto.randomUUID()}
 },onSuccess:setSession})
 return <><Title title="Latihan soal">JLPT {level} · Pilih bagian atau mulai simulasi dengan timer.</Title>{topic&&<p className="muted">Topik {topic} · <Link to="/jalur">Jalur belajar</Link></p>}<div className="toolbar"><button className="secondary" onClick={()=>{setHistory(!history);setSession(null)}}>{history?'Kembali ke latihan':'Riwayat jawaban'}</button>{session&&<button className="secondary" onClick={()=>{if(window.confirm('Akhiri tampilan sesi ini? Jawaban yang sudah dikirim tetap tersimpan.'))setSession(null)}}>Kembali ke daftar</button>}</div><ErrorLine error={listing.error||start.error}/>
 {history?<AttemptHistory level={level}/>:session?<Quiz key={session.key} questions={session.questions} examMinutes={session.minutes} task={task} showContext exercise/>:<>
 <section className="panel content-card stack"><h2>Simulasi JLPT</h2><div className="toolbar"><label>Durasi (menit)<input type="number" min="1" max="180" value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/></label><button className="primary" disabled={!db||start.isPending||minutes<1||minutes>180} onClick={()=>start.mutate()}>Mulai simulasi</button></div><p className="muted">Maksimal lima soal per bagian yang tersedia. Pembahasan muncul setelah sesi berakhir.</p></section>
 <section className="panel content-card stack"><label>Bagian<select value={section} onChange={e=>{setSection(e.target.value as Section);p.setPage(0)}}>{Object.entries(sectionLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><Search value={p.search} onChange={p.setSearch}/>{listing.data?.items.map(q=><div className="history-entry section-line" key={q.id}><strong>{q.prompt}</strong><button className="secondary" onClick={()=>setSession({questions:[q],key:crypto.randomUUID()})}>Kerjakan</button></div>)}{listing.data?.items.length?<button className="primary" onClick={()=>setSession({questions:listing.data!.items,key:crypto.randomUUID()})}>Kerjakan soal halaman ini</button>:<p>Belum ada soal yang cocok.</p>}<Pages page={p.page} count={listing.data?.count??0} onChange={p.setPage}/></section></>}
 </>
}
function AttemptHistory({level}:{level:Question['level']}){
 const p=usePaging()
 const data=usePage<History>('attempts',{...p,level,columns:['response'],sort:'created_at',descending:true,select:'*,questions(prompt)'})
 return <section className="panel content-card stack"><h2>Riwayat jawaban</h2><Search value={p.search} onChange={p.setSearch}/><ErrorLine error={data.error}/>{data.data?.items.length?data.data.items.map(a=><article className="history-entry" key={a.id}><strong>{a.questions?.prompt??'Soal telah dihapus'}</strong><p>{a.response} · {a.correct?'Benar':'Salah'}</p><p>{a.explanation}</p><small>{new Date(a.created_at).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})}</small></article>):<p>Belum ada jawaban yang cocok.</p>}<Pages page={p.page} count={data.data?.count??0} onChange={p.setPage}/></section>
}
