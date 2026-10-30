(() => {
  const body = document.body;
  const designButtons = [...document.querySelectorAll('.design-picker [data-design]')];
  const status = document.getElementById('design-status');
  const designNames = {
    editorial: 'Editorial',
    industrial: 'Distribuição',
    studio: 'Coleção',
  };
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let designSwitchTimer;

  function setDesign(name, persist = true, animate = false) {
    if (!designNames[name]) return;
    const apply = () => {
      body.dataset.design = name;
      designButtons.forEach((button) => {
        const selected = button.dataset.design === name;
        button.setAttribute('aria-pressed', String(selected));
      });
      status.textContent = `Direção selecionada: ${designNames[name]}`;
      if (persist) {
        try { localStorage.setItem('voe-prototype-design', name); } catch { /* Storage is optional. */ }
      }
    };
    if (!animate || prefersReducedMotion || body.dataset.design === name) {
      apply();
      return;
    }
    window.clearTimeout(designSwitchTimer);
    body.classList.add('design-is-switching');
    designSwitchTimer = window.setTimeout(() => {
      apply();
      window.requestAnimationFrame(() => body.classList.remove('design-is-switching'));
    }, 120);
  }

  designButtons.forEach((button) => button.addEventListener('click', () => setDesign(button.dataset.design, true, true)));
  try {
    const savedDesign = localStorage.getItem('voe-prototype-design');
    if (savedDesign && designNames[savedDesign]) setDesign(savedDesign, false);
  } catch { /* Use the editorial direction when storage is unavailable. */ }

  const cards = [...document.querySelectorAll('.product-card')];
  const search = document.getElementById('model-search');
  const filters = [...document.querySelectorAll('.filter-button')];
  const resultCount = document.getElementById('result-count');
  const filterLabel = (count) => `${count} ${count === 1 ? 'modelo' : 'modelos'} de referência`;
  let activeFilter = 'todos';

  function filterCatalog(animate = false) {
    const query = (search?.value || '').trim().toLocaleLowerCase('pt-BR');
    let shown = 0;
    cards.forEach((card) => {
      const matchesCategory = activeFilter === 'todos' || card.dataset.category === activeFilter;
      const matchesQuery = !query || `${card.dataset.name} ${card.textContent}`.toLocaleLowerCase('pt-BR').includes(query);
      const visible = matchesCategory && matchesQuery;
      card.dataset.motionTarget = String(visible);
      card.getAnimations().forEach((animation) => animation.cancel());
      if (!animate || prefersReducedMotion) {
        card.hidden = !visible;
      } else if (visible) {
        const wasHidden = card.hidden;
        card.hidden = false;
        if (wasHidden) card.animate([{ opacity: 0, transform: 'translate3d(0,12px,0)' }, { opacity: 1, transform: 'translate3d(0,0,0)' }], { duration: 300, delay: Math.min(shown * 45, 180), easing: 'cubic-bezier(.2,.7,.2,1)' });
      } else if (!card.hidden) {
        const animation = card.animate([{ opacity: 1, transform: 'translate3d(0,0,0)' }, { opacity: 0, transform: 'translate3d(0,8px,0)' }], { duration: 160, easing: 'ease-in', fill: 'forwards' });
        animation.onfinish = () => { if (card.dataset.motionTarget === 'false') card.hidden = true; };
      }
      if (visible) shown += 1;
    });
    resultCount.textContent = filterLabel(shown);
  }

  search?.addEventListener('input', () => filterCatalog(true));
  filters.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filters.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    filterCatalog(true);
  }));

  const nav = document.querySelector('.site-header nav');
  const menuToggle = document.querySelector('.menu-toggle');
  menuToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? 'Fechar' : 'Menu';
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    if (menuToggle) menuToggle.textContent = 'Menu';
  }));

  const contactLead = document.querySelector('.contact-copy p');
  const toast = document.getElementById('toast');
  let toastTimer;
  document.querySelectorAll('[data-interest]').forEach((link) => link.addEventListener('click', () => {
    const model = link.dataset.interest;
    if (contactLead) contactLead.textContent = `Consulta selecionada: ${model}. Para confirmar catálogo, disponibilidade e condições, fale com a equipe comercial da Voe Distribuidora.`;
    if (toast) {
      toast.textContent = `Você selecionou ${model}. As informações comerciais são confirmadas diretamente com a equipe.`;
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3800);
    }
  }));

  if (!prefersReducedMotion) {
    document.documentElement.classList.add('motion-ready');
    const revealTargets = [...document.querySelectorAll('main > section:not(.hero), .intro-row, .category-grid, .product-grid')];
    revealTargets.forEach((target) => target.classList.add(target.matches('.category-grid,.product-grid') ? 'motion-stagger' : 'motion-reveal'));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }), { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
      revealTargets.forEach((target) => observer.observe(target));
    } else {
      revealTargets.forEach((target) => target.classList.add('is-visible'));
    }
  }

  filterCatalog();
})();
