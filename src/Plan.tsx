import {useState,type FormEvent} from 'react'
import {useMutation,useQueryClient} from '@tanstack/react-query'
import {Link} from 'react-router-dom'
import {CalendarDays,ChevronLeft,ChevronRight,Clock3,RotateCcw} from 'lucide-react'
import {db,today,shift,dateLabel,rows,labels,rpc,type Level,type Plan,type Task,type Template} from './data'
import {Empty,ErrorLine,Kitsu,LevelPicker,Meter,Title} from './ui'
import {useLevel,useSummaries} from './Levels'
import {Pages,Search,usePage,usePaging} from './Paging'

const weekdays=['Sen','Sel','Rab','Kam','Jum','Sab','Min']
function monday(day:string){return shift(day,-((new Date(day+'T00:00:00Z').getUTCDay()+6)%7))}

export function StudyPlan(){
 const active=useLevel()
 const [level,setLevel]=useState<Level>(active.level)
 const [days,setDays]=useState([1,2,3,4,5])
 const [editing,setEditing]=useState(false)
 const [week,setWeek]=useState(()=>monday(today()))
 const templatePaging=usePaging()
 const templates=usePage<Template>('study_plan_templates',{...templatePaging,level,columns:['title'],sort:'title'})
 const plans=rows<Plan>('study_plans')
 const tasks=rows<Task>('study_tasks','due_date')
 const selected=templates.data?.items??[]
 const cache=useQueryClient()
 const plan=plans.data?.[0]
 const summaries=useSummaries()
 const target=summaries.data?.find(item=>item.level===plan?.level)
 const pace=plan?.exam_date&&target?learningPace(plan,target):null
 const all=tasks.data??[]
 const completed=all.filter(t=>!!t.completed_at).length
 const percent=all.length?Math.round(completed/all.length*100):0
 const overdue=all.filter(t=>t.due_date<today()&&!t.completed_at).length
 const current=all.find(t=>t.due_date===today()&&!t.completed_at)
 const save=useMutation({mutationFn:(args:Record<string,unknown>)=>rpc('make_plan',args),onSuccess:()=>{setEditing(false);setWeek(monday(today()));void cache.invalidateQueries()}})
 const reschedule=useMutation({mutationFn:()=>rpc<number>('reschedule'),onSuccess:()=>{void cache.invalidateQueries()}})
 function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault()
  const data=new FormData(event.currentTarget)
  save.mutate({template:data.get('template'),exam:data.get('exam')||null,minutes:Number(data.get('minutes')),weekdays:days})
 }
 function isToday(day:string){return day===today()}
 return <><Title title="Rencana belajar">Atur waktu belajar sesuai ritmemu dan pantau setiap langkah menuju JLPT.</Title>
 <ErrorLine error={templates.error||plans.error||tasks.error||save.error||reschedule.error||summaries.error}/>
 {db&&(templates.isPending||plans.isPending||tasks.isPending)&&<p role="status">Memuat jadwal…</p>}
 {!db&&<Empty>Hubungkan Supabase dan masuk untuk menyimpan rencana belajarmu.</Empty>}
 {db&&!plans.isPending&&(!plan||editing)&&<form className="panel content-card stack" onSubmit={submit}>
 <h2>{plan?'Ubah rencana':'Buat rencana pertamamu'}</h2>{plan&&<p className="muted">Menyimpan rencana baru akan mengganti jadwal dan checklist rencana saat ini.</p>}
 <div><strong>Level target</strong><LevelPicker value={level} onChange={value=>{setLevel(value);templatePaging.setPage(0)}}/></div>
 <Search value={templatePaging.search} onChange={templatePaging.setSearch}/>
 <label>Template<select key={level} name="template" required>{selected.map(t=><option key={t.id} value={t.id}>{t.title} · {t.weeks} minggu</option>)}</select></label>
 <Pages page={templatePaging.page} count={templates.data?.count??0} onChange={templatePaging.setPage}/>
 <div className="form-grid"><label>Tanggal ujian (opsional)<input name="exam" type="date" min={today()} defaultValue={plan?.exam_date??''}/></label><label>Menit per hari<input name="minutes" type="number" min="5" max="240" defaultValue={plan?.daily_minutes??20} required/></label></div>
 <fieldset><legend>Hari belajar per minggu</legend><div className="weekdays">{weekdays.map((day,i)=><button type="button" key={day} className={days.includes(i+1)?'selected':''} aria-pressed={days.includes(i+1)} onClick={()=>setDays(days.includes(i+1)?days.filter(x=>x!==i+1):[...days,i+1].sort())}>{day}</button>)}</div></fieldset>
 <div className="toolbar"><button className="primary" disabled={!selected.length||!days.length||save.isPending}>Simpan rencana</button>{editing&&<button type="button" className="secondary" onClick={()=>setEditing(false)}>Batal</button>}</div></form>}
 {plan&&!editing&&<><section className="panel content-card stack"><div className="section-line"><div><span className="level-pill">JLPT {plan.level}</span><h2>Progres rencana</h2></div><button className="secondary" onClick={()=>{setLevel(plan.level);setDays(plan.days);setEditing(true)}}>Ubah rencana</button></div><div>{completed} dari {all.length} tugas selesai · {percent}%</div><Meter label="Progres rencana" value={percent}/></section>
 {current&&<div className="plan-reminder"><Kitsu/><div><strong>Yuk, belajar bersama Kitsu!</strong><p>Hari ini ada {labels[current.kind].toLowerCase()} selama {current.minutes} menit.</p></div><Link className="primary" to={'/'+current.kind+'?task='+current.id+'&level='+plan.level}>Mulai tugas</Link></div>}
 {pace&&<section className="panel content-card stack"><h2>Kecepatan menuju ujian</h2><p>Sisa {pace.words} kata dan {pace.kanji} kanji menuju target kumulatif {plan.level}.</p>{pace.days>0?<p>{pace.days} hari belajar tersisa · sekitar <strong>{Math.ceil(pace.words/pace.days)} kata dan {Math.ceil(pace.kanji/pace.days)} kanji per hari belajar</strong>.</p>:<p>Tidak ada hari belajar tersisa sebelum atau pada tanggal ujian.</p>}</section>}
 <section className="panel content-card stack"><div className="section-line"><h2><CalendarDays size={21}/> Jadwal mingguan</h2><div className="toolbar"><button className="icon-button" aria-label="Minggu sebelumnya" onClick={()=>setWeek(shift(week,-7))}><ChevronLeft/></button><button className="secondary" onClick={()=>setWeek(monday(today()))}>Minggu ini</button><button className="icon-button" aria-label="Minggu berikutnya" onClick={()=>setWeek(shift(week,7))}><ChevronRight/></button></div></div>
 <p>{dateLabel(week,{day:'numeric',month:'short'})} – {dateLabel(shift(week,6),{day:'numeric',month:'long',year:'numeric'})}</p>
 <div className="calendar">{weekdays.map((label,i)=>{const date=shift(week,i);const entries=all.filter(t=>t.due_date===date);return <article className={isToday(date)?'calendar-today':''} key={date}><small>{label}</small><strong>{Number(date.slice(8))}</strong>{entries.map(t=><Link key={t.id} className={t.completed_at?'done':''} to={'/'+t.kind+'?task='+t.id+'&level='+plan.level}>{t.completed_at?'✓ ':''}{labels[t.kind]}<small><Clock3 size={12}/> {t.minutes} mnt</small></Link>)}</article>})}</div>
 {overdue>0&&<div className="toolbar"><span>{overdue} tugas terlewat</span><button className="secondary" disabled={reschedule.isPending} onClick={()=>reschedule.mutate()}><RotateCcw size={16}/> Jadwal ulang</button></div>}
 {reschedule.isSuccess&&<p role="status">{reschedule.data?reschedule.data+' tugas dipindahkan ke hari belajar kosong berikutnya.':'Tidak ada hari belajar kosong dalam batas tanggal ujian.'}</p>}</section></>}
 </>
}
function learningPace(plan:Plan,target:{vocabulary:number;vocabulary_mastered:number;kanji:number;kanji_mastered:number}){
 const start=today()
 const span=Math.max(0,Math.round((Date.parse(plan.exam_date!)-Date.parse(start))/86_400_000)+1)
 const remainder=span%7
 let days=Math.floor(span/7)*new Set(plan.days).size
 for(let i=0;i<remainder;i++){
  const weekday=new Date(shift(start,i)+'T00:00:00Z').getUTCDay()||7
  if(plan.days.includes(weekday))days++
 }
 return {days,words:Math.max(0,target.vocabulary-target.vocabulary_mastered),kanji:Math.max(0,target.kanji-target.kanji_mastered)}
}
