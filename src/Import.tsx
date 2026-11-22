import {useState} from 'react'
import {useMutation,useQueryClient} from '@tanstack/react-query'
import {rpc} from './data'
import {ErrorLine} from './ui'

export const importKinds=['vocabulary','kanji','grammar_points','questions'] as const
export type ImportKind=typeof importKinds[number]
type CsvRow={line:number;data:Record<string,unknown>}
type RowError={row:number;message:string}
type Report={accepted:number;errors:RowError[]}
const identity:Record<ImportKind,string[]>={vocabulary:['level','japanese','reading'],kanji:['character'],grammar_points:['level','pattern'],questions:['level','section','prompt','passage_id','listening_id']}
const required:Record<ImportKind,string[]>={vocabulary:['level','japanese','reading','meaning','topic','part_of_speech'],kanji:['level','character','meaning','strokes'],grammar_points:['level','pattern','explanation','formula','examples','common_errors'],questions:['level','section','prompt','options','answers','explanation']}

function parseCsv(input:string,kind:ImportKind){
 const records:{line:number;fields:string[]}[]=[]
 const errors:RowError[]=[]
 let fields:string[]=[],value='',quoted=false,afterQuote=false,line=1,start=1
 function field(){fields.push(value.trim());value='';afterQuote=false}
 function record(){field();if(fields.some(Boolean))records.push({line:start,fields});fields=[]}
 const text=input.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n')
 for(let i=0;i<text.length;i++){
  const char=text[i]
  if(quoted){
   if(char==='"'){if(text[i+1]==='"'){value+='"';i++}else{quoted=false;afterQuote=true}}
   else{value+=char;if(char==='\n')line++}
  }else if(char===','||char==='\n'){
   if(char===',')field()
   else{record();line++;start=line}
  }else if(char==='"'&&value===''&&!afterQuote)quoted=true
  else if(char==='"'||(afterQuote&&char!==' '&&char!=='\t'))throw new Error('Format kutip tidak valid pada baris '+line+'.')
  else if(!afterQuote)value+=char
 }
 if(quoted)throw new Error('Tanda kutip belum ditutup pada baris '+start+'.')
 if(value||fields.length||afterQuote)record()
 const header=records.shift()?.fields
 if(!header||new Set(header).size!==header.length||required[kind].some(key=>!header.includes(key)))throw new Error('Header CSV tidak valid. Gunakan template untuk jenis konten ini.')
 const seen=new Set<string>()
 const rows:CsvRow[]=[]
 for(const record of records){
  if(record.fields.length!==header.length){errors.push({row:record.line,message:'Jumlah kolom tidak sesuai header.'});continue}
  const data:Record<string,unknown>=Object.fromEntries(header.map((key,i)=>[key,record.fields[i]]))
  const fingerprint=JSON.stringify(identity[kind].map(key=>data[key]))
  if(seen.has(fingerprint)){errors.push({row:record.line,message:'Duplikat dalam file CSV.'});continue}
  seen.add(fingerprint)
  if(kind==='questions')for(const key of ['options','answers'])data[key]=String(data[key]).split('|').map(x=>x.trim()).filter(Boolean)
  rows.push({line:record.line,data})
 }
 return {rows,errors}
}
export function CsvImport({kind}:{kind:ImportKind}){
 const [file,setFile]=useState<File|null>(null)
 const [parsed,setParsed]=useState<ReturnType<typeof parseCsv>>()
 const [report,setReport]=useState<Report>()
 const [applied,setApplied]=useState(false)
 const [progress,setProgress]=useState('')
 const [offset,setOffset]=useState(0)
 const [readError,setReadError]=useState<unknown>(null)
 const cache=useQueryClient()
 const process=useMutation({mutationFn:async(apply:boolean)=>{
  if(!parsed)return {accepted:0,errors:[]}
  const total:Report={accepted:0,errors:[...parsed.errors]}
  for(let start=0;start<parsed.rows.length;start+=500){
   const part=parsed.rows.slice(start,start+500)
   setProgress(Math.min(start+part.length,parsed.rows.length)+' / '+parsed.rows.length+' baris diperiksa')
   try{
    const r=await rpc<Report>('import_content',{kind,items:part.map(x=>x.data),apply_changes:apply})
    total.accepted+=r.accepted
    total.errors.push(...r.errors.map(e=>({row:part[e.row-2]?.line??e.row,message:e.message})))
   }catch(error){
    const detail=error && typeof error==='object'&&'message' in error?String(error.message):'Permintaan gagal.'
    total.errors.push(...part.map(row=>({row:row.line,message:detail})))
   }
  }
  return {...total,errors:total.errors.sort((a,b)=>a.row-b.row)}
 },onSuccess:(result,apply)=>{setReport(result);setOffset(0);setApplied(apply);setProgress('');if(apply)void cache.invalidateQueries()}})
 async function open(file:File|null){
  setFile(file);setReport(undefined);setParsed(undefined);setApplied(false);setOffset(0);setReadError(null);process.reset()
  if(!file)return
  try{
   if(file.size>10*1024*1024)throw new Error('Ukuran file maksimal 10 MB.')
   setParsed(parseCsv(await file.text(),kind))
  }catch(error){setReadError(error)}
 }
 const errors=report?.errors??parsed?.errors??[]
 return <section className="panel content-card stack"><h2>Impor CSV</h2><a className="secondary" href={'/templates/'+kind+'.csv'} download>Unduh template CSV</a>
 <label>File CSV<input type="file" accept=".csv,text/csv" disabled={process.isPending} onChange={e=>void open(e.target.files?.[0]??null)}/></label><ErrorLine error={readError||process.error}/>
 {file&&parsed&&<><p>{parsed.rows.length+parsed.errors.length} baris dalam {file.name}. Pemeriksaan database berjalan per 500 baris.</p><div className="table-scroll"><table><thead><tr><th>Baris</th><th>Level</th><th>Konten</th></tr></thead><tbody>{parsed.rows.slice(0,5).map(row=><tr key={row.line}><td>{row.line}</td><td>{String(row.data.level)}</td><td>{String(row.data.japanese??row.data.character??row.data.pattern??row.data.prompt)}</td></tr>)}</tbody></table></div>
 <div className="toolbar"><button className="secondary" disabled={process.isPending||applied} onClick={()=>process.mutate(false)}>Validasi dan pratinjau</button>{report&&!applied&&<button className="primary" disabled={process.isPending||!report.accepted} onClick={()=>process.mutate(true)}>Impor {report.accepted} baris valid</button>}</div></>}
 {progress&&<p role="status">{progress}</p>}{report&&<p role="status">{applied?'Tersimpan':'Lolos validasi'} {report.accepted} · {errors.length} baris bermasalah</p>}
 {!!errors.length&&<div className="stack"><h3>Laporan baris bermasalah</h3><div className="table-scroll"><table><thead><tr><th>Baris</th><th>Masalah</th></tr></thead><tbody>{errors.slice(offset,offset+20).map(e=><tr key={e.row}><td>{e.row}</td><td>{e.message}</td></tr>)}</tbody></table></div><div className="toolbar"><button className="secondary" disabled={!offset} onClick={()=>setOffset(offset-20)}>Sebelumnya</button><button className="secondary" disabled={offset+20>=errors.length} onClick={()=>setOffset(offset+20)}>Berikutnya</button></div></div>}</section>
}
