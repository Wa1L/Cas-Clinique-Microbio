/* Cas Cliniques de Microbiologie — interactions
 * 1. Corrigé masqué derrière un bouton (détails repliables)
 * 2. Suivi de progression par cas (localStorage)
 * 3. Coches dans le menu latéral + barres de progression sur l'accueil
 * 4. Page "Mes progrès"
 */
(function () {
  'use strict';

  var LS_KEY = 'ccm_progress_v1';

  function store() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function persist(s) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function pageKey() {
    return location.pathname.replace(/\/(index\.html)?$/, '/') || '/';
  }
  function isCasePage() { return /\/cas-[\w.-]+\/?$/.test(pageKey()); }

  /* ------------------------------------------------ 1. corrigé replié */
  function wrapCorrige() {
    var article = document.querySelector('.md-content__inner.md-typeset');
    if (!article || !isCasePage()) return;
    var kids = Array.prototype.slice.call(article.children);
    var idx = -1;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (/^H[2-4]$/.test(el.tagName) && /corrig/i.test(el.textContent || '')) { idx = i; break; }
    }
    if (idx === -1) return;
    var details = document.createElement('details');
    details.className = 'corrige';
    var summary = document.createElement('summary');
    summary.className = 'corrige-summary';
    summary.innerHTML =
      '<span class="corrige-icon">📖</span>' +
      '<span class="corrige-label">Corrigé</span>' +
      '<span class="corrige-hint">Cliquer pour afficher / masquer</span>' +
      '<span class="corrige-arrow">▾</span>';
    details.appendChild(summary);
    var moved = kids.slice(idx);
    var first = moved[0];
    first.parentNode.insertBefore(details, first);
    moved.forEach(function (el) { details.appendChild(el); });
  }

  /* -------------------------------------- 2. bouton « cas terminé » */
  function addProgressButton() {
    var article = document.querySelector('.md-content__inner.md-typeset');
    if (!article || !isCasePage()) return;
    var h1 = article.querySelector('h1');
    if (!h1) return;

    var wrap = document.createElement('div');
    wrap.className = 'progress-actions';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'progress-btn';

    function render() {
      var done = !!store()[pageKey()];
      btn.classList.toggle('done', done);
      btn.innerHTML = done
        ? '<span class="pb-check">✔</span> Cas terminé — cliquer pour décocher'
        : '<span class="pb-circle"></span> Marquer ce cas comme terminé';
    }
    btn.addEventListener('click', function () {
      var s = store();
      if (s[pageKey()]) { delete s[pageKey()]; } else { s[pageKey()] = Date.now(); }
      persist(s);
      render();
      markNav();
      updateBars();
    });

    wrap.appendChild(btn);
    h1.parentNode.insertBefore(wrap, h1.nextSibling);
    render();
  }

  /* ----------------------------------- 3. coches nav + barres accueil */
  function markNav() {
    var s = store();
    var keys = Object.keys(s);
    document.querySelectorAll('.md-sidebar--primary .md-nav__link').forEach(function (a) {
      var chk = a.querySelector('.nav-check');
      var href = a.getAttribute('href');
      if (!href) return;
      var abs;
      try { abs = new URL(href, location.href).pathname; } catch (e) { return; }
      abs = abs.replace(/\/(index\.html)?$/, '/');
      var isDone = keys.indexOf(abs) !== -1;
      a.classList.toggle('nav-done', isDone);
      if (isDone && !chk) {
        chk = document.createElement('span');
        chk.className = 'nav-check';
        chk.textContent = '✔';
        a.appendChild(chk);
      } else if (!isDone && chk) {
        chk.remove();
      }
    });
  }

  function updateBars() {
    var s = store();
    document.querySelectorAll('.part-card[data-part]').forEach(function (card) {
      var slug = card.getAttribute('data-part');
      var total = parseInt(card.getAttribute('data-total') || '0', 10);
      var done = 0;
      Object.keys(s).forEach(function (k) {
        if (k.indexOf('/cases/' + slug + '/') !== -1) done++;
      });
      done = Math.min(done, total);
      var bar = card.querySelector('.progress-bar');
      var txt = card.querySelector('.progress-text');
      var pct = total ? Math.round((done / total) * 100) : 0;
      if (bar) { bar.style.width = pct + '%'; }
      if (txt) {
        txt.innerHTML = (done === total && total > 0)
          ? '🎉 ' + done + '/' + total + ' cas terminés (' + pct + ' %)'
          : '✅ ' + done + '/' + total + ' cas terminés (' + pct + ' %)';
      }
    });
  }

  /* ------------------------------------------- 4. page « Mes progrès » */
  function renderProgressPage() {
    var app = document.getElementById('progress-app');
    if (!app) return;

    var BASE = (function () {
      var mm = location.pathname.match(/^(.*\/Cas-Clinique-Microbio\/)/);
      return mm ? mm[1] : '/';
    })();

    function fetchJson(url) {
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      });
    }
    fetchJson(BASE + 'assets/cases.json')
      .catch(function () { return fetchJson('../assets/cases.json'); })
      .catch(function () { return fetchJson('assets/cases.json'); })
      .then(build)
      .catch(function () {
        app.innerHTML = '<p class="progress-error">Impossible de charger la liste des cas.</p>';
      });

    function isDone(rel) {
      var full = '/' + rel.replace(/\.md$/, '/');
      var s = store();
      var keys = Object.keys(s);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].slice(-full.length) === full) return true;
      }
      return false;
    }

    function caseLabel(rel) {
      var name = rel.replace(/^.*\//, '').replace(/\.md$/, '');
      var m = name.match(/^cas-(\d+)-(\d+)$/);
      if (m) return 'Cas ' + m[1] + '.' + parseInt(m[2], 10);
      return name;
    }

    function build(data) {
      var totalCases = 0, doneCases = 0;
      var html = [];

      data.parts.forEach(function (p) {
        var pTotal = 0, pDone = 0;
        p.sections.forEach(function (sec) { pTotal += sec.cases.length; });
        var block = [];
        block.push('<div class="pp-part" data-pslug="' + p.slug + '">');
        block.push('<h2>' + p.icon + ' ' + p.title + '</h2>');
        p.sections.forEach(function (sec) {
          block.push('<div class="pp-section">');
          block.push('<h3>' + sec.title + '</h3>');
          block.push('<ul class="pp-list">');
          sec.cases.forEach(function (c) {
            totalCases++;
            var done = isDone(c);
            if (done) { doneCases++; pDone++; }
            var url = BASE + 'cases/' + c.replace(/\.md$/, '') + '/';
            block.push(
              '<li class="pp-case' + (done ? ' is-done' : '') + '" data-rel="cases/' + c + '">' +
              '<a href="' + url + '">' + caseLabel(c) + '</a>' +
              '<span class="pp-status">' + (done ? '✔ fait' : 'à faire') + '</span>' +
              '</li>');
          });
          block.push('</ul>');
          block.push('</div>');
        });
        var pct = pTotal ? Math.round(pDone / pTotal * 100) : 0;
        block.push('<div class="progress"><div class="progress-bar" style="width:' + pct + '%"></div></div>');
        block.push('<span class="progress-text">' + pDone + '/' + pTotal + ' terminés — ' + pct + ' %</span>');
        block.push('</div>');
        html.push(block.join(''));
      });

      var gpct = totalCases ? Math.round(doneCases / totalCases * 100) : 0;
      var head =
        '<div class="pp-summary">' +
        '<div class="pp-ring" style="--p:' + gpct + '"><span>' + gpct + ' %</span></div>' +
        '<div class="pp-summary-text"><strong>' + doneCases + '</strong> / ' + totalCases +
        ' cas terminés. Continuez comme ça ! 💪</div>' +
        '<button type="button" id="pp-reset" class="md-button">Réinitialiser ma progression</button>' +
        '</div>';

      app.innerHTML = head + html.join('');

      app.querySelectorAll('.pp-case').forEach(function (li) {
        li.addEventListener('click', function (ev) {
          if (ev.target.tagName === 'A') return;
          var rel = li.getAttribute('data-rel');
          var st = store();
          var full = '/' + rel.replace(/\.md$/, '/');
          var keys = Object.keys(st);
          var found = keys.filter(function (k) { return k.slice(-full.length) === full; });
          if (found.length) { found.forEach(function (k) { delete st[k]; }); }
          else { st[full] = Date.now(); }
          persist(st);
          renderProgressPage();
          markNav(); updateBars();
        });
      });

      var reset = document.getElementById('pp-reset');
      if (reset) reset.addEventListener('click', function () {
        if (!confirm('Effacer toute votre progression enregistrée ?')) return;
        persist({});
        renderProgressPage();
        markNav(); updateBars();
      });
    }
  }

  /* ---------------------------------------------------------- démarrage */
  wrapCorrige();
  addProgressButton();
  markNav();
  updateBars();
  renderProgressPage();
})();
