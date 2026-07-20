(function () {
  'use strict';

  // --- LOADER ---
  function initLoader() {
    var root = document.documentElement;
    var loader = document.getElementById('loader');
    if (!loader) return;

    var textEl = document.getElementById('ldText');
    var NAME = 'NKR';

    // Build letters
    if (textEl) {
      for (var i = 0; i < NAME.length; i++) {
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
    try { seen = !!sessionStorage.getItem('hs_loaded'); } catch (e) { }

    if (seen && !isReload) {
      root.classList.remove('loading');
      if (loader.parentNode) loader.parentNode.removeChild(loader);
      return;
    }

    try { sessionStorage.setItem('hs_loaded', '1'); } catch (e) { }

    var fill = document.getElementById('ldFill');
    var trackFill = document.getElementById('ldTrackFill');
    var countEl = document.getElementById('ldCount');

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var DURATION = reduce ? 600 : 2000;
    var start = null, done = false;

    function ease(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

    function render(p) {
      var pct = Math.round(p * 100);
      if (countEl) countEl.textContent = pct;
      if (fill) {
        fill.style.clipPath = 'inset(' + (100 - p * 100).toFixed(2) + '% 0 0 0)';
        fill.style.webkitClipPath = 'inset(' + (100 - p * 100).toFixed(2) + '% 0 0 0)';
      }
      if (trackFill) trackFill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }

    function finish() {
      if (done) return; done = true;
      loader.classList.add('is-charged');
      setTimeout(function () {
        loader.classList.add('is-done');
        var endMs = reduce ? 420 : 950;
        setTimeout(function () {
          root.classList.remove('loading');
          loader.setAttribute('aria-hidden', 'true');
          if (loader.parentNode) loader.parentNode.removeChild(loader);
          window.dispatchEvent(new CustomEvent('nkr:loaded'));
        }, endMs);
      }, reduce ? 120 : 320);
    }

    function tick(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / DURATION, 1);
      render(ease(t));
      if (t < 1) { requestAnimationFrame(tick); }
      else { finish(); }
    }

    requestAnimationFrame(function () {
      loader.classList.add('is-in');
      requestAnimationFrame(tick);
    });

    setTimeout(function () { if (!done) { render(1); finish(); } }, DURATION + 4000);
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

    if (!sheet) return;

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
    if (!emailBtn) return;

    emailBtn.addEventListener('click', () => {
      const email = emailBtn.dataset.email;
      navigator.clipboard.writeText(email).then(() => {
        emailBtn.classList.add('show-copied');
        setTimeout(() => emailBtn.classList.remove('show-copied'), 2000);
      });
    });
  }

  // --- PROJECT DATA & RENDERING ---
  // Easily add, delete, or update projects here.
  const projectsData = [
    {
      title: "RAG-Powered Virtual Assistant",
      category: "GenAI &middot; LLMs",
      accentClass: "pcard-terracotta",
      teaser: "Built a retrieval-augmented generation pipeline with semantic search and an LLM-powered Q&A interface for faster document intelligence. Built a retrieval-augmented generation pipeline with semantic search and an LLM-powered Q&A interface for faster document intelligence.",
      faceMetrics: "Python &middot; LangChain &middot; FAISS",
      metrics: [
        { value: "LangChain", label: "Orchestration" },
        { value: "FAISS", label: "Vector DB" }
      ],
      tags: ["Python", "LangChain", "FAISS", "GenAI"],
      links: [
        { url: "https://github.com/Nithin1572", text: "&#8599; View on GitHub", class: "lnk" }
      ]
    },
    {
      title: "Healthcare Big Data Analytics",
      category: "Big Data &middot; Analytics",
      accentClass: "pcard-teal",
      teaser: "Processed healthcare records at scale with Spark and Hive, surfacing operational patterns and patient outcome insights.",
      faceMetrics: "Spark &middot; Hive &middot; AWS",
      metrics: [
        { value: "Spark", label: "Processing" },
        { value: "Hive", label: "Data Warehouse" },
        { value: "AWS", label: "Cloud" }
      ],
      tags: ["Spark", "Hive", "AWS", "Big Data"],
      links: [
        { url: "https://github.com/Nithin1572", text: "&#8599; View on GitHub", class: "lnk" }
      ]
    },
    {
      title: "Telugu Voice Dialogue System",
      category: "NLP &middot; Deep Learning",
      accentClass: "pcard-sage",
      teaser: "Contributed to a voice-enabled dialogue system supporting Telugu dialects with speech-to-text and command recognition workflows.",
      faceMetrics: "TensorFlow &middot; PyTorch &middot; NLP",
      metrics: [
        { value: "TensorFlow", label: "Framework" },
        { value: "PyTorch", label: "Framework" }
      ],
      tags: ["TensorFlow", "PyTorch", "NLP", "Deep Learning"],
      links: [
        { url: "https://github.com/Nithin1572", text: "&#8599; View on GitHub", class: "lnk" }
      ]
    }
  ];

  function renderProjects() {
    const rail = document.getElementById('projectRail');
    if (!rail) return;

    let html = '';
    projectsData.forEach((p) => {
      let metricsHtml = (p.metrics || []).map(m => `
        <div class="m">
          <div class="m-val">${m.value}</div>
          <div class="m-lab">${m.label}</div>
        </div>
      `).join('');

      let tagsHtml = (p.tags || []).map(t => `<span class="tag-i">${t}</span>`).join('');

      let linksHtml = (p.links || []).map(l => `
        <a class="${l.class || 'lnk'}" href="${l.url}" target="_blank" rel="noopener">${l.text}</a>
      `).join('');

      html += `
        <article class="card feat ${p.accentClass || ''}" tabindex="0" role="button" aria-label="${p.title} &mdash; open details">
          <div class="card-top"><span class="feat-flag" style="visibility:hidden">&middot;</span><span class="track agentic">${p.category}</span></div>
          <h3>${p.title}</h3>
          <p class="teaser">${p.teaser}</p>
          <div class="face-foot"><span class="face-metric">${p.faceMetrics}</span><span class="view">View details &rarr;</span></div>
          <div class="detail" hidden>
            <div class="modal-top"><span class="feat-flag" style="visibility:hidden">&middot;</span><span class="track agentic">${p.category}</span></div>
            <h3 class="modal-title">${p.title}</h3>
            <p class="modal-desc">${p.description || p.teaser}</p>
            ${metricsHtml ? `<div class="rail">${metricsHtml}</div>` : ''}
            ${tagsHtml ? `<div class="tags">${tagsHtml}</div>` : ''}
            ${linksHtml ? `<div class="links">${linksHtml}</div>` : ''}
          </div>
        </article>
      `;
    });

    rail.innerHTML = html;
  }

  // --- PROJECT RAIL ---
  function initProjectRail() {
    var rail = document.getElementById('projectRail');
    if (!rail) return;
    var wrap = rail.closest('.rail-wrap');
    var prev = wrap.querySelector('.rail-arrow.prev');
    var next = wrap.querySelector('.rail-arrow.next');
    var dotsWrap = document.getElementById('railDots');
    var cards = [].slice.call(rail.querySelectorAll('.card'));
    var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var beh = RM ? 'auto' : 'smooth';

    function step() { return cards.length > 0 ? cards[0].offsetWidth + 18 : 0; }

    cards.forEach(function (c, i) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Go to project ' + (i + 1));
      b.addEventListener('click', function () { rail.scrollTo({ left: Math.round(i * step()), behavior: beh }); });
      if (dotsWrap) dotsWrap.appendChild(b);
    });

    var dots = dotsWrap ? [].slice.call(dotsWrap.children) : [];

    function update() {
      var x = rail.scrollLeft, max = rail.scrollWidth - rail.clientWidth;
      wrap.classList.toggle('at-start', x <= 4);
      wrap.classList.toggle('at-end', x >= max - 4);
      if (prev) prev.disabled = x <= 4;
      if (next) next.disabled = x >= max - 4;
      var idx = Math.min(dots.length - 1, Math.round(x / step()));
      dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
    }

    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: beh }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: beh }); });
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    // drag-to-scroll (desktop)
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', function (e) { down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add('dragging'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var d = e.clientX - sx; if (Math.abs(d) > 5) moved = true; rail.scrollLeft = sl - d; });
    window.addEventListener('pointerup', function () { if (down) { down = false; rail.classList.remove('dragging'); } });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

    // keyboard
    rail.setAttribute('tabindex', '0'); rail.setAttribute('role', 'group'); rail.setAttribute('aria-label', 'Projects — use arrow keys to scroll');
    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left: step(), behavior: beh }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: beh }); }
    });
  }

  // --- PROJECT MODAL ---
  function initProjectModal() {
    var overlay = document.getElementById('projModal');
    var body = document.getElementById('modalBody');
    var x = document.getElementById('modalX');
    if (!overlay || !body || !x) return;

    var last = null;

    function openModal(art) {
      last = art;
      var detail = art.querySelector('.detail');
      if (detail) {
        body.innerHTML = detail.innerHTML;
      }
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      x.focus();
      overlay.scrollTop = 0;
    }

    function closeModal() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      if (last) last.focus();
    }

    [].forEach.call(document.querySelectorAll('#projectRail .card'), function (art) {
      art.addEventListener('click', function () { openModal(art); });
      art.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(art); } });
    });

    x.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) closeModal(); });

    // Focus trap
    overlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || overlay.hidden) return;
      var f = overlay.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
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
    renderProjects();
    initProjectRail();
    initProjectModal();
  });

})();
