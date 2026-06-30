(function() {
  'use strict';

  // --- LOADER ---
  function initLoader() {
    var root = document.documentElement;
    var loader = document.getElementById('loader');
    if(!loader) return;
    
    var textEl = document.getElementById('ldText');
    var NAME = 'NKR';
    
    // Build letters
    if(textEl) {
      for(var i=0; i<NAME.length; i++){
        var ch = NAME[i];
        var s = document.createElement('span');
        s.className = 'ld-ltr' + (ch === ' ' ? ' sp' : '');
        s.style.setProperty('--i', i);
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        textEl.appendChild(s);
      }
    }
    
    // Check if we should show loader
    var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || null;
    var isReload = nav ? nav.type === 'reload' : (performance.navigation && performance.navigation.type === 1);
    var seen = false;
    try { seen = !!sessionStorage.getItem('hs_loaded'); } catch(e){}
    
    if(seen && !isReload) {
      root.classList.remove('loading');
      if(loader.parentNode) loader.parentNode.removeChild(loader);
      return;
    }
    
    try { sessionStorage.setItem('hs_loaded','1'); } catch(e){}
    
    var fill = document.getElementById('ldFill');
    var trackFill = document.getElementById('ldTrackFill');
    var countEl = document.getElementById('ldCount');
    
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var DURATION = reduce ? 600 : 2000;
    var start = null, done = false;
    
    function ease(t){ return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
    
    function render(p){ 
      var pct = Math.round(p * 100);
      if(countEl) countEl.textContent = pct;
      if(fill) {
        fill.style.clipPath = 'inset(' + (100 - p*100).toFixed(2) + '% 0 0 0)';
        fill.style.webkitClipPath = 'inset(' + (100 - p*100).toFixed(2) + '% 0 0 0)';
      }
      if(trackFill) trackFill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    
    function finish(){
      if(done) return; done = true;
      loader.classList.add('is-charged');
      setTimeout(function(){
        loader.classList.add('is-done');
        var endMs = reduce ? 420 : 950;
        setTimeout(function(){
          root.classList.remove('loading');
          loader.setAttribute('aria-hidden','true');
          if(loader.parentNode) loader.parentNode.removeChild(loader);
          window.dispatchEvent(new CustomEvent('nkr:loaded'));
        }, endMs);
      }, reduce ? 120 : 320);
    }
    
    function tick(ts){
      if(start === null) start = ts;
      var t = Math.min((ts - start) / DURATION, 1);
      render(ease(t));
      if(t < 1){ requestAnimationFrame(tick); }
      else { finish(); }
    }
    
    requestAnimationFrame(function(){
      loader.classList.add('is-in');
      requestAnimationFrame(tick);
    });
    
    setTimeout(function(){ if(!done){ render(1); finish(); } }, DURATION + 4000);
  }

  // --- TYPEWRITER ---
  function initTypewriter() {
    const roles = ['Data Scientist', 'GenAI Engineer', 'ML Engineer', 'NLP Engineer', 'Applied AI Researcher'];
    const el = document.getElementById('typed');
    if (!el) return;
    
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
  
    function type() {
      const currentRole = roles[roleIndex];
      el.textContent = deleting ? currentRole.slice(0, charIndex--) : currentRole.slice(0, charIndex++);
  
      if (!deleting && charIndex > currentRole.length) {
        setTimeout(() => { deleting = true; }, 1800);
        setTimeout(type, 80);
        return;
      }
  
      if (deleting && charIndex < 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        charIndex = 0;
      }
  
      setTimeout(type, deleting ? 35 : 85);
    }
  
    setTimeout(type, 2000);
  }

  // --- SCROLL REVEALS ---
  function initRevealObserver() {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  }

  // --- MOBILE MENU ---
  function initMobileMenu() {
    const toggles = document.querySelectorAll('[data-menu-open]');
    const closes = document.querySelectorAll('[data-menu-close]');
    const sheet = document.getElementById('mobileSheet');
    
    if(!sheet) return;
    
    toggles.forEach(t => t.addEventListener('click', () => {
      sheet.classList.add('open');
      document.body.style.overflow = 'hidden';
    }));
    
    closes.forEach(c => c.addEventListener('click', () => {
      sheet.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  // --- ACTIVE NAV LINK ---
  function initNavObserver() {
    const sections = document.querySelectorAll('section[id], main[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-sheet nav a');
  
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          const active = document.querySelectorAll(`.nav-links a[href="#${entry.target.id}"], .mobile-sheet nav a[href="#${entry.target.id}"]`);
          active.forEach(a => a.classList.add('active'));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
  
    sections.forEach(section => navObs.observe(section));
  }

  // --- EMAIL COPY ---
  function initEmailCopy() {
    const emailBtn = document.getElementById('emailBtn');
    if(!emailBtn) return;
    
    emailBtn.addEventListener('click', () => {
      const email = emailBtn.dataset.email;
      navigator.clipboard.writeText(email).then(() => {
        emailBtn.classList.add('show-copied');
        setTimeout(() => emailBtn.classList.remove('show-copied'), 2000);
      });
    });
  }

  // Initialize all
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initTypewriter();
    initRevealObserver();
    initMobileMenu();
    initNavObserver();
    initEmailCopy();
  });

})();
