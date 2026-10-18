/* ==========================================================================
   Comportamento geral: relógio de Luanda, menu, link ativo, cabeçalho fixo,
   revelação ao rolar e seleção de pacote.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.querySelector('.header');
  const menuIcon = document.querySelector('#menu-icon');
  const navbar = document.querySelector('.navbar');
  const navLinks = Array.from(document.querySelectorAll('.navbar a[href^="#"]'));

  /* ---------- Relógio digital (hora de Luanda) ---------- */
  const hour = document.querySelector('#hour');
  const min = document.querySelector('#min');
  const sec = document.querySelector('#sec');
  const shortClocks = document.querySelectorAll('[data-clock]');

  let luandaFormatter = null;
  try {
    luandaFormatter = new Intl.DateTimeFormat('pt-PT', {
      timeZone: 'Africa/Luanda',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    });
  } catch (err) {
    luandaFormatter = null; // fuso não suportado: usa UTC+1 (Luanda não tem horário de verão)
  }

  const pad = (n) => String(n).padStart(2, '0');

  function luandaTime() {
    const now = new Date();
    if (luandaFormatter) {
      const parts = {};
      luandaFormatter.formatToParts(now).forEach((p) => { parts[p.type] = p.value; });
      return { h: parts.hour, m: parts.minute, s: parts.second };
    }
    const t = new Date(now.getTime() + 60 * 60 * 1000);
    return { h: pad(t.getUTCHours()), m: pad(t.getUTCMinutes()), s: pad(t.getUTCSeconds()) };
  }

  function tick() {
    const { h, m, s } = luandaTime();
    if (hour) hour.textContent = h;
    if (min) min.textContent = m;
    if (sec) sec.textContent = s;
    shortClocks.forEach((el) => { el.textContent = `${h}:${m}`; });
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Menu móvel ---------- */
  function setMenu(open) {
    if (!menuIcon || !navbar) return;
    menuIcon.classList.toggle('is-open', open);
    navbar.classList.toggle('active', open);
    root.classList.toggle('menu-open', open);
    menuIcon.setAttribute('aria-expanded', String(open));
    menuIcon.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  if (menuIcon && navbar) {
    menuIcon.addEventListener('click', () => setMenu(!navbar.classList.contains('active')));
    navbar.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navbar.classList.contains('active')) {
        setMenu(false);
        menuIcon.focus();
      }
    });
    window.matchMedia('(min-width: 1181px)').addEventListener('change', (e) => {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Link ativo + cabeçalho fixo ---------- */
  const targets = navLinks
    .map((link) => {
      const id = decodeURIComponent(link.getAttribute('href').slice(1));
      return { link, section: document.getElementById(id) };
    })
    .filter((t) => t.section);

  function updateActiveLink() {
    const y = window.scrollY + (header ? header.offsetHeight : 0) + window.innerHeight * 0.25;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    let current = targets[0];
    targets.forEach((t) => {
      if (t.section.getBoundingClientRect().top + window.scrollY <= y) current = t;
    });
    if (atBottom) current = targets[targets.length - 1];
    targets.forEach((t) => {
      const isCurrent = t === current;
      t.link.classList.toggle('active', isCurrent);
      if (isCurrent) t.link.setAttribute('aria-current', 'location');
      else t.link.removeAttribute('aria-current');
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (header) header.classList.toggle('sticky', window.scrollY > 8);
      if (targets.length) updateActiveLink();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Revelação ao rolar ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Projetos: "ver todos" (móvel) ---------- */
  const projectsToggle = document.querySelector('.projects-toggle');
  const projectsList = document.getElementById('lista-projetos');
  if (projectsToggle && projectsList) {
    projectsToggle.addEventListener('click', () => {
      const expanded = projectsList.classList.toggle('is-expanded');
      projectsToggle.setAttribute('aria-expanded', String(expanded));
      projectsList.querySelectorAll('.project--extra').forEach((el) => el.classList.add('is-visible'));
      if (!expanded) projectsList.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }

  /* ---------- Serviços: abertos no desktop, recolhidos no móvel ---------- */
  const services = document.querySelectorAll('details.service');
  const mobileQuery = window.matchMedia('(max-width: 680px)');
  function syncServices() {
    services.forEach((d) => { d.open = !mobileQuery.matches; });
  }
  if (services.length) {
    syncServices();
    mobileQuery.addEventListener('change', syncServices);
    // no desktop os pacotes ficam sempre abertos
    services.forEach((d) => {
      d.querySelector('summary').addEventListener('click', (e) => {
        if (!mobileQuery.matches) e.preventDefault();
      });
    });
  }

  /* ---------- Selecionar pacote (serviços → formulário) ---------- */
  const campoFormulario = document.getElementById('campoFormulario');
  document.querySelectorAll('.selecionar-pacote').forEach((link) => {
    link.addEventListener('click', function (event) {
      if (!campoFormulario) return;
      campoFormulario.value = this.getAttribute('data-pacote');
      campoFormulario.classList.add('campo-preenchido', 'input-success');
      campoFormulario.classList.remove('input-error');
      const errorElement = campoFormulario.nextElementSibling;
      if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = '';
        errorElement.classList.remove('active');
      }
      const destino = document.querySelector(this.getAttribute('href'));
      if (destino) {
        event.preventDefault();
        destino.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
