import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {dateLabel,labels,rpc,type Kind,type Profile,type Level} from './data'
import {Pages,Search,usePaging} from './Paging'
import {ErrorLine,Meter} from './ui'

type Learner=Pick<Profile,'id'|'name'|'role'|'active_level'>&{email:string|null}
type Count={done:number;total:number}
type Progress={
 active_level:Level;words:Count;kanji:Count;grammar:Count;week_minutes:number
 practice:{answered:number;correct:number}
 plan:(Count&{level:Level;next_kind:Kind|null;next_date:string|null})|null
 recent:{id:string;kind:Kind;day:string;at:string|null;level:Level|null;minutes:number|null;material:string|null}[]
}
const displayName=(user:Learner)=>user.name.trim()||user.email||'Pengguna'
const shortDate=(date:string)=>dateLabel(date,{day:'numeric',month:'short',year:'numeric'})
const localTime=new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'})

export function AdminLearners(){
 const p=usePaging()
 const [selected,setSelected]=useState<Learner>()
 const users=useQuery({
  queryKey:['admin-learning-users',p.search,p.page],
  enabled:!selected,
  queryFn:()=>rpc<{items:Learner[];count:number}>('admin_learning_users',{term:p.search,page_index:p.page}),
 })
 if(selected)return <LearnerProgress key={selected.id} user={selected} back={()=>setSelected(undefined)}/>
 return <section className="panel content-card stack">
  <h2>Daftar pengguna</h2>
  <Search value={p.search} onChange={p.setSearch}/>
  <ErrorLine error={users.error}/>
  {users.isPending?<p role="status">Memuat pengguna…</p>:users.data?.items.map(user=><article className="history-entry section-line" key={user.id}>
   <div><strong>{displayName(user)}</strong>{user.name.trim()&&user.email&&<p className="muted">{user.email}</p>}</div>
   <div className="toolbar"><span className="level-pill">{user.role} · {user.active_level}</span><button className="secondary" onClick={()=>setSelected(user)}>Lihat progres<span className="sr-only"> {displayName(user)}</span></button></div>
  </article>)}
  {users.data?.count===0&&<p>Tidak ada pengguna yang cocok.</p>}
  <Pages page={p.page} count={users.data?.count??0} onChange={p.setPage}/>
 </section>
}
function LearnerProgress({user,back}:{user:Learner;back:()=>void}){
 const query=useQuery({
  queryKey:['admin-learning-progress',user.id],
  queryFn:()=>rpc<Progress>('admin_learning_progress',{learner:user.id}),
  staleTime:15_000,
 })
 const progress=query.data
 return <section className="panel content-card stack">
  <div className="section-line"><button className="secondary" onClick={back}>Kembali ke daftar</button><button className="secondary" disabled={query.isFetching} onClick={()=>void query.refetch()}>Muat ulang progres</button></div>
  <div><h2>{displayName(user)}</h2><p className="muted">Level aktif {progress?.active_level??user.active_level}</p></div>
  <ErrorLine error={query.error}/>
  {query.isPending&&<p role="status">Memuat progres…</p>}
  {progress&&<>
   <div className="dashboard-columns">
    <section className="panel content-card stack"><h3>Progres materi {progress.active_level}</h3>
     <ProgressMeter label="Kosakata dikuasai" value={progress.words}/>
     <ProgressMeter label="Kanji dikuasai" value={progress.kanji}/>
     <ProgressMeter label="Pola tata bahasa selesai" value={progress.grammar}/>
     <p>{progress.practice.answered?`Akurasi latihan ${Math.round(progress.practice.correct/progress.practice.answered*100)}% (${progress.practice.correct} dari ${progress.practice.answered} jawaban benar)`:'Belum ada jawaban latihan di level aktif.'}</p>
    </section>
    <section className="panel content-card stack"><h3>Rencana belajar</h3><p>{progress.week_minutes} menit belajar dalam 7 hari terakhir</p>
     {progress.plan?<><p>Level rencana {progress.plan.level}</p><ProgressMeter label="Tugas selesai" value={progress.plan}/>
     {progress.plan.next_kind&&progress.plan.next_date&&<p>Tugas berikutnya {labels[progress.plan.next_kind]} · {shortDate(progress.plan.next_date)}</p>}</>:<p>Belum ada rencana belajar.</p>}
    </section>
   </div>
   <section className="stack"><h3>Aktivitas belajar terakhir</h3>
    <p className="muted">Hingga 12 sesi atau latihan yang tercatat.</p>
    {progress.recent.length?progress.recent.map(entry=><article className="history-entry section-line" key={entry.id}>
     <div><strong>{labels[entry.kind]}</strong>{entry.material&&<p>{entry.material}</p>}</div>
     <small>{[shortDate(entry.day),entry.at&&localTime.format(new Date(entry.at))+' WIB',entry.level,entry.minutes==null?null:entry.minutes+' mnt'].filter(Boolean).join(' · ')}</small>
    </article>):<p>Belum ada aktivitas belajar tercatat.</p>}
   </section>
  </>}
 </section>
}
function ProgressMeter({label,value}:{label:string;value:Count}){
 return <div className="stack"><div className="section-line"><span>{label}</span><strong>{value.done}/{value.total}</strong></div><Meter label={label} value={value.total?value.done/value.total*100:0}/></div>
}
