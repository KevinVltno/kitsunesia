import {Link} from 'react-router-dom'
import {BookOpen,Headphones,Layers3,ListChecks,Text} from 'lucide-react'
import {db,type Level} from './data'
import {useLevel} from './Levels'
import {Pages,Search,usePage,usePaging} from './Paging'
import {Empty,ErrorLine,Title} from './ui'

type Unit={id:string;level:Level;position:number;topic:string;title:string;grammar_pattern:string;passage_id:string;listening_id:string}
export function Curriculum(){
 const {level}=useLevel()
 return <Units key={level} level={level}/>
}
function Units({level}:{level:Level}){
 const p=usePaging()
 const catalog=usePage<Unit>('curriculum_units',{...p,level,columns:['title','topic'],sort:'position'})
 return <><Title title="Jalur belajar">JLPT {level} · Pelajari kosakata dan pola, lalu gunakan keduanya untuk membaca, mendengar, dan mengerjakan soal.</Title>
 <Search value={p.search} onChange={p.setSearch}/><ErrorLine error={catalog.error}/>
 {db&&catalog.isPending?<p role="status">Memuat unit…</p>:catalog.data?.items.length?<div className="curriculum-grid">{catalog.data.items.map(unit=><UnitCard key={unit.id} unit={unit}/>)}</div>:!catalog.error&&<Empty>Belum ada unit yang cocok untuk JLPT {level}.</Empty>}
 <Pages page={p.page} count={catalog.data?.count??0} onChange={p.setPage}/></>
}
function UnitCard({unit}:{unit:Unit}){
 const topic=encodeURIComponent(unit.topic)
 return <article className="panel content-card stack curriculum-card">
  <header><span className="level-pill">{unit.topic}</span><h2>{unit.title}</h2><p lang="ja">{unit.grammar_pattern}</p></header>
  <nav aria-label={'Materi '+unit.title}>
   <Link className="secondary" to={'/kosakata?topik='+topic}><Layers3 size={16}/> Kosakata</Link>
   <Link className="secondary" to={'/bunpou?topik='+topic}><Text size={16}/> Tata bahasa</Link>
   <Link className="secondary" to={'/membaca?materi='+unit.passage_id}><BookOpen size={16}/> Membaca</Link>
   <Link className="secondary" to={'/mendengar?materi='+unit.listening_id}><Headphones size={16}/> Mendengar</Link>
   <Link className="secondary" to={'/latihan?topik='+topic}><ListChecks size={16}/> Latihan soal</Link>
  </nav>
 </article>
}
