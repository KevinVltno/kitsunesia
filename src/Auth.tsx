import {useEffect,useState,type FormEvent,type ReactNode} from 'react'
import type {Session} from '@supabase/supabase-js'
import {useQueryClient} from '@tanstack/react-query'
import {Link,Navigate,useLocation} from 'react-router-dom'
import {db,message,reject} from './data'
import {Kitsu,Brand} from './ui'

export function useSession(){
 const [state,setState]=useState<{loading:boolean;session:Session|null}>({loading:!!db,session:null})
 const cache=useQueryClient()
 useEffect(()=>{
  if(!db)return
  let account:string|undefined
  const {data:{subscription}}=db.auth.onAuthStateChange((_event,session)=>{
   if(account!==session?.user.id)cache.clear()
   account=session?.user.id
   setState({loading:false,session})
  })
  return ()=>subscription.unsubscribe()
 },[cache])
 return state
}

export function RequireAuth({session,children}:{session:Session|null;children:ReactNode}){
 const location=useLocation()
 return session || !db ? children : <Navigate to="/masuk" replace state={{from:location.pathname+location.search}}/>
}

export function Login({session}:{session:Session|null}){
 const location=useLocation()
 const [register,setRegister]=useState(false)
 const [recovery,setRecovery]=useState(location.pathname==='/reset')
 const [busy,setBusy]=useState(false)
 const [status,setStatus]=useState('')
 useEffect(()=>{
  const sub=db?.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY')setRecovery(true)})
  return ()=>sub?.data.subscription.unsubscribe()
 },[])
 if(session&&!recovery)return <Navigate to={location.state?.from||'/'} replace/>
 const redirectTo=window.location.origin
 async function act(action:()=>Promise<void>){
  setBusy(true);setStatus('')
  try{await action()}catch(error){setStatus(message(error))}finally{setBusy(false)}
 }
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault()
  const form=new FormData(event.currentTarget)
  const email=String(form.get('email')??'')
  const password=String(form.get('password'))
  await act(async()=>{
   if(!db)throw new Error('Supabase belum dikonfigurasi.')
   if(recovery){
    reject((await db.auth.updateUser({password})).error)
    setRecovery(false)
   }else if(register){
    const {error,data}=await db.auth.signUp({email,password,options:{emailRedirectTo:redirectTo}})
    reject(error)
    if(!data.session)setStatus('Periksa email untuk mengonfirmasi akun.')
   }else reject((await db.auth.signInWithPassword({email,password})).error)
  })
 }
 return <main className="auth"><section className="auth-art"><Brand/><Kitsu/><h2>Belajar Jepang,<br/>selangkah demi selangkah.</h2><p>Temani Kitsu dalam perjalananmu menuju JLPT.</p></section><section className="auth-form"><div>
 <Link to="/">Kembali ke beranda</Link><h1>{recovery?'Buat kata sandi baru':register?'Buat akun belajar':'Selamat datang!'}</h1><p>{register?'Mulai perjalanan bahasa Jepangmu.':'Masuk untuk melanjutkan belajar bersama Kitsu.'}</p>
 <form onSubmit={submit} className="stack">{!recovery&&<label>Email<input name="email" id="login-email" type="email" autoComplete="email" required /></label>}<label>Kata sandi<input name="password" type="password" minLength={6} autoComplete={register||recovery?'new-password':'current-password'} required/></label><button className="primary" disabled={busy}>{recovery?'Simpan kata sandi':register?'Daftar':'Masuk'}</button></form>
 {!recovery&&<><button className="secondary full" disabled={busy} onClick={()=>act(async()=>{if(!db)throw new Error('Supabase belum dikonfigurasi.');reject((await db.auth.signInWithOAuth({provider:'google',options:{redirectTo}})).error)})}>Lanjut dengan Google</button><div className="auth-actions"><button className="text-button" onClick={()=>{setRegister(!register);setStatus('')}}>{register?'Sudah punya akun? Masuk':'Belum punya akun? Daftar'}</button><button className="text-button" disabled={busy} onClick={()=>act(async()=>{const email=(document.getElementById('login-email') as HTMLInputElement).value;if(!email)throw new Error('Isi alamat email terlebih dahulu.');if(!db)throw new Error('Supabase belum dikonfigurasi.');reject((await db.auth.resetPasswordForEmail(email,{redirectTo:redirectTo+'/reset'})).error);setStatus('Tautan pengaturan ulang telah dikirim.')})}>Lupa kata sandi?</button></div></>}
 {status&&<p role="status">{status}</p>}</div></section></main>
}
