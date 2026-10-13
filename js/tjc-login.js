(()=>{'use strict';const {client,configured,paths,profile,theme,esc,icon}=window.TJC;const form=document.getElementById('tjc-signin'),msg=document.getElementById('login-message'),button=document.getElementById('login-submit');const notice=t=>{msg.textContent=t;msg.classList.toggle('error',Boolean(t));};
const appearanceButton=document.getElementById('tjc-login-theme');
const syncLoginTheme=()=>{
  const dark=document.documentElement.dataset.theme==='dark';
  appearanceButton.innerHTML=icon(dark?'sun':'moon',19);
  appearanceButton.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
  appearanceButton.setAttribute('title',dark?'Switch to light mode':'Switch to dark mode');
  appearanceButton.setAttribute('aria-pressed',String(dark));
};
syncLoginTheme();
new MutationObserver(syncLoginTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
appearanceButton.addEventListener('click',()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark',appearanceButton));
if(!configured){notice('Account access is not active yet. The Supabase project must be restored and configured before sign-in.');button.disabled=true;document.getElementById('login-reset').disabled=true;return;}
(async()=>{try{const p=await profile();if(p&&paths[p.role])location.replace(paths[p.role]);}catch(e){notice('Could not reach account service. Try again shortly.')}})();
form.addEventListener('submit',async e=>{e.preventDefault();button.disabled=true;notice('Verifying account…');try{const {error}=await client.auth.signInWithPassword({email:document.getElementById('login-email').value.trim(),password:document.getElementById('login-password').value});if(error)throw error;const p=await profile();if(!p||!paths[p.role]){await client.auth.signOut();throw new Error('Your account has not been assigned a workspace. Contact management.');}location.replace(paths[p.role]);}catch(err){notice(err.message||'Could not sign in.');button.disabled=false;}});
document.getElementById('login-reset').addEventListener('click',async()=>{const email=document.getElementById('login-email').value.trim();if(!email){notice('Enter your account email first.');return;}try{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:new URL('login.html',location.href).href});if(error)throw error;notice('If the account exists, a recovery email has been sent. Follow the secure link.');}catch(err){notice(err.message||'Recovery failed.');}});
})();
