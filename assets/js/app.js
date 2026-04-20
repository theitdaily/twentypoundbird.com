(function () {
  const data = window.siteData;
  if (!data) return;

  const lang = document.body.dataset.lang || 'en';
  const t = data.content[lang] || data.content.en;
  const app = document.getElementById('app');

  const formatDate = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });
  const localizedValue = (value) => (value && typeof value === 'object' ? value[lang] || value.en || '' : value || '');
  const escapeHtml = (text) =>
    String(text || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  const linkifyText = (text) => {
    const escaped = escapeHtml(text);
    const pattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})|((?:https?:\/\/|www\.)[^\s<]+)|((?:github\.com\/)[A-Za-z0-9._/-]+)/gi;
    return escaped.replace(pattern, (match, email, url, github) => {
      if (email) return `<a href="mailto:${email}">${email}</a>`;
      if (url) {
        const href = url.startsWith('http') ? url : `https://${url}`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      }
      if (github) return `<a href="https://${github}" target="_blank" rel="noopener noreferrer">${github}</a>`;
      return match;
    });
  };
  const safeAuthorLink = (author) => {
    const authorName = localizedValue(author?.name);
    if (!author?.url) return authorName;
    return `<a href="${author.url}" target="_blank" rel="noopener noreferrer">${authorName}</a>`;
  };
  const socialIcon = (label, url) => {
    const key = `${label || ''} ${url || ''}`.toLowerCase();
    if (key.includes('github')) {
      return '<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5A12 12 0 0 0 8.2 23c.6.1.8-.2.8-.6v-2.3c-3.3.7-4-1.4-4-1.4-.6-1.3-1.3-1.6-1.3-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.7.7 2.1 1.4.9.1 1.9.3 2.7.1.1-.7.4-1.3.8-1.8-2.7-.3-5.4-1.3-5.4-5.8 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3 0 0 .9-.3 3 .9a10.2 10.2 0 0 1 5.4 0c2.1-1.2 3-.9 3-.9.6 1.5.2 2.7.1 3 .7.8 1.1 1.8 1.1 3 0 4.5-2.7 5.5-5.4 5.8.5.4.9 1.2.9 2.5v3.7c0 .4.2.7.8.6A12 12 0 0 0 12 .5Z"/></svg>';
    }
    if (key.includes('linkedin')) {
      return '<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5ZM3 9.8h4v11.7H3V9.8Zm7 0h3.8v1.6h.1c.5-.9 1.8-1.9 3.7-1.9 4 0 4.7 2.5 4.7 5.8v6.2h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.6h-4V9.8Z"/></svg>';
    }
    return '';
  };
  const socialLink = (link) => `<a class="social-link" target="_blank" rel="noopener noreferrer" href="${link.url}">${socialIcon(link.label, link.url)}<span>${link.label}</span></a>`;

  const docName = document.body.dataset.doc;
  const pathSuffix = docName ? `docs/${docName}/` : '';

  function languageSwitch() {
    return Object.entries(data.languages)
      .map(([code, item]) => `<a class="lang-link ${code === lang ? 'active' : ''}" href="${item.path}${pathSuffix}">${item.label}</a>`)
      .join('');
  }


  function syncAnchorOffset() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const top = parseFloat(getComputedStyle(header).top || '0') || 0;
    const offset = Math.ceil(header.getBoundingClientRect().height + top + 16);
    document.documentElement.style.setProperty('--anchor-offset', `${offset}px`);
  }

  function renderMainPage() {
    document.title = `${t.heroTitle} — ${t.heroSubtitle}`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t.seoDescription);

    app.innerHTML = `
      <header class="site-header glass reveal">
        <img src="/sources/twenty_pound_bird_logo_white.svg" alt="Twenty Pound Bird logo" class="logo" />
        <nav>${t.nav.map((n, i) => `<a href="#${['about', 'team', 'news', 'contacts'][i]}">${n}</a>`).join('')}</nav>
        <div class="lang-switch">${languageSwitch()}</div>
      </header>

      <section id="about" class="hero reveal">
        <h1>${t.heroTitle}</h1>
        <h2>${t.heroSubtitle}</h2>
        <p>${t.heroText}</p>
      </section>

      <section class="block reveal">
        <h3>${t.workTitle}</h3>
        <p class="section-intro">${t.workText}</p>
        <div class="showcase-grid">
          ${data.showcase
            .map(
              (item) => `
            <article class="showcase-card glass">
              <img src="${item.image}" alt="${localizedValue(item.title)}" loading="lazy" decoding="async" />
              <div class="showcase-content">
                <h4>${localizedValue(item.title)}</h4>
                <p>${localizedValue(item.text)}</p>
                ${item.developerId ? `<div class="showcase-links"><button class="showcase-link showcase-dev-btn" data-dev-target="${item.developerId}">${t.developerButton}</button></div>` : ''}
              </div>
            </article>`
            )
            .join('')}
        </div>
      </section>

      <section id="team" class="block reveal">
        <h3>${t.teamTitle}</h3>
        <div class="cards team-cards">
          ${data.team
            .map(
              (m) => `
            <article id="dev-${m.id}" class="card team-card">
              <img src="${m.image}" alt="${localizedValue(m.name)}" class="avatar" loading="lazy" decoding="async" />
              <h4>${localizedValue(m.name)}</h4>
              <p>${localizedValue(m.role)}</p>
              ${localizedValue(m.extra) ? `<p class="muted skill-note">${localizedValue(m.extra)}</p>` : ''}
              <div class="links">${m.links.map((l) => socialLink(l)).join('')}</div>
            </article>`
            )
            .join('')}
        </div>
      </section>

      <section id="news" class="block reveal">
        <h3>${t.newsTitle}</h3>
        <div class="news-grid">
          ${data.news
            .map(
              (n) => `
            <article class="news-item glass">
              <div class="news-head">
                <h4>${n.title[lang]}</h4>
                ${n.archive ? `<span class="badge">${t.badges.archive}</span>` : ''}
              </div>
              <p class="news-body">${linkifyText(n.body[lang])}</p>
              <p class="news-meta">${formatDate(n.date)} · ${safeAuthorLink(n.author)}</p>
            </article>`
            )
            .join('')}
        </div>
      </section>

      <section id="contacts" class="block reveal">
        <h3>${t.contactsTitle}</h3>
        <p>Email: <a href="mailto:feedback.tpb@gmail.com">feedback.tpb@gmail.com</a></p>
        <p class="contact-social">
          ${socialLink({ label: 'GitHub (Mikhail)', url: 'https://github.com/theitdaily' })}
          ${socialLink({ label: 'LinkedIn (Mikhail)', url: 'https://www.linkedin.com/in/theitdaily/' })}
          ${socialLink({ label: 'GitHub (Ainur)', url: 'https://github.com/ainurdada' })}
          ${socialLink({ label: 'LinkedIn (Ainur)', url: 'https://www.linkedin.com/in/ainurdada/' })}
        </p>
      </section>

      <footer class="site-footer reveal">
        <a href="/${lang}/docs/terms/">${t.legal.terms}</a>
        <a href="/${lang}/docs/privacy/">${t.legal.privacy}</a>
        <a href="/${lang}/docs/cookies/">${t.legal.cookies}</a>
        <p class="footer-disclaimer">${t.footerDisclaimer}</p>
        <p class="copyright">© 2021–2026 Twenty Pound Bird</p>
      </footer>
      <div id="cookie-banner" class="cookie-banner hidden">
        <p>${t.cookie.text} <a href="/${lang}/docs/cookies/">${t.cookie.link}</a></p>
        <div>
          <button id="cookie-accept">${t.cookie.accept}</button>
          <button id="cookie-reject" class="ghost">${t.cookie.reject}</button>
        </div>
      </div>
    `;

    const cookieChoice = localStorage.getItem('tpb_cookie_consent');
    const banner = document.getElementById('cookie-banner');
    if (!cookieChoice && banner) banner.classList.remove('hidden');
    document.getElementById('cookie-accept')?.addEventListener('click', () => {
      localStorage.setItem('tpb_cookie_consent', 'accepted');
      banner.classList.add('hidden');
    });
    document.getElementById('cookie-reject')?.addEventListener('click', () => {
      localStorage.setItem('tpb_cookie_consent', 'rejected');
      banner.classList.add('hidden');
    });

    document.querySelectorAll('.showcase-dev-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const memberId = btn.dataset.devTarget;
        const card = memberId ? document.getElementById(`dev-${memberId}`) : null;
        if (!card) return;
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.remove('focus-highlight');
        void card.offsetWidth;
        card.classList.add('focus-highlight');
        window.setTimeout(() => card.classList.remove('focus-highlight'), 3200);
      });
    });
  }

  function renderDocPage() {
    const doc = data.docs[docName]?.[lang] || data.docs[docName]?.en;
    const c = document.getElementById('doc-container');
    if (!doc || !c) return;
    c.innerHTML = `
      <a href="/${lang}/" class="back-link">← Twenty Pound Bird</a>
      <div class="lang-switch docs">${languageSwitch()}</div>
      <h1>${doc.title}</h1>
      ${doc.body
        .map((block) => {
          if (typeof block === 'string' && block.trim().startsWith('<')) return block;
          return `<p>${block}</p>`;
        })
        .join('')}
    `;
  }

  if (document.body.classList.contains('doc-page')) {
    renderDocPage();
  } else {
    renderMainPage();
  }

  document.getElementById('page-loader')?.classList.add('hidden');
  app?.classList.remove('hidden');

  let syncRaf = 0;
  const scheduleAnchorSync = () => {
    if (syncRaf) return;
    syncRaf = window.requestAnimationFrame(() => {
      syncRaf = 0;
      syncAnchorOffset();
    });
  };

  scheduleAnchorSync();
  window.addEventListener('resize', scheduleAnchorSync, { passive: true });
  window.addEventListener('orientationchange', scheduleAnchorSync, { passive: true });
  if (document.fonts?.ready) document.fonts.ready.then(syncAnchorOffset);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  if (reduceMotion) {
    revealItems.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.09, rootMargin: '0px 0px 4% 0px' });

  revealItems.forEach((el) => observer.observe(el));
})();
