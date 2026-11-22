import {useState,type ReactNode} from 'react'
import {keepPreviousData,useQuery} from '@tanstack/react-query'
import {db,needDb,reject,type Level} from './data'

export const PAGE_SIZE=18
export function usePaging(){
 const [search,setSearch]=useState('')
 const [page,setPage]=useState(0)
 return {search,page,setPage,setSearch:(value:string)=>{setSearch(value);setPage(0)}}
}
export function usePage<T>(table:string,options:{level?:Level;search?:string;columns?:string[];page?:number;sort?:string;active?:boolean;filters?:Record<string,string|null>;select?:string;descending?:boolean}={}){
 const {level,search='',columns=[],page=0,sort='id',active=true,filters={},select='*',descending=false}=options
 return useQuery<{items:T[];count:number}>({queryKey:[table,'page',level,search,columns,page,sort,filters,select,descending],enabled:!!db&&active,placeholderData:(previous,query)=>query&&query.queryKey[2]===level&&query.queryKey[3]===search&&JSON.stringify(query.queryKey[7])===JSON.stringify(filters)?keepPreviousData(previous):undefined,queryFn:async({signal})=>{
  const query=needDb().from(table).select(select,{count:'exact'}).order(sort,{ascending:!descending})
  if(sort!=='id'&&table!=='level_targets')query.order(table==='kana'?'glyph':'id')
  if(level)query.eq('level',level)
  for(const [key,value] of Object.entries(filters))if(value===null)query.is(key,null);else query.eq(key,value)
  const term=search.trim().slice(0,100).replace(/[%_*(),."\\]/g,' ').trim()
  if(term&&columns.length)query.or(columns.map(c=>c+'.ilike."%'+term+'%"').join(','))
  const {data,error,count}=await query.range(page*PAGE_SIZE,(page+1)*PAGE_SIZE-1).abortSignal(signal)
  reject(error)
  return {items:(data??[]) as T[],count:count??0}
 }})
}
export function Search({value,onChange,children}:{value:string;onChange:(text:string)=>void;children?:ReactNode}){
 return <div className="toolbar"><label>Cari<input type="search" value={value} onChange={e=>onChange(e.target.value)} placeholder="Masukkan kata kunci" maxLength={100}/></label>{children}</div>
}
export function Pages({page,count,onChange}:{page:number;count:number;onChange:(page:number)=>void}){
 const total=Math.ceil(count/PAGE_SIZE)
 return total>1||page>0?<div className="toolbar pagination"><button className="secondary" disabled={!page} onClick={()=>onChange(page-1)}>Sebelumnya</button><span>Halaman {page+1} dari {Math.max(1,total)}</span><button className="secondary" disabled={page+1>=total} onClick={()=>onChange(page+1)}>Berikutnya</button></div>:null
}
