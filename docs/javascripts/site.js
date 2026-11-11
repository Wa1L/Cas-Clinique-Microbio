/* Cas Cliniques de Microbiologie — interactions
 * 1. Corrigé masqué derrière un bouton (détails repliables)
 * 2. Suivi de progression par cas (localStorage)
 * 3. Favoris / cas à revoir (épinglables, listés dans « Mes progrès »)
 * 4. Annotations personnelles par cas (localStorage)
 * 5. Série (streak) journalière — compteur de cas par jour
 * 6. Recherche avancée — filtres partie/chapitre + germes & antibiotiques
 * 7. Coches dans le menu latéral + barres de progression sur l'accueil
 * 8. Page "Mes progrès"
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------ stockage */
  var LS = {
    progress: 'ccm_progress_v1',
    fav: 'ccm_fav_v1',
    notes: 'ccm_notes_v1',
    history: 'ccm_history_v1'
  };

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch (e) { return {}; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function todayStr() {
    var d = new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }
  function pageKey() {
    return location.pathname.replace(/\/(index\.html)?$/, '/') || '/';
  }
  function isCasePage() { return /\/cas-[\w.-]+\/?$/.test(pageKey()); }

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
  function loadAsset(name) {
    var depth = location.pathname.replace(/^\/+/, '').split('/').length - 1;
    var ups = '';
    for (var i = 0; i < depth; i++) ups += '../';
    var urls = [BASE + 'assets/' + name, '/assets/' + name, 'assets/' + name, ups + 'assets/' + name];
    var chain = Promise.reject();
    urls.forEach(function (u) {
      chain = chain.catch(function () { return fetchJson(u); });
    });
    return chain;
  }

  /* ------------------------------------------------------ 1. corrigé replié */
  function wrapCorrige() {
    var article = document.querySelector('.md-content__inner.md-typeset');
    if (!article || !isCasePage()) return;
    if (article.querySelector('details.corrige')) return;
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

  /* ------------------------------------------- utilitaires cas / favoris */
  function normRel(rel) { return '/' + rel.replace(/\.md$/, '/'); }
  function keyMatches(k, full) { return k.slice(-full.length) === full; }

  function isDone(key) { return !!read(LS.progress)[key]; }
  function isFav(key) { return !!read(LS.fav)[key]; }

  function toggleDone(key) {
    var s = read(LS.progress);
    var h = read(LS.history);
    var t = todayStr();
    if (s[key]) {
      delete s[key];
      if (h[t] > 1) { h[t]--; } else { delete h[t]; }
    } else {
      s[key] = Date.now();
      h[t] = (h[t] || 0) + 1;
    }
    write(LS.progress, s);
    write(LS.history, h);
  }
  function toggleFav(key) {
    var s = read(LS.fav);
    if (s[key]) { delete s[key]; } else { s[key] = Date.now(); }
    write(LS.fav, s);
  }

  /* -------------------------------------------------- 2. barre d'actions du cas */
  function addCaseToolbar() {
    var article = document.querySelector('.md-content__inner.md-typeset');
    if (!article || !isCasePage()) return;
    if (article.querySelector('.progress-actions')) return;
    var h1 = article.querySelector('h1');
    if (!h1) return;
    var key = pageKey();

    var wrap = document.createElement('div');
    wrap.className = 'progress-actions';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'progress-btn';

    var fav = document.createElement('button');
    fav.type = 'button';
    fav.className = 'fav-btn';
    fav.title = 'Épingler ce cas dans « Favoris / cas à revoir »';

    function render() {
      var done = isDone(key);
      var pinned = isFav(key);
      btn.classList.toggle('done', done);
      btn.innerHTML = done
        ? '<span class="pb-check">✔</span> Cas terminé — cliquer pour décocher'
        : '<span class="pb-circle"></span> Marquer ce cas comme terminé';
      fav.classList.toggle('active', pinned);
      fav.innerHTML = pinned
        ? '★ Épinglé — cas à revoir'
        : '☆ Épingler ce cas';
    }
    btn.addEventListener('click', function () {
      toggleDone(key);
      render();
      markNav();
      updateBars();
      renderStreakWidgets();
    });
    fav.addEventListener('click', function () {
      toggleFav(key);
      render();
      markNav();
    });

    wrap.appendChild(btn);
    wrap.appendChild(fav);
    h1.parentNode.insertBefore(wrap, h1.nextSibling);
    render();
  }

  /* -------------------------------------------------- 3. annotations personnelles */
  function addNotes() {
    var article = document.querySelector('.md-content__inner.md-typeset');
    if (!article || !isCasePage()) return;
    if (article.querySelector('.notes-box')) return;
    var key = pageKey();
    var notes = read(LS.notes);
    var saved = notes[key] ? notes[key].text || '' : '';

    var box = document.createElement('details');
    box.className = 'notes-box';
    if (saved) { box.open = true; }
    var summary = document.createElement('summary');
    summary.className = 'notes-summary';
    summary.innerHTML =
      '<span class="notes-icon">📝</span>' +
      '<span class="notes-label">Mes annotations</span>' +
      (saved ? '<span class="notes-count">notes enregistrées</span>' : '<span class="notes-count">aucune note</span>') +
      '<span class="notes-arrow">▾</span>';
    var body = document.createElement('div');
    body.className = 'notes-body';
    var ta = document.createElement('textarea');
    ta.className = 'notes-area';
    ta.placeholder = 'Écrivez ici vos remarques, points à retenir, pièges de ce cas… (enregistré automatiquement dans votre navigateur)';
    ta.value = saved;
    var status = document.createElement('span');
    status.className = 'notes-status';
    status.textContent = saved ? 'Enregistré ✓' : '';
    body.appendChild(ta);
    body.appendChild(status);
    box.appendChild(summary);
    box.appendChild(body);

    var timer = null;
    ta.addEventListener('input', function () {
      status.textContent = 'Enregistrement…';
      status.classList.remove('ok');
      clearTimeout(timer);
      timer = setTimeout(function () {
        var n = read(LS.notes);
        var txt = ta.value;
        if (txt.trim()) { n[key] = { text: txt, ts: Date.now() }; }
        else { delete n[key]; }
        write(LS.notes, n);
        status.textContent = txt.trim() ? 'Enregistré ✓' : '';
        status.classList.add('ok');
        summary.querySelector('.notes-count').textContent = txt.trim() ? 'notes enregistrées' : 'aucune note';
      }, 600);
    });

    var anchor = article.querySelector('.progress-actions');
    if (anchor) { anchor.parentNode.insertBefore(box, anchor.nextSibling); }
    else if (h1 = article.querySelector('h1')) { h1.parentNode.insertBefore(box, h1.nextSibling); }
  }

  /* -------------------------------------------------- 4. streak journalière */
  function streakStats() {
    var h = read(LS.history);
    var today = todayStr();
    // série actuelle : jours consécutifs jusqu'à aujourd'hui (ou hier si pas encore fait)
    var cur = 0;
    var d = new Date();
    if (!h[today]) { d.setDate(d.getDate() - 1); }
    for (;;) {
      var m = d.getMonth() + 1, day = d.getDate();
      var k = d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
      if (h[k]) { cur++; d.setDate(d.getDate() - 1); } else { break; }
    }
    // meilleure série
    var dates = Object.keys(h).filter(function (k) { return h[k] > 0; }).sort();
    var best = 0, run = 0, prev = null;
    dates.forEach(function (k) {
      if (prev) {
        var a = new Date(prev + 'T00:00:00');
        a.setDate(a.getDate() + 1);
        var mm = a.getMonth() + 1, dd = a.getDate();
        var nk = a.getFullYear() + '-' + (mm < 10 ? '0' + mm : mm) + '-' + (dd < 10 ? '0' + dd : dd);
        run = (nk === k) ? run + 1 : 1;
      } else { run = 1; }
      if (run > best) best = run;
      prev = k;
    });
    var totalCases = 0;
    Object.keys(h).forEach(function (k) { totalCases += h[k]; });
    return {
      current: cur,
      best: Math.max(best, cur),
      today: h[today] || 0,
      total: totalCases,
      history: h
    };
  }

  function renderStreakWidgets() {
    ['streak-app', 'streak-inline'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var st = streakStats();
      var today = todayStr();
      // mini-graphe : 14 derniers jours
      var bars = [];
      var max = 1;
      var days = [];
      for (var i = 13; i >= 0; i--) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        var m = d.getMonth() + 1, day = d.getDate();
        var k = d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
        var v = st.history[k] || 0;
        if (v > max) max = v;
        days.push({ k: k, v: v });
      }
      days.forEach(function (d) {
        var pct = d.v ? Math.round(d.v / max * 100) : 0;
        bars.push('<div class="sk-col' + (d.k === today ? ' is-today' : '') + '" title="' + d.k + ' : ' + d.v + ' cas">' +
          '<div class="sk-bar" style="height:' + (d.v ? Math.max(14, pct) : 6) + '%"></div></div>');
      });
      var flame = st.current >= 3 ? '🔥' : st.current >= 1 ? '🔥' : '💤';
      var msg = st.current >= 3 ? 'Série impressionnante, continuez !'
        : st.current === 1 ? 'C\'est parti — maintenez la série !'
        : st.today > 0 ? 'Premier cas du jour fait. Continuez !'
        : 'Faites un cas aujourd\'hui pour démarrer votre série.';
      el.innerHTML =
        '<div class="streak">' +
        '<div class="streak-flame">' + flame + '</div>' +
        '<div class="streak-main"><span class="streak-num">' + st.current + '</span>' +
        '<span class="streak-unit">jour' + (st.current > 1 ? 's' : '') + ' de série</span>' +
        '<span class="streak-msg">' + msg + '</span></div>' +
        '<div class="streak-stats">' +
        '<div class="st-stat"><span class="st-num">' + st.today + '</span><span class="st-label">cas aujourd\'hui</span></div>' +
        '<div class="st-stat"><span class="st-num">' + st.best + '</span><span class="st-label">meilleure série</span></div>' +
        '<div class="st-stat"><span class="st-num">' + st.total + '</span><span class="st-label">cas résolus</span></div>' +
        '</div>' +
        '<div class="streak-chart">' + bars.join('') + '</div>' +
        '</div>';
    });
  }

  /* -------------------------------------------------- 5. coches + étoiles du menu */
  function markNav() {
    var doneKeys = Object.keys(read(LS.progress));
    var favKeys = Object.keys(read(LS.fav));
    document.querySelectorAll('.md-sidebar--primary .md-nav__link').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      var abs;
      try { abs = new URL(href, location.href).pathname; } catch (e) { return; }
      abs = abs.replace(/\/(index\.html)?$/, '/');
      var chk = a.querySelector('.nav-check');
      var isDone = doneKeys.indexOf(abs) !== -1;
      var isFav = favKeys.indexOf(abs) !== -1;
      a.classList.toggle('nav-done', isDone);
      a.classList.toggle('nav-fav', isFav);
      if (isDone && !chk) {
        chk = document.createElement('span');
        chk.className = 'nav-check';
        chk.textContent = '✔';
        a.appendChild(chk);
      } else if (!isDone && chk) {
        chk.remove();
      }
      var star = a.querySelector('.nav-star');
      if (isFav && !star) {
        star = document.createElement('span');
        star.className = 'nav-star';
        star.textContent = '★';
        a.appendChild(star);
      } else if (!isFav && star) {
        star.remove();
      }
    });
  }

  function updateBars() {
    var s = read(LS.progress);
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

  /* -------------------------------------------------- 6. page « Mes progrès » */
  function caseLabel(rel) {
    var name = rel.replace(/^.*\//, '').replace(/\.md$/, '');
    var m = name.match(/^cas-(\d+)-(\d+)$/);
    if (m) return 'Cas ' + m[1] + '.' + parseInt(m[2], 10);
    return name;
  }

  function renderProgressPage() {
    var app = document.getElementById('progress-app');
    if (!app) return;
    if (app.dataset.ready === '1') return;

    loadAsset('cases.json')
      .then(build)
      .catch(function () {
        app.innerHTML = '<p class="progress-error">Impossible de charger la liste des cas.</p>';
      });

    function build(data) {
      var favStore = read(LS.fav);
      var totalCases = 0, doneCases = 0, favCount = 0;
      var meta = {};   // full key -> {rel, url}
      var html = [];

      // section favoris
      var favHtml = [];
      Object.keys(favStore).sort(function (a, b) { return favStore[a] - favStore[b]; }).forEach(function (k) {
        var rel = null;
        data.parts.forEach(function (p) {
          p.sections.forEach(function (sec) {
            sec.cases.forEach(function (c) {
              if (keyMatches(k, normRel(c))) rel = c;
            });
          });
        });
        if (!rel) return;
        favCount++;
        var url = BASE + rel.replace(/\.md$/, '') + '/';
        favHtml.push(
          '<li class="pp-fav">' +
          '<a href="' + url + '">⭐ ' + caseLabel(rel) + '</a>' +
          '<button type="button" class="pp-fav-remove" data-key="' + k + '" title="Retirer des favoris">✕</button>' +
          '</li>');
      });
      if (favHtml.length) {
        html.push(
          '<div class="pp-part pp-favs"><h2>⭐ Favoris &amp; cas à revoir</h2>' +
          '<p class="pp-hint">Cas difficiles épinglés depuis la page du cas (bouton ☆). À refaire avant l\'examen !</p>' +
          '<ul class="pp-list">' + favHtml.join('') + '</ul></div>');
      }

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
            var full = normRel(c);
            meta[full] = c;
            var done = keyMatches2(read(LS.progress), full);
            var isFav = keyMatches2(read(LS.fav), full);
            if (done) { doneCases++; pDone++; }
            var url = BASE + c.replace(/\.md$/, '') + '/';
            block.push(
              '<li class="pp-case' + (done ? ' is-done' : '') + (isFav ? ' is-fav' : '') + '" data-rel="' + c + '">' +
              '<a href="' + url + '">' + (isFav ? '⭐ ' : '') + caseLabel(c) + '</a>' +
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

      function keyMatches2(storeObj, full) {
        var keys = Object.keys(storeObj);
        for (var i = 0; i < keys.length; i++) {
          if (keys[i].slice(-full.length) === full) return true;
        }
        return false;
      }

      var gpct = totalCases ? Math.round(doneCases / totalCases * 100) : 0;
      var head =
        '<div class="pp-summary">' +
        '<div class="pp-ring" style="--p:' + gpct + '"><span>' + gpct + ' %</span></div>' +
        '<div class="pp-summary-text"><strong>' + doneCases + '</strong> / ' + totalCases +
        ' cas terminés. Continuez comme ça ! 💪</div>' +
        '<div id="streak-inline"></div>' +
        '<div class="pp-actions-row">' +
        '<button type="button" id="pp-reset" class="md-button md-button--primary">Réinitialiser ma progression</button>' +
        '</div>' +
        '</div>';

      app.innerHTML = head + html.join('');
      app.dataset.ready = '1';
      renderStreakWidgets();

      app.querySelectorAll('.pp-case').forEach(function (li) {
        li.addEventListener('click', function (ev) {
          if (ev.target.tagName === 'A') return;
          app.dataset.ready = '';
          var rel = li.getAttribute('data-rel');
          var full = normRel(rel);
          var st = read(LS.progress);
          var keys = Object.keys(st).filter(function (k) { return k.slice(-full.length) === full; });
          if (keys.length) {
            keys.forEach(function (k) { delete st[k]; });
            // décrémente le compteur du jour (approximation : jour courant)
            var h = read(LS.history);
            var t = todayStr();
            if (h[t] > 1) { h[t]--; } else { delete h[t]; }
            write(LS.history, h);
          } else {
            st[full] = Date.now();
            var h2 = read(LS.history);
            var t2 = todayStr();
            h2[t2] = (h2[t2] || 0) + 1;
            write(LS.history, h2);
          }
          write(LS.progress, st);
          renderProgressPage();
          markNav(); updateBars();
        });
      });

      app.querySelectorAll('.pp-fav-remove').forEach(function (b) {
        b.addEventListener('click', function (ev) {
          ev.stopPropagation();
          app.dataset.ready = '';
          var k = b.getAttribute('data-key');
          var f = read(LS.fav);
          delete f[k];
          write(LS.fav, f);
          renderProgressPage();
          markNav();
        });
      });

      var reset = document.getElementById('pp-reset');
      if (reset) reset.addEventListener('click', function () {
        if (!confirm('Effacer toute votre progression enregistrée ?')) return;
        write(LS.progress, {});
        write(LS.history, {});
        app.dataset.ready = '';
        renderProgressPage();
        markNav(); updateBars();
      });
    }
  }

  /* -------------------------------------------------- 7. recherche avancée */
  function renderSearchPage() {
    var app = document.getElementById('search-app');
    if (!app) return;
    if (app.querySelector('.sr-panel')) return;

    app.innerHTML =
      '<div class="sr-panel">' +
      '<div class="sr-inputrow">' +
      '<input type="search" id="sr-q" class="sr-input" placeholder="Rechercher un germe, un antibiotique, un symptôme…" autocomplete="off">' +
      '</div>' +
      '<div class="sr-filters">' +
      '<select id="sr-part" class="sr-select"><option value="">Toutes les parties</option></select>' +
      '<select id="sr-sec" class="sr-select"><option value="">Tous les chapitres</option></select>' +
      '<span id="sr-count" class="sr-count"></span>' +
      '</div>' +
      '<div class="sr-tags" id="sr-tags"></div>' +
      '<div class="sr-results" id="sr-results"></div>' +
      '</div>';

    var input = document.getElementById('sr-q');
    var partSel = document.getElementById('sr-part');
    var secSel = document.getElementById('sr-sec');
    var tagsBox = document.getElementById('sr-tags');
    var results = document.getElementById('sr-results');
    var countEl = document.getElementById('sr-count');

    loadAsset('search-index.json')
      .then(build)
      .catch(function () {
        app.innerHTML = '<p class="progress-error">Impossible de charger l\'index de recherche.</p>';
      });

    function norm(s) {
      return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
    function esc(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    var data = null;
    var activeTag = '';
    var secTitles = {};

    function build(d) {
      data = d;
      d.parts.forEach(function (p) {
        var o = document.createElement('option');
        o.value = p.slug;
        o.textContent = p.icon + ' ' + p.title;
        partSel.appendChild(o);
      });
      d.cases.forEach(function (c) { secTitles[c.s] = c.s; });
      // chips de tags (top 44)
      var chips = d.tags.slice(0, 44).map(function (t) {
        return '<button type="button" class="sr-chip" data-tag="' + esc(t.n) + '" title="' + t.c + ' cas">' +
          esc(t.n) + ' <span class="sr-chip-c">' + t.c + '</span></button>';
      });
      tagsBox.innerHTML = chips.join('');
      tagsBox.querySelectorAll('.sr-chip').forEach(function (ch) {
        ch.addEventListener('click', function () {
          if (activeTag === ch.getAttribute('data-tag')) {
            activeTag = '';
            ch.classList.remove('active');
          } else {
            activeTag = ch.getAttribute('data-tag');
            tagsBox.querySelectorAll('.sr-chip').forEach(function (x) { x.classList.remove('active'); });
            ch.classList.add('active');
          }
          run();
        });
      });

      var t = null;
      input.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(run, 180);
      });
      partSel.addEventListener('change', function () { fillSecs(); run(); });
      secSel.addEventListener('change', run);

      fillSecs();
      run();
    }

    function fillSecs() {
      secSel.innerHTML = '<option value="">Tous les chapitres</option>';
      if (!data) return;
      var pslug = partSel.value;
      var seen = {};
      data.cases.forEach(function (c) {
        if (pslug && c.p !== pslug) return;
        if (seen[c.s]) return;
        seen[c.s] = 1;
        var o = document.createElement('option');
        o.value = c.s;
        o.textContent = c.s;
        secSel.appendChild(o);
      });
    }

    function snippet(c, terms) {
      var hay = norm(c.t);
      var pos = -1;
      for (var i = 0; i < terms.length && pos < 0; i++) {
        pos = hay.indexOf(terms[i]);
      }
      var start = Math.max(0, pos - 90);
      var frag = c.t.substr(start, 220);
      var out = esc(frag);
      terms.forEach(function (term) {
        try {
          var rx = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
          out = out.replace(rx, '<mark>$1</mark>');
        } catch (e) {}
      });
      return (start > 0 ? '… ' : '') + out + ' …';
    }

    function run() {
      if (!data) return;
      var q = norm(input.value.trim());
      var terms = q.split(/\s+/).filter(Boolean);
      var part = partSel.value;
      var sec = secSel.value;
      var n = 0;
      var out = [];
      var MAX = 60;
      for (var i = 0; i < data.cases.length; i++) {
        var c = data.cases[i];
        if (part && c.p !== part) continue;
        if (sec && c.s !== sec) continue;
        if (activeTag && c.g.indexOf(activeTag) === -1) continue;
        if (terms.length) {
          var hay = norm(c.t) + ' ' + norm(c.l) + ' ' + norm(c.g.join(' '));
          var ok = true;
          for (var j = 0; j < terms.length; j++) {
            if (hay.indexOf(terms[j]) === -1) { ok = false; break; }
          }
          if (!ok) continue;
        }
        n++;
        if (out.length < MAX) {
          var pt = data.parts.filter(function (p) { return p.slug === c.p; })[0] || { icon: '', title: '' };
          var done = false;
          var st = read(LS.progress);
          var full = normRel(c.f);
          Object.keys(st).forEach(function (k) { if (k.slice(-full.length) === full) done = true; });
          out.push(
            '<a class="sr-item' + (done ? ' is-done' : '') + '" href="' + BASE + c.f.replace(/\.md$/, '') + '/">' +
            '<span class="sr-item-label">' + esc(c.l) + (done ? ' <span class="sr-done">✔</span>' : '') + '</span>' +
            '<span class="sr-item-meta">' + pt.icon + ' ' + esc(pt.title) + ' · ' + esc(c.s) + '</span>' +
            (terms.length ? '<span class="sr-item-snippet">' + snippet(c, terms) + '</span>' : '') +
            (c.g.length ? '<span class="sr-item-tags">' + c.g.slice(0, 5).map(function (g) { return '<span class="sr-mini">' + esc(g) + '</span>'; }).join('') + '</span>' : '') +
            '</a>');
        }
      }
      countEl.textContent = n + ' cas trouvé' + (n > 1 ? 's' : '');
      if (!terms.length && !part && !sec && !activeTag) {
        results.innerHTML = '';
        countEl.textContent = data.cases.length + ' cas dans l\'index';
        return;
      }
      results.innerHTML = n
        ? out.join('')
        : '<p class="sr-empty">Aucun cas ne correspond. Essayez un autre mot-clé ou retirez un filtre.</p>';
    }
  }

  /* -------------------------------------------------- démarrage */
  wrapCorrige();
  addCaseToolbar();
  addNotes();
  markNav();
  updateBars();
  renderStreakWidgets();
  renderProgressPage();
  renderSearchPage();

  // MkDocs Material instant loading : re-exécute au changement de page
  if (window.document$) {
    document$.subscribe(function () {
      wrapCorrige();
      addCaseToolbar();
      addNotes();
      markNav();
      updateBars();
      renderStreakWidgets();
      renderProgressPage();
      renderSearchPage();
    });
  }
})();
