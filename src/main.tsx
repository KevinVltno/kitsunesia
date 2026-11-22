import {useEffect,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter,Link,Navigate,NavLink,Route,Routes,useLocation} from 'react-router-dom'
import {QueryClient,QueryClientProvider,useQuery} from '@tanstack/react-query'
import {BookOpen,Bookmark,CalendarDays,ChevronDown,House,LogIn,LogOut,Menu,Shield,UserRound,X} from 'lucide-react'
import {Admin} from './Admin'
import {Login,RequireAuth,useSession} from './Auth'
import {Collection} from './Collection'
import {Dashboard} from './Dashboard'
import {Kana,Writing} from './Kana'
import {Listening,Reading} from './Lessons'
import {GrammarLesson,KanjiLesson,Vocabulary} from './Content'
import {Exercises} from './Quiz'
import {LevelProvider,Placement,useLevel} from './Levels'
import {StudyPlan} from './Plan'
import {Curriculum} from './Curriculum'
import {Landing} from './Landing'
import {db,labels,levels,isLevel,needDb,reject,useDailyStats,type Profile} from './data'
import {Brand,Empty,ErrorLine,Kitsu,Streak,modules} from './ui'
import './styles.css'
import './levels.css'
import './experience.css'

const client=new QueryClient({defaultOptions:{queries:{staleTime:30_000,retry:1},mutations:{retry:0}}})
const workspaceLinks=[
 {to:'/belajar',label:'Beranda',icon:House,color:'purple'},
 {to:'/jalur',label:'Jalur Belajar',short:'Jalur',icon:BookOpen,color:'green'},
 {to:'/rencana',label:'Rencana Belajar',short:'Rencana',icon:CalendarDays,color:'amber'},
 {to:'/koleksi',label:'Koleksi Saya',short:'Koleksi',icon:Bookmark,color:'rose'},
] as const
function Workspace({session}:{session:ReturnType<typeof useSession>['session']}){
 const profiles=useQuery({queryKey:['profiles','self',session?.user.id],enabled:!!session&&!!db,queryFn:async()=>{
  const r=await needDb().from('profiles').select('*').eq('id',session!.user.id).single()
  reject(r.error);return r.data as Profile
 }})
 if(session&&profiles.isPending)return <main className="loading" role="status">Memuat profil…</main>
 if(profiles.error)return <main className="loading"><ErrorLine error={profiles.error}/><button className="secondary" onClick={()=>void db?.auth.signOut()}>Keluar</button></main>
 return <LevelProvider profile={profiles.data}><WorkspaceLayout session={session} profile={profiles.data}/></LevelProvider>
}
function WorkspaceLayout({session,profile}:{session:ReturnType<typeof useSession>['session'];profile?:Profile}){
 const path=useLocation()
 const [menu,setMenu]=useState(false)
 const [account,setAccount]=useState(false)
 const [signoutError,setSignoutError]=useState<unknown>(null)
 const stats=useDailyStats()
 const active=useLevel()
 const home=path.pathname==='/'||path.pathname==='/belajar'
 useEffect(()=>{
  setMenu(false);setAccount(false)
  if(path.hash)requestAnimationFrame(()=>document.getElementById(path.hash.slice(1))?.scrollIntoView())
  else window.scrollTo(0,0)
 },[path.pathname,path.search,path.hash])
 async function signout(){
  setSignoutError(null)
  if(db){const {error}=await db.auth.signOut();setSignoutError(error)}
 }
 if(profile&&!profile.level_selected&&path.pathname!=='/penempatan')return <Navigate replace to="/penempatan"/>
 return <div className="workspace">
 <a className="skip" href="#content">Lewati ke konten</a>
 {menu&&<button className="mobile-backdrop" aria-label="Tutup navigasi" onClick={()=>setMenu(false)}/>}
 <aside className={'sidebar '+(menu?'mobile-open':'')} id="navigation"><div className="sidebar-head"><Brand/><button className="icon-button nav-close" onClick={()=>setMenu(false)} aria-label="Tutup navigasi"><X size={21}/></button></div><nav aria-label="Navigasi utama">
 <span className="nav-label">BELAJAR</span>{workspaceLinks.slice(0,3).map(({to,label,icon:Icon,color})=><NavLink key={to} to={to} className={({isActive})=>isActive||to==='/belajar'&&home?'active':undefined}><span className={'side-icon '+color}><Icon size={17}/></span>{label}</NavLink>)}
 <span className="nav-label">MATERI</span>{modules.map(({id,icon:Icon,color})=><NavLink key={id} to={'/'+id}><span className={'side-icon '+color}><Icon size={17}/></span>{labels[id]}</NavLink>)}
 <span className="nav-label">PRIBADI</span><NavLink to="/koleksi"><span className="side-icon rose"><Bookmark size={17}/></span>Koleksi Saya</NavLink>{profile?.role==='admin'&&<NavLink to="/admin"><span className="side-icon blue"><Shield size={17}/></span>Administrasi</NavLink>}</nav>
 <div className="sidebar-foot"><Kitsu/><div><span>Kitsunesia</span><Link to="/tentang">Tentang aplikasi</Link></div></div></aside>
 <div className="shell"><header className="topbar"><div className="topbar-inner"><button className="icon-button nav-toggle" aria-label="Buka navigasi" aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(!menu)}><Menu size={23}/></button><span className="top-label">Ruang Belajar</span><div className="top-actions"><label className="active-level"><span>Level aktif</span><select aria-label="Level aktif" value={active.level} disabled={active.pending} onChange={e=>{if(isLevel(e.target.value))active.setLevel(e.target.value)}}>{levels.map(level=><option key={level}>{level}</option>)}</select></label><Streak days={stats.data?.days??0}/>{session?<div className="account"><button className="account-button" aria-expanded={account} onClick={()=>setAccount(!account)}><span className="avatar"><UserRound size={17}/></span><span>{profile?.name||session.user.email?.split('@')[0]||'Akun saya'}</span><ChevronDown size={15}/></button>{account&&<div className="account-menu panel stack"><Link className="secondary" to="/penempatan">Tes penempatan</Link><button className="secondary" onClick={signout}><LogOut size={16}/> Keluar</button><ErrorLine error={signoutError}/></div>}</div>:<Link to="/masuk" className="account-button"><LogIn size={17}/> Masuk</Link>}</div></div></header>
 <main className="page" id="content"><ErrorLine error={active.error||stats.error}/><Routes location={path} key={path.pathname+path.search}><Route index element={<Dashboard profile={profile}/>}/><Route path="/belajar" element={<Dashboard profile={profile}/>}/><Route path="/jalur" element={<Curriculum/>}/><Route path="/penempatan" element={<Placement/>}/><Route path="/kanji" element={<KanjiLesson/>}/><Route path="/bunpou" element={<GrammarLesson/>}/><Route path="/rencana" element={<StudyPlan/>}/><Route path="/huruf" element={<Kana/>}/><Route path="/menulis" element={<Writing/>}/><Route path="/kosakata" element={<Vocabulary/>}/><Route path="/membaca" element={<Reading/>}/><Route path="/latihan" element={<Exercises/>}/><Route path="/mendengar" element={<Listening/>}/><Route path="/koleksi" element={<Collection profile={profile}/>}/><Route path="/admin" element={<Admin profile={profile}/>}/><Route path="*" element={<Empty>Halaman ini tidak ditemukan. <Link to="/">Kembali ke beranda</Link></Empty>}/></Routes></main></div>
 <nav className="mobile-dock" aria-label="Akses cepat">{workspaceLinks.map(item=><NavLink key={item.to} to={item.to} className={({isActive})=>isActive||item.to==='/belajar'&&home?'active':undefined}><item.icon size={20}/>{'short' in item?item.short:item.label}</NavLink>)}</nav>
 </div>
}

function App(){
 const {session,loading}=useSession()
 if(loading)return <main className="loading" role="status"><Brand/><p>Memuat ruang belajar…</p></main>
 return <Routes>{!session&&<Route path="/" element={<Landing/>}/>}<Route path="/tentang" element={<Landing signedIn={!!session}/>}/><Route path="/masuk" element={<Login session={session}/>}/><Route path="/reset" element={<Login session={session}/>}/><Route path="*" element={<RequireAuth session={session}><Workspace session={session}/></RequireAuth>}/></Routes>
}

createRoot(document.getElementById('root')!).render(<QueryClientProvider client={client}><BrowserRouter><App/></BrowserRouter></QueryClientProvider>)
