const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
function closeMenu(focus = false) {
  menuButton?.setAttribute('aria-expanded', 'false');
  if (menuButton) menuButton.querySelector('.sr-only').textContent = 'Open navigation';
  nav?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  if (focus) menuButton?.focus();
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation';
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeMenu(true);
  if(e.key === 'Tab' && nav?.classList.contains('is-open')) {
    const items = [menuButton, ...nav.querySelectorAll('a'), ...document.querySelectorAll('.nav-actions a')];
    const first = items[0], last = items.at(-1);
    if(e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    if(!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
addEventListener('resize', () => { if(innerWidth > 820) closeMenu(); });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = false, previousY = scrollY, direction = 1;
const root = document.documentElement;
const themeButton = document.querySelector('.theme-button');
const themeIcons = {
  sun:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.4"></circle><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"></path></svg>',
  moon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.3A8.4 8.4 0 0 1 8.7 3.8 8.5 8.5 0 1 0 20.2 15.3Z"></path></svg>'
};
function setTheme(theme, save = true) {
  root.dataset.theme = theme;
  const next = theme === 'dark' ? 'light' : 'dark';
  themeButton?.setAttribute('aria-label', `Switch to ${next} mode`);
  themeButton?.setAttribute('title', `Switch to ${next} mode`);
  if(themeButton) themeButton.querySelector('span').innerHTML = theme === 'dark' ? themeIcons.sun : themeIcons.moon;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#070B2D' : '#F1F5F9';
  if(save) try { localStorage.setItem('tjc-theme', theme); } catch {}
}
setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light', false);
let themeTransition;
themeButton?.addEventListener('click', () => {
  if(themeTransition) return;
  const change = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  if(document.startViewTransition && !reduced.matches && !paused) {
    const bounds = themeButton.getBoundingClientRect();
    root.style.setProperty('--theme-x', `${bounds.left + bounds.width / 2}px`);
    root.style.setProperty('--theme-y', `${bounds.top + bounds.height / 2}px`);
    themeTransition = document.startViewTransition(change);
    themeTransition.finished.catch(() => {}).finally(() => { themeTransition = null; });
  } else change();
});
addEventListener('scroll', () => { direction = scrollY < previousY ? -1 : 1; previousY = scrollY; }, {passive:true});
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if(entry.isIntersecting && !reduced.matches && !paused) {
    entry.target.getAnimations().forEach(a => a.cancel());
    entry.target.animate([{opacity:.4,translate:'0 '+direction*18+'px'}, {opacity:1,translate:'0 0'}], {duration:480,easing:'cubic-bezier(.23,1,.32,1)'});
  }
}), {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
const workflowExamples = {
  inbox: {title:'Make room in the inbox', description:'A clear rhythm for messages, meetings, and follow-through.', tasks:[['Sort messages by priority','Review'],['Prepare calendar handoffs','Next'],['Flag decisions for you','Visible']]},
  pipeline: {title:'Keep leads from drifting', description:'Give every conversation an owner and a sensible next step.', tasks:[['Organize new inquiries','Review'],['Update CRM next steps','Next'],['Prepare follow-up queue','Visible']]},
  projects: {title:'Keep the work connected', description:'Put tasks, owners, and updates where the whole team can find them.', tasks:[['Confirm this week’s priorities','Review'],['Update the shared task board','Next'],['Prepare the operating update','Visible']]}
};
const workflowTabs = document.querySelectorAll('.sample-tab');
const sampleTitle = document.querySelector('#sample-title');
const sampleDescription = document.querySelector('#sample-description');
const sampleTasks = document.querySelector('#sample-tasks');
workflowTabs.forEach(button => button.addEventListener('click', () => {
  const example = workflowExamples[button.dataset.workflow];
  if(!example) return;
  workflowTabs.forEach(tab => {
    const selected = tab === button;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-pressed', String(selected));
  });
  sampleTitle.textContent = example.title;
  sampleDescription.textContent = example.description;
  sampleTasks.replaceChildren(...example.tasks.map(([task, state]) => {
    const item = document.createElement('li');
    const dot = document.createElement('span');
    dot.className = 'status-dot';
    dot.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = task;
    const status = document.createElement('span');
    status.textContent = state;
    item.append(dot, label, status);
    return item;
  }));
  if(!reduced.matches && !paused) sampleTasks.animate([{opacity:.55,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}], {duration:230,easing:'ease-out'});
}));
const booking = document.querySelector('.mobile-booking');
const inquiry = document.querySelector('#inquiry');
const hero = document.querySelector('.hero');
if(booking && inquiry && hero) {
  const visible = new Map([[hero, true], [inquiry, false]]);
  const bookingObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => visible.set(entry.target, entry.isIntersecting));
    booking.classList.toggle('is-hidden', visible.get(hero) || visible.get(inquiry));
  });
  bookingObserver.observe(hero);
  bookingObserver.observe(inquiry);
}
let selectedPlan = '';
const form = document.querySelector('#contact-form');
form?.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const status = form.querySelector('.form-status');
  const fallback = form.querySelector('.email-fallback');
  const value = n => String(form.elements[n]?.value || '').trim();
  const selected = n => { const el=form.elements[n]; return el?.selectedOptions?.[0]?.textContent || 'Not provided'; };
  const body = [
    'Job Collectives — Discovery Inquiry',
    '',
    'Selected Plan: ' + (selectedPlan || 'Not selected'),
    'Name: ' + value('firstName') + ' ' + value('lastName'),
    'Business Email: ' + value('email'),
    'Business: ' + value('company'),
    'Industry: ' + selected('businessType'),
    'Requested Support: ' + selected('supportType'),
    'Preferred Weekly Hours: ' + selected('hours'),
    'Timezone Overlap: ' + selected('timeZone'),
    'Expected Monthly Budget: ' + selected('budget'),
    'Work to delegate: ' + (value('challenge') || 'Not provided'),
    '',
    'Please let me know the next steps for an introductory discussion.'
  ].join('\n');
  const href = 'mailto:connect@jobcollectives.com?subject=' + encodeURIComponent('VA Inquiry — ' + value('company')) + '&body=' + encodeURIComponent(body);
  fallback.href = href;
  fallback.textContent = 'Open email draft again ↗';
  fallback.hidden = false;
  status.textContent = 'Your inquiry email draft is ready. Check your email app and press Send. No information has been submitted or saved by this website.';
  status.className = 'form-status success';
  window.location.href = href;
  status.focus();
});

const roleDetails = {
  marketing: {
    title: 'Marketing',
    summary: 'Build awareness, generate demand, and support business growth.',
    skills: ['Social media', 'SEO', 'Content', 'CRM', 'Paid ads']
  },
  operations: {
    title: 'Operations',
    summary: 'Keep projects, processes, research, and recurring work moving.',
    skills: ['Projects', 'SOPs', 'Research', 'Scheduling', 'CRM']
  },
  sales: {
    title: 'Sales',
    summary: 'Create a dependable rhythm for outreach, follow-up, and pipeline care.',
    skills: ['Lead generation', 'Outreach', 'CRM', 'Follow-up']
  },
  support: {
    title: 'Customer support',
    summary: 'Give customers thoughtful, timely help across everyday conversations.',
    skills: ['Email', 'Chat', 'Client care', 'Issue tracking']
  },
  creative: {
    title: 'Creative',
    summary: 'Turn briefs into useful visual and content assets for your business.',
    skills: ['Graphics', 'Video support', 'Content', 'Asset coordination']
  },
  admin: {
    title: 'Admin & more',
    summary: 'Build reliable support around the recurring work your team needs done.',
    skills: ['Inbox', 'Calendar', 'Documents', 'Data entry']
  }
};
const roleChoices = document.querySelectorAll('.role-choice');
const selectedRole = document.querySelector('.selected-role');
const selectedRoleTitle = document.querySelector('#selected-role-title');
const selectedRoleSummary = document.querySelector('#selected-role-summary');
const selectedRoleSkills = document.querySelector('#selected-role-skills');
function selectRole(button) {
  const detail = roleDetails[button.dataset.role];
  if(!detail || !selectedRoleTitle || !selectedRoleSummary || !selectedRoleSkills) return;
  roleChoices.forEach(choice => {
    const selected = choice === button;
    choice.classList.toggle('is-active', selected);
    choice.setAttribute('aria-pressed', String(selected));
  });
  selectedRoleTitle.textContent = detail.title;
  selectedRoleSummary.textContent = detail.summary;
  selectedRoleSkills.replaceChildren(...detail.skills.map(skill => {
    const tag = document.createElement('span');
    tag.textContent = skill;
    return tag;
  }));
  if(selectedRole && !reduced.matches && !paused) {
    selectedRole.getAnimations().forEach(animation => animation.cancel());
    const desktop = innerWidth > 720;
    const base = desktop ? 'translateX(-50%) rotate(-.7deg)' : 'none';
    const from = desktop ? 'translateX(-50%) translateY(5px) rotate(-.7deg)' : 'translateY(5px)';
    selectedRole.animate(
      [{transform:from,opacity:.72},{transform:base,opacity:1}],
      {duration:240,easing:'cubic-bezier(.23,1,.32,1)'}
    );
  }
}
roleChoices.forEach(button => button.addEventListener('click', () => selectRole(button)));

const priceCards = document.querySelectorAll('[data-plan-card]');
const planLinks = document.querySelectorAll('.plan-select');
const pricingStatus = document.querySelector('.pricing-selection-status');
planLinks.forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  selectedPlan = link.dataset.plan || '';
  priceCards.forEach(card => card.classList.toggle('is-selected', card.dataset.planCard === selectedPlan));
  planLinks.forEach(item => {
    if(item === link) item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  });
  if(pricingStatus) pricingStatus.textContent = `${selectedPlan} selected. Continue below to request your discovery call.`;
  const card = link.closest('.price-card');
  if(card && !reduced.matches && !paused) {
    card.getAnimations().forEach(animation => animation.cancel());
    card.animate(
      [{filter:'brightness(1)',offset:0},{filter:'brightness(1.08)',offset:.42},{filter:'brightness(1)',offset:1}],
      {duration:360,easing:'cubic-bezier(.23,1,.32,1)'}
    );
  }
  const delay = reduced.matches || paused ? 0 : 460;
  setTimeout(() => document.querySelector('#inquiry')?.scrollIntoView({behavior:reduced.matches || paused ? 'auto' : 'smooth'}), delay);
}));
