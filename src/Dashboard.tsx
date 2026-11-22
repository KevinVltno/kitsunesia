import {Link} from 'react-router-dom'
import {BookOpen,CalendarDays,Clock3,Flame,Layers3,Target} from 'lucide-react'
import {db,rows,labels,today,dateLabel,useDailyStats,type Badge,type Plan,type Profile,type Task} from './data'
import {recommendation,useLevel,useSummaries} from './Levels'
import {ErrorLine,Kitsu,Meter,ModuleGrid} from './ui'

export function Dashboard({profile}:{profile?:Profile}){
 const active=useLevel()
 const statsToday=useDailyStats()
 const summaries=useSummaries()
 const summary=summaries.data?.find(s=>s.level===active.level)
 const suggested=summary&&recommendation(summary)
 const tasks=rows<Task>('study_tasks','due_date')
 const plans=rows<Plan>('study_plans')
 const awards=rows<{code:string}>('user_achievements','code')
 const badges=rows<Badge>('achievements','code')
 const items=tasks.data??[]
 const now=today()
 const current=items.filter(t=>t.due_date===now)
 const pending=current.find(t=>!t.completed_at)
 const days=statsToday.data?.days??0
 const wins=summary?.correct??0
 const total=summary?.answers??0
 const mastered=summary?.vocabulary_mastered??0
 const progress=items.length?Math.round(items.filter(t=>t.completed_at).length/items.length*100):0
 const minutes=statsToday.data?.minutes??0
 const cards=statsToday.data?.cards??0
 const plan=plans.data?.[0]
 const to=pending?'/'+pending.kind+'?task='+pending.id+'&level='+plan?.level:plan?'/rencana':'/jalur'
 const stats=[
  {icon:Flame,color:'amber',value:days+' hari',label:'Streak belajar',sub:days?'Pertahankan ritmemu!':'Mulai dari hari ini'},
  {icon:Layers3,color:'green',value:String(mastered),label:'Kata dikuasai',sub:'Dari ulasan kosakata'},
  {icon:Target,color:'rose',value:total?Math.round(wins/total*100)+'%':'—',label:'Akurasi latihan',sub:total+' jawaban tercatat'},
  {icon:CalendarDays,color:'purple',value:progress+'%',label:'Progres rencana',sub:items.filter(t=>t.completed_at).length+' dari '+items.length+' tugas'},
 ]
 return <>
 <div className="dashboard-heading"><div><h1>Beranda</h1><p>{dateLabel(now,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div><span className="level-pill">JLPT {active.level}</span></div>
 <section className="hero"><div className="hero-copy"><span className="hero-japanese" lang="ja">こんにちは</span><h2>Halo, {profile?.name.trim().split(/\s+/)[0]||'Sobat Kitsu'}!</h2><p>{pending?'Kitsu sudah menyiapkan tugas hari ini. Yuk, lanjutkan langkah kecil menuju targetmu!':days?'Kitsu menemanimu menjaga streak. Siap untuk sesi berikutnya?':'Satu langkah kecil hari ini, makin dekat dengan tujuanmu. Yuk, belajar bahasa Jepang bareng Kitsu!'}</p><div className="hero-actions"><Link className="hero-button" to={to}>{pending?'Mulai tugas hari ini':plan?'Lihat rencana belajar':'Buka jalur belajar'}</Link><Link className="hero-quick" to={active.level==='N5'?'/huruf':'/latihan'}>{active.level==='N5'?'Latihan kana':'Latihan soal'}</Link></div></div><div className="hero-art"><div className="hero-disc"/><span className="spark spark-one">✦</span><span className="spark spark-two">✦</span><span className="spark spark-three">✧</span><Kitsu/></div></section>
 <ErrorLine error={summaries.error||statsToday.error||tasks.error||plans.error||awards.error||badges.error}/>
 <div className="dashboard-columns"><section className="dashboard-section"><div className="section-line"><h2>Belajar hari ini</h2><Link to="/rencana">Lihat jadwal </Link></div>
 <div className="panel today-panel">{current.length?current.map(t=><Link className="today-task" key={t.id} to={'/'+t.kind+'?task='+t.id+'&level='+plan?.level}><span className={'task-check '+(t.completed_at?'checked':'')}>{t.completed_at?'✓':''}</span><span><strong>{labels[t.kind]}</strong><small>Rencana JLPT {plan?.level}</small></span><span className="task-time"><Clock3 size={14}/>{t.minutes} mnt</span></Link>):<div className="today-empty"><span className="tile purple"><BookOpen size={20}/></span><div><strong>{plan?'Tidak ada tugas hari ini':'Belum ada jadwal hari ini'}</strong><p>{plan?'Kamu bisa belajar bebas atau melihat tugas berikutnya.':'Atur ritme belajarmu dengan rencana mingguan.'}</p></div></div>}</div></section>
 <section className="dashboard-section"><div className="section-line"><h2>Target harian</h2><Link to="/koleksi#target">Atur target </Link></div><div className="panel goals"><div><span><Clock3 size={15}/> Menit belajar</span><strong>{minutes}/{profile?.goal_minutes??20}</strong></div><Meter label="Menit belajar" value={minutes/(profile?.goal_minutes??20)*100}/><div><span><Layers3 size={15}/> Kartu diulas</span><strong>{cards}/{profile?.goal_cards??10}</strong></div><Meter label="Kartu diulas" value={cards/(profile?.goal_cards??10)*100}/></div></section></div>
 <section className="dashboard-section"><div className="section-line"><h2>Jelajahi materi</h2><Link to="/jalur">Jalur belajar</Link></div><ModuleGrid/></section>
 <section className="dashboard-section"><h2>Statistik belajar</h2><div className="stats">{stats.map(({icon:Icon,color,value,label,sub})=><article className="stat panel" key={label}><span className={'tile '+color}><Icon size={21}/></span><strong>{value}</strong><span>{label}</span><small>{sub}</small></article>)}</div></section>
 {summary&&<section className="dashboard-section"><h2>Progres JLPT {summary.level}</h2><div className="modules">{([
  ['Kosakata',summary.vocabulary_mastered,summary.vocabulary_available,summary.vocabulary],
  ['Kanji',summary.kanji_mastered,summary.kanji_available,summary.kanji],
  ['Tata bahasa',summary.grammar_mastered,summary.grammar_available,summary.grammar],
 ] as const).map(([name,mastered,available,target])=><article className="panel level-stat stack" key={name}><h3>{name}</h3><p>{mastered} dikuasai · {available} tersedia · target {target}</p><Meter label={'Progres target '+name} value={mastered/target*100}/><small>{Math.round(mastered/target*100)}% target · {available?Math.round(mastered/available*100):0}% materi tersedia</small></article>)}</div>{suggested&&<div className="plan-reminder"><Kitsu/><div><strong>Siap mencoba {suggested}?</strong><p>Kosakata dan akurasi sudah mencapai ambang rekomendasi.</p></div><button className="primary" disabled={active.pending} onClick={()=>active.setLevel(suggested)}>Pindah ke {suggested}</button></div>}</section>}
 {!!awards.data?.length&&<section className="dashboard-section"><h2>Pencapaian</h2><div className="modules">{badges.data?.filter(b=>awards.data?.some(a=>a.code===b.code)).map(b=><article className="panel badge" key={b.code}>🏅 <strong>{b.title}</strong><p>{b.description}</p></article>)}</div></section>}
 {!db&&<p className="muted setup-status">Mode pratinjau. Hubungkan Supabase untuk menyimpan progres dan membuka materi lengkap.</p>}
 </>
}
