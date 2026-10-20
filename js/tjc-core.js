/* Shared, authenticated Job Collectives runtime. No fallback to local demo records. */
(function(){'use strict';
const conf=window.TJC_CONFIG||{};
const configured=Boolean(/^https:\/\/[\w-]+\.supabase\.co$/.test(conf.supabaseUrl||'') && typeof conf.supabasePublishableKey==='string' && conf.supabasePublishableKey.trim().length>20);
const client=configured && window.supabase?.createClient ? window.supabase.createClient(conf.supabaseUrl,conf.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}) : null;
const paths={management:'management-portal.html',talent:'talent-portal.html',client:'client-portal.html',hr:'hr-portal.html'};
const titles={management:'Management HQ',talent:'Talent Portal',client:'Client Portal',hr:'People & HR'};
const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const icons={dashboard:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',tasks:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 7a3 3 0 0 1 0 6M20 20v-2a5 5 0 0 0-3-4.5"/>',clients:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 5V3h8v2M8 9h2M14 9h2M8 13h2M14 13h2M8 17h8"/>',file:'<path d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM14 3v5h5M8 12h8M8 16h6"/>',chat:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.6 0-3.1-.4-4.4-1.2L3 21l2.2-5.1A8.5 8.5 0 1 1 21 11.5z"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 0 1 5.2 0c0 2-2.7 2.1-2.7 4M12 17h.01"/>',heart:'<path d="M20.8 4.7a5.4 5.4 0 0 0-7.6 0L12 6 10.8 4.7a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.7a5.4 5.4 0 0 0 0-7.6z"/>',briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18M10 13v2h4v-2"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M9.7 3h4.6l.7 2.4 2.2.9 2.2-1.1 2.3 4-1.8 1.8v2.3l1.8 1.8-2.3 4-2.2-1.1-2.2.9-.7 2.4H9.7L9 18.9l-2.2-.9-2.2 1.1-2.3-4 1.8-1.8v-2.3L2.3 9.2l2.3-4 2.2 1.1 2.2-.9z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1z"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',logout:'<path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M15 17l5-5-5-5M20 12H9"/>',check:'<path d="M4 12l5 5L20 6"/>',alert:'<path d="M12 3 2 21h20L12 3zM12 9v5M12 18h.01"/>',chart:'<path d="M3 21V12h4v9M10 21V3h4v18M17 21v-9h4v9"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18"/>',chevron:'<path d="M9 18l6-6-6-6"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 21h4"/>',filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',plus:'<path d="M12 4v16M4 12h16"/>',refresh:'<path d="M20 7v5h-5M4 17v-5h5M6 9a7 7 0 0 1 12-2l2 5M4 12l2 5a7 7 0 0 0 12-2"/>',play:'<path d="M8 5l11 7-11 7z"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="1"/>'};
function icon(name,size=18){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.file}</svg>`}
// Use the same radial View Transition as the public website (with a reduced-motion fallback).
let themeInFlight = false;
function syncThemeButton(){
  const button=document.querySelector('[data-action="toggle-theme"]');
  if(!button)return;
  const dark=document.documentElement.dataset.theme==='dark';
  button.innerHTML=icon(dark?'sun':'moon',19);
  button.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
  button.setAttribute('title',dark?'Switch to light mode':'Switch to dark mode');
  button.setAttribute('aria-pressed',String(dark));
}
function theme(t,origin){
  const next=t==='dark'?'dark':'light';
  if(themeInFlight || document.documentElement.dataset.theme===next) return;
  const apply=()=>{
    document.documentElement.dataset.theme=next;
    try{localStorage.setItem('tjc-theme',next)}catch{}
    const color=document.querySelector('meta[name="theme-color"]');
    if(color)color.content=next==='dark'?'#070B2D':'#F1F5F9';
    syncThemeButton();
  };
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!document.startViewTransition || reduce){apply();return;}
  const rect=origin?.getBoundingClientRect();
  document.documentElement.style.setProperty('--theme-x',(rect?rect.left+rect.width/2:innerWidth*.95)+'px');
  document.documentElement.style.setProperty('--theme-y',(rect?rect.top+rect.height/2:60)+'px');
  themeInFlight=true;
  try{
    const transition=document.startViewTransition(apply);
    transition.finished.catch(()=>{}).finally(()=>{themeInFlight=false});
  }catch{themeInFlight=false;apply()}
}
function relativeTime(ts){return ts?new Date(ts).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}):'—'}
function hours(seconds){const s=Math.max(0,Math.floor(seconds));return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
async function profile(){if(!client)return null;const {data:{user},error}=await client.auth.getUser();if(error||!user)return null;const p=await client.from('jc_profiles').select('*').eq('id',user.id).maybeSingle();if(p.error)throw p.error;return p.data;}
async function requireRole(expected){if(!client){document.body.innerHTML='<main class="jc-lock"><h1>Workspace configuration required</h1><p>This site is connected to a secure database once the project is active and its publishable key is configured. No client or employee information is stored locally.</p><a href="login.html">Back to login</a></main>';return null;}let p;try{p=await profile()}catch(e){document.body.innerHTML=`<main class="jc-lock"><h1>Could not verify access</h1><p>${esc(e.message)}</p><a href="login.html">Return to login</a></main>`;return null;}if(!p){location.replace('login.html');return null;}if(expected!==p.role){location.replace(paths[p.role]||'login.html');return null;}return p;}
window.TJC={config:conf,client,configured,paths,titles,esc,icon,theme,syncThemeButton,relativeTime,hours,profile,requireRole};
})();
