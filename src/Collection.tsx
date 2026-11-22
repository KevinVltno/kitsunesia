import {useState,type FormEvent} from 'react'
import {useMutation,useQueryClient} from '@tanstack/react-query'
import {Bookmark,NotebookPen,Target,Trash2} from 'lucide-react'
import {db,needDb,reject,type Note,type Profile} from './data'
import {useLevel} from './Levels'
import {Pages,Search,usePage,usePaging} from './Paging'
import {Empty,ErrorLine,Title} from './ui'

export function Collection({profile}:{profile?:Profile}){
 const cache=useQueryClient()
 const {level}=useLevel()
 const bookmarksPaging=usePaging()
 const notesPaging=usePaging()
 const bookmarks=usePage<{id:string;title:string;meaning:string;reading:string}>('bookmark_entries',{...bookmarksPaging,level,columns:['title','meaning','reading']})
 const notes=usePage<Note>('notes',{...notesPaging,columns:['body'],sort:'created_at',descending:true})
 const [body,setBody]=useState('')
 const [edit,setEdit]=useState<string|null>(null)
 const update=useMutation({mutationFn:async({table,id,data}:{table:string;id?:string;data?:Record<string,unknown>})=>{
  const query=needDb().from(table)
  reject((data?(id?await query.update(data).eq('id',id):await query.insert(data)):await query.delete().eq('id',id!)).error)
 },onSuccess:(_,variables)=>{
  if(variables.table==='notes'&&variables.data){setBody('');setEdit(null)}
  void cache.invalidateQueries({queryKey:[variables.table==='bookmarks'?'bookmark_entries':variables.table]})
  if(variables.table==='profiles')void cache.invalidateQueries({queryKey:['srs']})
 }})
 function goals(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  const f=new FormData(e.currentTarget)
  if(profile)update.mutate({table:'profiles',id:profile.id,data:{goal_minutes:Number(f.get('minutes')),goal_cards:Number(f.get('cards')),new_card_limit:Number(f.get('limit'))}})
 }
 return <><Title title="Koleksi saya">Simpan yang penting dan sesuaikan target harianmu.</Title><ErrorLine error={bookmarks.error||notes.error||update.error}/>
 {!db?<Empty>Masuk setelah Supabase terhubung untuk menggunakan koleksi pribadi.</Empty>:<>
 {profile&&<form key={profile.id} id="target" className="panel content-card stack" onSubmit={goals}><h2><Target size={22}/> Target harian</h2><div className="form-grid"><label>Menit belajar<input name="minutes" type="number" min="1" max="240" required defaultValue={profile.goal_minutes}/></label><label>Jumlah kartu<input name="cards" type="number" min="1" max="200" required defaultValue={profile.goal_cards}/></label><label>Batas kartu baru per hari<input name="limit" type="number" min="1" max="100" required defaultValue={profile.new_card_limit}/></label></div><button className="primary" disabled={update.isPending}>Simpan target</button>{update.isSuccess&&update.variables.table==='profiles'&&<p role="status">Target diperbarui.</p>}</form>}
 <section className="panel content-card stack"><h2><Bookmark size={22}/> Bookmark · {level}</h2><Search value={bookmarksPaging.search} onChange={bookmarksPaging.setSearch}/>{bookmarks.data?.items.length?bookmarks.data.items.map(b=><div className="section-line history-entry" key={b.id}><div><strong lang="ja">{b.title}</strong><p>{[b.reading,b.meaning].filter(Boolean).join(' · ')}</p></div><button className="icon-button" aria-label="Hapus bookmark" disabled={update.isPending} onClick={()=>update.mutate({table:'bookmarks',id:b.id})}><Trash2 size={17}/></button></div>):<p>Belum ada bookmark yang cocok.</p>}<Pages page={bookmarksPaging.page} count={bookmarks.data?.count??0} onChange={bookmarksPaging.setPage}/></section>
 <section className="panel content-card stack"><h2><NotebookPen size={22}/> Catatan pribadi</h2><form className="stack" onSubmit={e=>{e.preventDefault();if(body.trim())update.mutate({table:'notes',id:edit??undefined,data:{body:body.trim()}})}}><label>{edit?'Edit catatan':'Catatan baru'}<textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={5000} required/></label><div className="toolbar"><button className="primary" disabled={!body.trim()||update.isPending}>Simpan catatan</button>{edit&&<button type="button" className="secondary" onClick={()=>{setBody('');setEdit(null)}}>Batal</button>}</div></form>
 <Search value={notesPaging.search} onChange={notesPaging.setSearch}/>{notes.data?.items.map(n=><article className="history-entry section-line" key={n.id}><p className="note-body">{n.body}</p><div className="toolbar"><button className="secondary" onClick={()=>{setEdit(n.id);setBody(n.body)}}>Edit</button><button className="icon-button" aria-label="Hapus catatan" disabled={update.isPending} onClick={()=>{if(edit===n.id){setEdit(null);setBody('')}update.mutate({table:'notes',id:n.id})}}><Trash2 size={17}/></button></div></article>)}<Pages page={notesPaging.page} count={notes.data?.count??0} onChange={notesPaging.setPage}/></section></>}
 </>
}
