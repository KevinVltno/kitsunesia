import {useEffect,useRef,useState,type ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {BookOpen,Check,Headphones,Layers3,RotateCcw,Volume2} from 'lucide-react'
import {Brand,Kitsu} from './ui'

const preview=[
 {glyph:'あ',sound:'a',options:['a','i','u','e']},
 {glyph:'き',sound:'ki',options:['ke','sa','ki','ku']},
 {glyph:'ね',sound:'ne',options:['me','nu','no','ne']},
 {glyph:'す',sound:'su',options:['su','shi','se','so']},
] as const

export function Landing({signedIn=false}:{signedIn?:boolean}){
 return <div className="landing">
  <a className="skip" href="#landing-content">Lewati ke konten</a>
  <header className="landing-header landing-wrap">
   <Brand/>
   <nav aria-label="Navigasi situs"><a href="#materi">Materi</a><a href="#coba">Coba latihan</a><a href="#pertanyaan">FAQ</a></nav>
   <Link className="landing-outline" to={signedIn?'/belajar':'/masuk'}>{signedIn?'Ruang belajar':'Masuk'}</Link>
  </header>
  <main id="landing-content">
   <section className="landing-hero landing-wrap">
    <div className="landing-hero-copy">
     <p className="landing-kicker"><span/> JLPT N5–N1</p>
     <h1>Belajar bahasa Jepang <em>bersama Kitsu.</em></h1>
     <p className="landing-lead">Kenali huruf pertamamu, pahami percakapan sehari-hari, dan lanjutkan sampai siap berlatih soal JLPT.</p>
     <div className="landing-actions">
      <Link className="landing-primary" to="/belajar">Mulai belajar</Link>
      <a className="landing-outline" href="#coba">Coba tanpa akun</a>
     </div>
    </div>
    <div className="landing-postcard">
     <div className="postcard-image" aria-hidden="true"/>
     <Kitsu/>
     <div className="postcard-caption"><span>Teman belajarmu</span><strong>Kitsu</strong></div>
    </div>
   </section>
   <section className="landing-topics" id="materi">
    <div className="landing-wrap landing-section">
     <div className="landing-section-title"><h2>Pilih cara belajarmu</h2><Link className="landing-outline" to="/jalur">Buka jalur belajar</Link></div>
     <div className="landing-card-grid">
      <LandingCard to="/huruf" tone="gold" icon={<span lang="ja">あ</span>} title="Huruf dan goresan">Kenali hiragana, katakana, dan kanji. Dengarkan pelafalan dan ikuti urutan goresannya.</LandingCard>
      <LandingCard to="/kosakata" tone="peach" icon={<Layers3 size={25}/>} title="Kosakata dan pola">Balik kartu hafalan, ulangi kata yang sulit, dan pelajari cara memakainya dalam kalimat.</LandingCard>
      <LandingCard to="/mendengar" tone="teal" icon={<Headphones size={25}/>} title="Baca dan dengarkan">Latih pemahaman lewat cerita, berita pendek, dan rekaman situasi sehari-hari.</LandingCard>
     </div>
    </div>
   </section>
   <section className="landing-wrap landing-section landing-practice" id="coba">
    <div><p className="landing-kicker">Latihan kana</p><h2>Huruf ini dibaca apa?</h2><p>Tebak bacaan hiragana, lalu dengarkan pelafalannya.</p></div>
    <KanaPreview/>
   </section>
   <section className="landing-wrap landing-section landing-faq" id="pertanyaan">
    <h2>Pertanyaan umum</h2>
    <div>
     <details><summary>Mulai dari mana kalau saya baru belajar?</summary><p>Mulai dari N5 dan kenali hiragana. Kalau sudah pernah belajar, kamu bisa memilih level atau mengikuti tes penempatan setelah masuk.</p></details>
     <details><summary>Apakah progres saya tersimpan?</summary><p>Ya. Masuk ke akun untuk menyimpan riwayat latihan, kartu hafalan, dan rencana belajar.</p></details>
    </div>
   </section>
  </main>
  <footer className="landing-footer"><div className="landing-wrap"><Brand/><Link to="/belajar"><BookOpen size={16}/> Ruang belajar</Link></div></footer>
 </div>
}

function LandingCard({to,tone,icon,title,children}:{to:string;tone:string;icon:ReactNode;title:string;children:string}){
 return <Link className={'landing-card '+tone} to={to}><span className="landing-card-icon" aria-hidden="true">{icon}</span><h3>{title}</h3><p>{children}</p></Link>
}

function KanaPreview(){
 const [index,setIndex]=useState(0)
 const [guess,setGuess]=useState<string>()
 const [audioError,setAudioError]=useState(false)
 const audio=useRef<HTMLAudioElement|null>(null)
 const card=preview[index]
 useEffect(()=>()=>{audio.current?.pause();audio.current=null},[])
 function play(){
  setAudioError(false)
  audio.current?.pause()
  const sample=new Audio('/kana-audio/'+card.sound+'.mp3')
  audio.current=sample
  void sample.play().catch(()=>{if(audio.current===sample)setAudioError(true)})
 }
 function next(){
  audio.current?.pause()
  audio.current=null
  setGuess(undefined)
  setAudioError(false)
  setIndex(i=>(i+1)%preview.length)
 }
 return <div className="kana-preview">
  <div className="preview-glyph"><span lang="ja">{card.glyph}</span><button className="icon-button" aria-label="Dengar pelafalan" onClick={play}><Volume2 size={21}/></button></div>
  <div className="preview-options" aria-label="Pilihan bacaan">{card.options.map(option=><button type="button" key={option} className={guess===option?'selected':''} disabled={guess!==undefined} onClick={()=>setGuess(option)}>{option}</button>)}</div>
  <div className="preview-feedback">
   <p role="status">{audioError?'Audio belum bisa diputar.':guess===undefined?'Pilih satu jawaban.':guess===card.sound?<><Check size={17}/> Benar! Dibaca {card.sound}.</>:'Dibaca '+card.sound+'. Coba huruf berikutnya.'}</p>
   {guess!==undefined&&<button className="landing-outline" onClick={next}><RotateCcw size={15}/> Huruf berikutnya</button>}
  </div>
 </div>
}
