/* Interações do site institucional. Não controla o motor do jogo. */
(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function setupYear() {
    const year = $('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function setupNavigation() {
    const toggle = $('.nav-toggle');
    const nav = $('#site-navigation');
    if (!toggle || !nav) return;

    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
    });

    $$('a', nav).forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
  }

  function setupFilters() {
    $$('[data-filter-input]').forEach((input) => {
      const key = input.dataset.filterInput;
      const list = $(`[data-filter-list="${key}"]`);
      if (!list) return;

      const entries = $$('[data-search]', list);
      const count = $('[data-filter-count]');
      const empty = $('[data-empty-state]', list);
      const originalCount = entries.length;

      const update = () => {
        const term = input.value.trim().toLocaleLowerCase('pt-BR');
        let visible = 0;
        entries.forEach((entry) => {
          const haystack = `${entry.dataset.search || ''} ${entry.textContent}`.toLocaleLowerCase('pt-BR');
          const match = haystack.includes(term);
          entry.hidden = !match;
          if (match) visible += 1;
        });
        if (empty) empty.hidden = visible !== 0;
        if (count) count.textContent = `${String(visible).padStart(2, '0')} / ${String(originalCount).padStart(2, '0')} REGISTROS`;
      };

      input.addEventListener('input', update);
      update();
    });
  }

  function setupLightbox() {
    const dialog = $('[data-lightbox-dialog]');
    if (!dialog) return;
    const image = $('[data-lightbox-image]', dialog);
    const caption = $('[data-lightbox-caption]', dialog);
    const close = $('[data-lightbox-close]', dialog);

    $$('[data-lightbox]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        image.src = trigger.dataset.lightbox;
        image.alt = trigger.querySelector('img')?.alt || 'Imagem ampliada da galeria';
        caption.textContent = trigger.dataset.caption || '';
        if (typeof dialog.showModal === 'function') dialog.showModal();
      });
    });

    close?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      image.removeAttribute('src');
    });
  }

  function setupContactForm() {
    const form = $('[data-fake-form]');
    const status = $('[data-form-status]');
    if (!form || !status) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const name = String(data.get('nome') || 'jogador').trim() || 'jogador';
      const protocol = `QP-${Math.floor(1000 + Math.random() * 9000)}`;
      status.textContent = `Transmissão simulada com sucesso, ${name}. Protocolo ${protocol}. Nenhum dado foi enviado.`;
      form.reset();
    });
  }

  setupYear();
  setupNavigation();
  setupFilters();
  setupLightbox();
  setupContactForm();
})();
