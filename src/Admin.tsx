import {useState,type FormEvent} from 'react'
import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query'
import {Pencil,Plus,Trash2} from 'lucide-react'
import {labels,levels,needDb,reject,rpc,sectionLabels,type Kind,type Level,type Profile} from './data'
import {useLevel,useSummaries} from './Levels'
import {Pages,Search,usePage,usePaging} from './Paging'
import {CsvImport,importKinds,type ImportKind} from './Import'
import {Empty,ErrorLine,Title} from './ui'

type Row=Record<string,unknown>
type Field={key:string;label:string;type?:'text'|'long'|'number'|'list'|'activities'|'checkbox'|'passage'|'audio';choices?:string[];optional?:boolean;min?:number;max?:number}
const field=(key:string,label:string,extra:Partial<Field>={}):Field=>({key,label,...extra})
const long=(key:string,label:string,optional=false)=>field(key,label,{type:'long',optional})
const number=(key:string,label:string,min=1,max?:number)=>field(key,label,{type:'number',min,max})
const levelField=field('level','Level',{choices:[...levels]})
const title=field('title','Judul')
const optional=(key:string,label:string)=>field(key,label,{optional:true})
const configs={
 kana:{label:'Huruf',sort:'position',search:['glyph','romaji'],key:'glyph',fields:[levelField,field('glyph','Karakter'),field('script','Aksara',{choices:['hiragana','katakana']}),field('category','Kelompok',{choices:['dasar','dakuten','yoon']}),field('romaji','Romaji'),number('position','Urutan'),optional('audio_path','Path audio')]},
 vocabulary:{label:'Kosakata',sort:'japanese',search:['japanese','reading','meaning','topic','part_of_speech'],key:'id',fields:[levelField,field('japanese','Kata Jepang'),field('reading','Bacaan kana'),optional('romaji','Romaji'),field('meaning','Arti'),field('topic','Topik'),field('part_of_speech','Jenis kata'),long('example','Kalimat contoh',true),long('example_translation','Terjemahan contoh',true),optional('audio_path','Path audio')]},
 kanji:{label:'Kanji',sort:'character',search:['character','meaning','onyomi','kunyomi'],key:'id',fields:[levelField,field('character','Karakter'),optional('onyomi','Onyomi'),optional('kunyomi','Kunyomi'),field('meaning','Arti'),number('strokes','Jumlah goresan',1,64),long('examples','Contoh kata',true),optional('stroke_path','Nama berkas SVG KanjiVG')]},
 grammar_points:{label:'Tata bahasa',sort:'pattern',search:['pattern'],key:'id',fields:[levelField,optional('topic','Topik'),field('pattern','Pola'),long('explanation','Penjelasan'),field('formula','Rumus'),long('examples','Contoh'),long('common_errors','Kesalahan umum')]},
 passages:{label:'Bacaan',sort:'title',search:['title'],key:'id',fields:[levelField,optional('topic','Topik'),title,long('body','Teks. Furigana memakai format [漢字|かんじ]'),long('translation','Terjemahan')]},
 listening:{label:'Audio',sort:'title',search:['title'],key:'id',fields:[levelField,optional('topic','Topik'),title,optional('path','Path objek Storage')]},
 questions:{label:'Soal',sort:'prompt',search:['prompt'],key:'id',fields:[levelField,optional('topic','Topik'),field('section','Bagian',{choices:Object.keys(sectionLabels)}),long('prompt','Pertanyaan'),field('passage_id','Bacaan terkait',{type:'passage',optional:true}),field('listening_id','Audio terkait',{type:'audio',optional:true}),field('options','Pilihan, satu per baris. Kosong untuk isian',{type:'list',optional:true}),field('answers','Jawaban diterima, satu per baris',{type:'list'}),long('explanation','Pembahasan'),long('transcript','Transkrip audio',true),field('placement','Gunakan untuk tes penempatan',{type:'checkbox'})]},
 study_plan_templates:{label:'Template rencana',sort:'title',search:['title'],key:'id',fields:[levelField,title,number('weeks','Minggu',1,52),field('activities','Siklus kegiatan, dipisahkan koma',{type:'activities'})]},
 level_targets:{label:'Target level',sort:'level',search:[],key:'level',fields:[levelField,number('vocabulary','Target kosakata'),number('kanji','Target kanji'),number('grammar','Target tata bahasa')]},
} satisfies Record<string,{label:string;sort:string;search:string[];key:string;fields:Field[]}>
type Tab=keyof typeof configs

function labelOf(row:Row){
 return String(row.title??row.japanese??row.character??row.glyph??row.pattern??row.prompt??row.level)
}

function Attachment({field,initial,level}:{field:Field;initial:string;level:Level}){
 const [selected,setSelected]=useState(initial)
 const p=usePaging()
 const data=usePage<Row>(field.type==='passage'?'passages':'listening',{...p,level,sort:'title',columns:['title']})
 return <div className="stack"><strong>{field.label}</strong><label>Cari judul<input type="search" value={p.search} onChange={e=>p.setSearch(e.target.value)}/></label><select aria-label={field.label} name={field.key} value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Tanpa materi terkait</option>{selected&&!data.data?.items.some(x=>x.id===selected)&&<option value={selected}>Materi terpilih · {selected}</option>}{data.data?.items.map(x=><option value={String(x.id)} key={String(x.id)}>{labelOf(x)}</option>)}</select><Pages page={p.page} count={data.data?.count??0} onChange={p.setPage}/><ErrorLine error={data.error}/></div>
}

function Editor({table,level}:{table:Tab;level:Level}){
 const config=configs[table]
 const p=usePaging()
 const list=usePage<Row>(table,{...p,level,columns:config.search,sort:config.sort})
 const [current,setCurrent]=useState<Row>()
 const [open,setOpen]=useState(false)
 const [remove,setRemove]=useState<Row>()
 const [notice,setNotice]=useState('')
 const [editLevel,setEditLevel]=useState(level)
 const cache=useQueryClient()
 const storageTable=table==='listening'||table==='vocabulary'||table==='kana'
 const keys=useQuery({queryKey:['answer_keys',current?.id],enabled:open&&table==='questions'&&!!current,queryFn:async()=>{
  const r=await needDb().from('answer_keys').select('*').eq('question_id',current!.id).single()
  reject(r.error);return r.data as Row
 }})
 const item={...current,...keys.data}
 const pathColumn=table==='listening'?'path':'audio_path'
 async function removeManagedAudio(path:unknown){
  if(typeof path!=='string'||!path.startsWith('uploads/'))return
  const client=needDb()
  const linked=await Promise.all([['listening','path'],['vocabulary','audio_path'],['kana','audio_path']].map(([source,column])=>client.from(source).select(column).eq(column,path).limit(1)))
  if(linked.some(r=>r.error)){setNotice('Metadata tersimpan. Periksa berkas lama di Storage.');return}
  if(linked.some(r=>r.data?.length))return
  const {error}=await client.storage.from('learning-audio').remove([path])
  if(error)setNotice('Metadata tersimpan. Periksa berkas lama di Storage.')
 }
 const save=useMutation({mutationFn:async({fields,file}:{fields:Row;file:File|null})=>{
  setNotice('')
  const client=needDb()
  if(table==='questions'){
   if(fields.passage_id&&fields.listening_id)throw new Error('Pilih satu jenis materi terkait.')
   if(fields.listening_id&&!fields.transcript)throw new Error('Isi transkrip untuk soal mendengar.')
   if(fields.placement&&(fields.passage_id||fields.listening_id))throw new Error('Soal penempatan harus dapat dikerjakan tanpa materi terkait.')
   const options=fields.options as string[]
   const answers=fields.answers as string[]
   if(!answers.length || options.length>0&&(options.length<2||new Set(options).size!==options.length||answers.some(a=>!options.includes(a))))throw new Error('Isi jawaban yang valid dan pilihan unik.')
   await rpc('save_question',{data:{...fields,id:current?.id}})
   return
  }
  let uploaded:string|undefined
  if(storageTable&&file?.size){
   if(file.size>20*1024*1024)throw new Error('Ukuran audio maksimal 20 MB.')
   const extension=file.name.split('.').pop()?.toLowerCase()??''
   if(!['mp3','wav','ogg','m4a','webm'].includes(extension))throw new Error('Pilih audio MP3, WAV, OGG, M4A, atau WebM.')
   uploaded='uploads/'+crypto.randomUUID()+'.'+extension
   reject((await client.storage.from('learning-audio').upload(uploaded,file)).error)
   fields[pathColumn]=uploaded
  }
  if(table==='listening'&&!fields.path)throw new Error('Pilih berkas audio atau isi path Storage.')
  if((table==='vocabulary'||table==='kana')&&!fields.audio_path)fields.audio_path=null
  if(table==='kanji'&&!fields.stroke_path)fields.stroke_path=null
  if(table==='study_plan_templates'&&(!(fields.activities as Kind[]).length||(fields.activities as Kind[]).some(x=>!Object.hasOwn(labels,x))))throw new Error('Periksa nama kegiatan.')
  const result=current?await client.from(table).update(fields).eq(config.key,current[config.key]):await client.from(table).insert(fields)
  if(result.error){if(uploaded)await client.storage.from('learning-audio').remove([uploaded]);throw result.error}
  if(storageTable&&current?.[pathColumn]!==fields[pathColumn])await removeManagedAudio(current?.[pathColumn])
 },onSuccess:()=>{setOpen(false);setCurrent(undefined);void cache.invalidateQueries()}})
 const deletion=useMutation({mutationFn:async(row:Row)=>{
  setNotice('')
  reject((await needDb().from(table).delete().eq(config.key,row[config.key])).error)
  if(storageTable)await removeManagedAudio(row[pathColumn])
 },onSuccess:()=>{setRemove(undefined);setOpen(false);setCurrent(undefined);if(list.data?.items.length===1&&p.page)p.setPage(p.page-1);void cache.invalidateQueries()}})
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  const form=new FormData(e.currentTarget)
  const fields:Row={}
  for(const definition of config.fields){
   const f:Field=definition
   const value=String(form.get(f.key)??'').trim()
   if(!(table==='level_targets'&&f.key==='level'))fields[f.key]=f.type==='list'?value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean):f.type==='number'?Number(value):f.type==='activities'?value.split(',').map(x=>x.trim()).filter(Boolean):f.type==='checkbox'?form.has(f.key):value
  }
  save.mutate({fields,file:form.get('file') as File|null})
 }
 function start(row?:Row){
  setCurrent(row);setEditLevel((row?.level??level) as Level);setOpen(true);setRemove(undefined);save.reset()
 }
 const canImport=(importKinds as readonly string[]).includes(table)
 return <><section className="panel content-card stack"><div className="section-line"><h2>{config.label} · {level}</h2>{table!=='level_targets'&&<button className="primary" onClick={()=>start()}><Plus size={17}/> Tambah</button>}</div>
 {!!config.search.length&&<Search value={p.search} onChange={p.setSearch}/>}<ErrorLine error={list.error||keys.error||save.error||deletion.error}/>{notice&&<p role="status">{notice}</p>}
 {open&&(table==='questions'&&current&&keys.isPending?<p>Memuat kunci jawaban…</p>:<form key={String(current?.[config.key]??'new')} className="admin-form stack" onSubmit={submit}><h3>{current?'Edit':'Tambah'} {config.label.toLowerCase()}</h3><div className="form-grid">{config.fields.map(definition=>{
  const f:Field=definition
  const raw=item[f.key]
  const value=Array.isArray(raw)?raw.join(f.type==='list'?'\n':', '):String(raw??'')
  if(f.type==='passage'||f.type==='audio')return <Attachment key={f.key} field={f} initial={value} level={editLevel}/>
  if(f.type==='checkbox')return <label className="inline" key={f.key}><input type="checkbox" name={f.key} defaultChecked={raw===true}/>{f.label}</label>
  return <label key={f.key}>{f.label}{f.choices?<select name={f.key} defaultValue={value||(f.key==='level'?level:f.choices[0])} disabled={table==='level_targets'&&f.key==='level'} onChange={f.key==='level'?e=>setEditLevel(e.target.value as Level):undefined}>{f.choices.map(x=><option key={x}>{x}</option>)}</select>:f.type==='long'||f.type==='list'?<textarea name={f.key} defaultValue={value} required={!f.optional}/>:<input name={f.key} defaultValue={value} type={f.type==='number'?'number':'text'} min={f.min} max={f.max} required={!f.optional}/>}</label>
 })}</div>
 {table==='study_plan_templates'&&<p>Kegiatan tersedia {Object.keys(labels).join(', ')}.</p>}
 {storageTable&&<label>Unggah audio (opsional)<input name="file" type="file" accept=".mp3,.wav,.ogg,.m4a,.webm"/></label>}
 <div className="toolbar"><button className="primary" disabled={save.isPending||!!keys.error}>Simpan</button><button type="button" className="secondary" disabled={save.isPending} onClick={()=>setOpen(false)}>Batal</button></div></form>)}
 {remove&&<div className="confirm stack"><p>Hapus {labelOf(remove)}? {(table==='listening'||table==='passages')&&'Soal terkait juga akan dihapus.'}</p><div className="toolbar"><button className="danger" disabled={deletion.isPending} onClick={()=>deletion.mutate(remove)}>Ya, hapus</button><button className="secondary" disabled={deletion.isPending} onClick={()=>setRemove(undefined)}>Batal</button></div></div>}
 {list.isPending?<p>Memuat data…</p>:list.data?.items.length?list.data.items.map(row=><article className="history-entry section-line" key={String(row[config.key])}><div><strong>{labelOf(row)}</strong><p className="muted">{String(row.level)} {row.meaning?'· '+String(row.meaning):''}</p>{table==='level_targets'&&<p>{String(row.vocabulary)} kata · {String(row.kanji)} kanji · {String(row.grammar)} pola</p>}</div><div className="toolbar"><button className="icon-button" aria-label="Edit" onClick={()=>start(row)}><Pencil size={17}/></button>{table!=='level_targets'&&<button className="icon-button" aria-label="Hapus" onClick={()=>{setRemove(row);deletion.reset()}}><Trash2 size={17}/></button>}</div></article>):<p>Belum ada data yang cocok.</p>}
 <Pages page={p.page} count={list.data?.count??0} onChange={p.setPage}/></section>{canImport&&<CsvImport key={table} kind={table as ImportKind}/>}</>
}
function Users(){
 const p=usePaging()
 const users=usePage<Profile>('profiles',{...p,columns:['name'],sort:'name'})
 return <section className="panel content-card stack"><h2>Daftar pengguna</h2><Search value={p.search} onChange={p.setSearch}/><ErrorLine error={users.error}/>{users.data?.items.map(user=><div className="section-line history-entry" key={user.id}><div><strong>{user.name||'Pengguna'}</strong><p className="muted account-id">{user.id}</p></div><span className="level-pill">{user.role} · {user.active_level}</span></div>)}<Pages page={p.page} count={users.data?.count??0} onChange={p.setPage}/></section>
}
function Coverage(){
 const summaries=useSummaries()
 return <section className="panel content-card stack"><h2>Jumlah konten terhadap target kumulatif</h2><ErrorLine error={summaries.error}/><div className="table-scroll"><table><thead><tr><th>Level</th><th>Kosakata</th><th>Kanji</th><th>Tata bahasa</th></tr></thead><tbody>{summaries.data?.map(x=><tr key={x.level}><th>{x.level}</th><td>{x.vocabulary_available} / {x.vocabulary}</td><td>{x.kanji_available} / {x.kanji}</td><td>{x.grammar_available} / {x.grammar}</td></tr>)}</tbody></table></div></section>
}
export function Admin({profile}:{profile?:Profile}){
 if(profile?.role!=='admin')return <><Title title="Administrasi"/><Empty>Halaman ini hanya tersedia untuk admin.</Empty></>
 return <AdminWorkspace/>
}
function AdminWorkspace(){
 const active=useLevel()
 const [tab,setTab]=useState<Tab|'users'|'coverage'>('coverage')
 const [level,setLevel]=useState(active.level)
 return <><Title title="Administrasi">Kelola materi, impor CSV, target level, dan pengguna.</Title>
 <div className="toolbar"><label>Bagian<select aria-label="Bagian" value={tab} onChange={e=>setTab(e.target.value as typeof tab)}><option value="coverage">Cakupan konten</option>{(Object.keys(configs) as Tab[]).map(key=><option key={key} value={key}>{configs[key].label}</option>)}<option value="users">Pengguna</option></select></label>{tab!=='coverage'&&tab!=='users'&&<label>Filter level<select aria-label="Filter level" value={level} onChange={e=>setLevel(e.target.value as Level)}>{levels.map(x=><option key={x}>{x}</option>)}</select></label>}</div>
 {tab==='coverage'?<Coverage/>:tab==='users'?<Users/>:<Editor key={tab+level} table={tab} level={level}/>}</>
}
