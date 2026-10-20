/* Job Collectives V9.2. No network calls, tracking, or form submission. */
(function () {
  'use strict';
  // Prevent the old mobile contact shortcut from covering assessment controls.
  const matchSection = document.getElementById('va-match');
  if (matchSection && 'IntersectionObserver' in window) {
    const matchVisibility = new IntersectionObserver(entries => {
      document.body.classList.toggle('tjc-match-visible', entries.some(entry => entry.isIntersecting));
    }, {threshold:0.01});
    matchVisibility.observe(matchSection);
  }
  const matchForm = document.getElementById('tjc-match-form');
  const result = document.getElementById('tjc-match-result-body');
  const inquiry = document.getElementById('contact-form');
  if (matchForm && result) {
    const details = {
      admin: {label:'Executive & administrative support',short:'Administrative and operations assistance'},
      sales: {label:'Sales & CRM',short:'Sales and CRM support'},
      marketing: {label:'Marketing operations',short:'Marketing and creative support'},
      support: {label:'Customer support',short:'Customer support'},
      multi: {label:'Multiple roles / not sure yet',short:'Several specialist roles'}
    };
    const plans = {
      Foundation: {price:'$850–$1,200 USD / month',hours:'Up to 20 hours per week',position:'Focused part-time support'},
      Growth: {price:'$1,200–$2,000 USD / month',hours:'Around 40 hours per week',position:'One dedicated full-time role'},
      Scale: {price:'$3,000–$5,500 USD / month',hours:'2–4 specialists, subject to scope',position:'Coordinated multi-role support'}
    };
    const esc = val => String(val).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let latest = null;
    matchForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!matchForm.reportValidity()) return;
      const data = new FormData(matchForm);
      const role = String(data.get('matchRole') || '');
      const hours = String(data.get('matchHours') || '');
      const timezone = String(data.get('matchTimezone') || '');
      const chosen = (role === 'multi' || hours === 'team') ? 'Scale' : hours === 'full' ? 'Growth' : 'Foundation';
      const info = plans[chosen];
      latest = {role, hours, timezone, plan:chosen};
      const capacityReason = chosen === 'Scale'
        ? 'Multiple roles or team coverage need a tailored allocation. We will confirm how many specialists and hours are actually required.'
        : esc(info.hours) + ' aligns with the weekly workload you selected.';
      const reasons = [
        esc(details[role].short) + ' is your primary need.',
        capacityReason,
        timezone ? 'Schedule preference: ' + esc(timezone) + ' (availability to be confirmed).' : 'Working hours and overlap can be planned together.'
      ];
      result.innerHTML = `
        <span class="tjc-rec-eyebrow">YOUR STARTING PLAN</span>
        <h3>${esc(chosen)}.</h3>
        <div class="tjc-rec-pill">${esc(info.position)}</div>
        <div class="tjc-rec-price">${esc(info.price)}</div>
        <ul class="tjc-rec-reasons">${reasons.map(reason => '<li>' + reason + '</li>').join('')}</ul>
        <p class="tjc-rec-disclaimer">This is a planning suggestion, not a quote, availability confirmation, staffing commitment, or guarantee. Your final package is based on the agreed scope and service terms.</p>
        <div class="tjc-rec-actions"><button class="tjc-rec-cta" type="button" id="tjc-match-apply">Use this in my inquiry ↗</button><button class="tjc-rec-reset" type="button" id="tjc-match-reset">Start over</button></div>`;
      // Avoid injecting user-entered data into HTML outside escaped text.
      const viewportResult = document.getElementById('tjc-match-result');
      if (viewportResult && window.innerWidth < 901) viewportResult.scrollIntoView({behavior:'smooth',block:'nearest'});
      document.getElementById('tjc-match-apply')?.addEventListener('click', applyRecommendation);
      document.getElementById('tjc-match-reset')?.addEventListener('click', () => {
        matchForm.reset(); latest=null;
        result.innerHTML = '<span class="tjc-match-result-star" aria-hidden="true">✳</span><h3>Less guessing.<br>More getting things done.</h3><p>Answer three questions and we\'ll suggest a starting plan for your workload.</p><div class="tjc-match-result-line" aria-hidden="true"></div><p class="tjc-match-result-steps">A recommendation, not a commitment.</p>';
        matchForm.querySelector('input[name="matchRole"]')?.focus();
      });
    });
    function applyRecommendation() {
      if (!latest || !inquiry) return;
      const selected = document.querySelector(`.plan-select[data-plan="${latest.plan}"]`);
      // Trigger existing V9 pricing selection (updates its plan recommendation)
      if (selected) selected.click();
      const mapping = {
        part:'Up to 20 hours',full:'Around 40 hours',team:'Multiple roles / team'
      };
      for (const [name,value] of [
        ['supportType',details[latest.role].label],
        ['hours',mapping[latest.hours]],
        ['timeZone',latest.timezone]
      ]) {
        const control=inquiry.elements[name];
        if(control && value && [...control.options].some(o=>o.value===value || o.textContent===value)) {
          control.value=value;control.dispatchEvent(new Event('change',{bubbles:true}));
        }
      }
      const notice=document.getElementById('tjc-inquiry-from-check');
      if (notice) notice.hidden=false;
      // Never replace existing free-text user content.
      const challenge=inquiry.elements.challenge;
      if (challenge && !challenge.value.trim()) challenge.value = 'VA fit check: ' + latest.plan + ' suggested for ' + details[latest.role].short.toLowerCase() + '. Please confirm scope, hours, schedule and availability.';
      // Scroll immediately (the existing plan selector also scrolls after its animation).
      document.getElementById('inquiry')?.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }
  const tabs = Array.from(document.querySelectorAll('[data-ops-tab]'));
  const panel = document.getElementById('ops-tab-panel');
  if (tabs.length && panel) {
    const screens = {
      tasks:{eyebrow:'WORK QUEUE / EXAMPLE',title:'Shared task visibility',desc:'A clear owner, next action, and review stage for every deliverable.',rows:[['Organize new requests','Intake & prioritization','Ready for review','green'],['Prepare weekly update','Work in progress','In progress','sky'],['Confirm next priorities','Client decision required','Waiting','amber']]},
      time:{eyebrow:'WORK LOG / EXAMPLE',title:'Time, with context',desc:'Useful work logs explain what time was spent on, not just whether someone was online.',rows:[['Client inbox triage','Example time entry','1 hr 30 min','sky'],['Workflow documentation','Example time entry','45 min','sky'],['Review current priorities','Example time entry','30 min','sky']]},
      reports:{eyebrow:'ACCOMPLISHMENT VIEW / EXAMPLE',title:'Updates people can act on',desc:'An accomplishment report separates progress, pending approvals, and blockers.',rows:[['Completed','Customer FAQ review','Done','green'],['In progress','Campaign checklist','Ongoing','sky'],['Needs a decision','Clarify approval steps','Client review','amber']]},
      support:{eyebrow:'ESCALATION PATH / EXAMPLE',title:'Help when work gets stuck',desc:'Concerns go to the right person, with agreed escalation ownership and response expectations.',rows:[['Describe the blocker','Example: missing access','Reported','amber'],['Notify the agreed contact','Management receives the issue','For review','sky'],['Confirm resolution','Record next action','Documented','green']]}
    };
    const selectTab = (button, focus=false) => {
      const key=button.dataset.opsTab;
      const d=screens[key];if(!d)return;
      tabs.forEach(t=>{const active=t===button;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
      panel.setAttribute('aria-labelledby',button.id);
      panel.innerHTML = '<div class="tjc-ops-panel-heading"><span>'+d.eyebrow+'</span><strong>'+d.title+'</strong><p>'+d.desc+'</p></div><div class="tjc-ops-work-list">'+ d.rows.map((row,i)=>'<div><span class="tjc-ops-checkbox '+ (i===1?'active':'') +'" aria-hidden="true">'+(i===0?'✓':'○')+'</span><div><strong>'+row[0]+'</strong><small>'+row[1]+'</small></div><span class="tjc-ops-badge '+(row[3]==='green'?'':row[3])+'">'+row[2]+'</span></div>').join('')+'</div>';
      if(focus)button.focus();
    };
    tabs.forEach((t,index)=>{
      t.addEventListener('click',()=>selectTab(t));
      t.addEventListener('keydown',event=>{
        if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
        event.preventDefault();
        let next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
        selectTab(tabs[next],true);
      });
    });
  }
})();
