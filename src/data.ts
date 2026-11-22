import {createClient} from '@supabase/supabase-js'
import {useQuery} from '@tanstack/react-query'

const url=import.meta.env.VITE_SUPABASE_URL
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const db=url && key ? createClient(url,key) : null
export const levels=['N5','N4','N3','N2','N1'] as const
export type Level=typeof levels[number]
export const isLevel=(value:unknown):value is Level=>levels.some(level=>level===value)
export type Kind='huruf'|'menulis'|'kosakata'|'membaca'|'latihan'|'mendengar'|'kanji'|'bunpou'
export type Profile={id:string;name:string;role:'user'|'admin';goal_minutes:number;goal_cards:number;active_level:Level;level_selected:boolean;new_card_limit:number}
export type Task={id:string;due_date:string;completed_at:string|null;kind:Kind;minutes:number}
export type Plan={id:string;level:Level;exam_date:string|null;daily_minutes:number;days:number[]}
export type Template={id:string;level:Level;title:string;weeks:number;activities:Kind[]}
export type Word={id:string;level:Level;topic:string;japanese:string;reading:string;meaning:string;example:string;romaji:string;part_of_speech:string;example_translation:string;audio_path:string|null}
export type Kanji={id:string;level:Level;character:string;onyomi:string;kunyomi:string;meaning:string;strokes:number;examples:string;stroke_path:string|null}
export type Grammar={id:string;level:Level;pattern:string;explanation:string;formula:string;examples:string;common_errors:string}
export type KanaItem={glyph:string;level:Level;script:string;category:string;romaji:string;position:number;audio_path:string|null}
export type Review={vocabulary_id:string;repetitions:number;due_date:string}
export type Section='moji-goi'|'bunpou'|'dokkai'|'choukai'
export type Question={id:string;level:Level;prompt:string;options:string[];passage_id:string|null;listening_id:string|null;section:Section;placement:boolean}
export type Attempt={id:string;question_id:string|null;response:string;correct:boolean;explanation:string;transcript:string|null;created_at:string;level:Level|null}
export type Passage={id:string;level:Level;title:string;body:string;translation:string}
export type Audio={id:string;level:Level;title:string;path:string}
export type Activity={id:string;day:string;kind:Kind;minutes:number;card_review:boolean}
export type Badge={code:string;title:string;description:string}
export type Bookmark={id:string;vocabulary_id:string|null;sentence:string|null;kanji_id:string|null}
export type Note={id:string;body:string;created_at:string}
export const labels:Record<Kind,string>={huruf:'Huruf Kana',menulis:'Menulis',kosakata:'Kosakata',membaca:'Membaca',latihan:'Latihan Soal',mendengar:'Mendengar',kanji:'Kanji',bunpou:'Tata Bahasa'}
export const sectionLabels:Record<Section,string>={'moji-goi':'Moji-goi · Huruf dan kosakata',bunpou:'Bunpou · Tata bahasa',dokkai:'Dokkai · Membaca',choukai:'Choukai · Mendengar'}
export const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta'}).format(new Date())
export function shift(day:string,days:number){
 const date=new Date(day+'T00:00:00Z')
 date.setUTCDate(date.getUTCDate()+days)
 return date.toISOString().slice(0,10)
}
export const dateLabel=(date:string,options:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat('id-ID',{...options,timeZone:'UTC'}).format(new Date(date.slice(0,10)+'T00:00:00Z'))
export function reject(error:unknown){if(error)throw error}
export function message(error:unknown){return error && typeof error==='object' && 'message' in error ? String(error.message) : 'Terjadi kesalahan. Silakan coba lagi.'}
export function needDb(){if(!db)throw new Error('Hubungkan Supabase melalui pengaturan .env.local.');return db}
export function rows<T>(table:string,sort='id'){
 return useQuery({queryKey:[table,sort],queryFn:async({signal})=>{
  const batchSize=250
  const result:T[]=[]
  const keyedWithoutId=['achievements','answer_keys','reviews','user_achievements']
  for(let start=0;;start+=batchSize){
   const query=needDb().from(table).select('*').order(sort)
   if(sort!=='id'&&!keyedWithoutId.includes(table))query.order('id')
   const {data,error}=await query.range(start,start+batchSize-1).abortSignal(signal)
   reject(error)
   const page=(data??[]) as T[]
   result.push(...page)
   if(page.length<batchSize)return result
  }
 },enabled:!!db})
}
export async function rpc<T=void>(name:string,args:Record<string,unknown>={}){
 const {data,error}=await needDb().rpc(name,args)
 reject(error)
 return data as T
}
export function useDailyStats(){
 return useQuery({queryKey:['daily-stats',today()],enabled:!!db,queryFn:()=>rpc<{days:number;minutes:number;cards:number}>('daily_stats')})
}
export const eventArgs=(elapsed:number,task:string|null)=>({event_id:crypto.randomUUID(),elapsed,task_id:task})
export function streakOf(activity:Activity[]){
 const days=new Set(activity.filter(x=>x.minutes>0).map(x=>x.day))
 const start=days.has(today())?today():shift(today(),-1)
 let n=0
 while(days.has(shift(start,-n)))n++
 return n
}
