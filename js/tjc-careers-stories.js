
/* TJC public careers + approved testimonials. NO client or private HR data is requested. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const cleanText = x => String(x == null ? '' : x).slice(0,1200);
  const build = (tag, cls, txt) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (txt != null) el.textContent = cleanText(txt);
    return el;
  };
  const email = 'connect@jobcollectives.com'; // Existing contact in uploaded website; change after confirming apply@jobcollectives.com works.
  const vacancies = byId('tjc-openings-list');
  const reviews = byId('tjc-stories-grid');
  async function readJson(path) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (_) { return []; }
  }
  async function renderJobs() {
    if (!vacancies) return;
    const cfg = window.TJC_CONFIG || {};
    let jobs=[];
    if (cfg.supabasePublishableKey && window.supabase?.createClient) {
      try {
        const db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:false}});
        const {data,error}=await db.from('jc_job_openings').select('title,summary,employment_type,schedule,location,published_at').eq('status','published').order('published_at',{ascending:false}).limit(12);
        if(error) throw error;
        jobs=data||[];
      } catch (e) {
        vacancies.innerHTML='<div class="tjc-empty-opening"><strong>Openings are temporarily unavailable.</strong><p>Please check back shortly.</p></div>';
        return;
      }
    } else {
      vacancies.innerHTML='<div class="tjc-empty-opening"><strong>Recruitment listings are being connected.</strong><p>Please check back soon.</p></div>';
      return;
    }
    if (!jobs.length) return; // Keep the honest empty state in the HTML.
    const fragment = document.createDocumentFragment();
    for (const item of jobs.slice(0, 12)) {
      const card = build('article','tjc-opening');
      card.append(build('h3',null,item.title));
      const meta = [item.employment_type, item.location, item.schedule].filter(x=>typeof x==='string' && x.trim());
      if (meta.length) card.append(build('div','tjc-opening-meta',meta.join(' · ')));
      if (item.summary) card.append(build('p',null,item.summary));
      const link = build('a',null,'Apply now ↗');
      const subject = encodeURIComponent('Job Application: ' + item.title);
      link.href='mailto:'+email+'?subject='+subject;
      card.append(link);
      fragment.append(card);
    }
    vacancies.replaceChildren(fragment);
  }
  async function renderStories() {
    if (!reviews) return;
    // This intentionally refuses to publish unapproved testimonials.
    const stories = (await readJson('data/testimonials.json')).filter(x =>
      x && x.verified === true && x.published === true && x.permissionToPublish === true &&
      typeof x.quote === 'string' && x.quote.trim() && typeof x.displayName === 'string' && x.displayName.trim());
    if (!stories.length) return; // Preserve truthful service-value cards rather than fabricated reviews.
    const fragment=document.createDocumentFragment();
    for (const story of stories.slice(0,3)) {
      const card=build('article','tjc-story-card');
      const quote=build('blockquote','tjc-story-quote','“'+story.quote+'”');
      quote.style.margin='0'; card.append(quote);
      const person=build('div','tjc-story-attribution');
      const initials=cleanText(story.displayName).split(/\s+/).map(x=>x[0]||'').join('').slice(0,2).toUpperCase();
      person.append(build('span','tjc-story-initials',initials));
      const detail=build('div');detail.append(build('strong',null,story.displayName));
      detail.append(build('small',null,story.roleOrCompany||'Verified client'));
      person.append(detail);card.append(person);fragment.append(card);
    }
    reviews.replaceChildren(fragment);
    const note=byId('tjc-stories-footnote');if(note)note.textContent='Shared with permission from verified clients.';
    const desc=document.querySelector('.tjc-stories-heading > p');if(desc)desc.textContent='Real experiences from clients we have permission to feature.';
  }
  renderJobs();renderStories();
  setInterval(renderJobs,60000);
  // The public site and the portal use the same GitHub Pages origin when hosted as planned.
  // This keeps the visual theme consistent across open tabs and embedded portal frames.
  window.addEventListener('storage', event => {
    if (event.key === 'tjc-theme' && ['light','dark'].includes(event.newValue)) {
      if (typeof setTheme === 'function') setTheme(event.newValue,false);
      else document.documentElement.dataset.theme=event.newValue;
    }
  });
})();
