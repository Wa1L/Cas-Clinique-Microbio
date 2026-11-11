/* Cas Cliniques de Microbiologie — Dr Wail NAMOUNE
 * Interactions :
 *  1. Corrigé masqué derrière un bouton (détails repliables)
 *  2. Suivi de progression par cas (localStorage)
 *  3. Favoris / cas à revoir (épinglables, listés dans « Mes progrès »)
 *  4. Annotations personnelles par cas (localStorage)
 *  5. Série (streak) journalière
 *  6. Recherche avancée — filtres partie/chapitre + germes & antibiotiques
 *  7. Statistiques par chapitre — radar + points faibles
 *  8. Impression PDF propre — cas sélectionnés ou chapitres entiers
 *  9. Coches/étoiles du menu latéral + barres de progression de l'accueil
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

  function normRel(rel) { return '/' + rel.replace(/\.md$/, '/'); }
  function keyMatches(storeObj, full) {
    var keys = Object.keys(storeObj);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].slice(-full.length) === full) return true;
    }
    return false;
  }
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

  /* ------------------------------------------- décoration des titres de cas */
  var H3_ICONS = [
    [/^contexte clinique/i, '🔍'],
    [/^r[ée]sultats?/i, '📊'],
    [/^questions?\b/i, '❓'],
    [/^compl[ée]ments/i, '📚'],
    [/^exercice/i, '✍️'],
    [/^traitement/i, '💊'],
    [/^diagnostic/i, '🩺']
  ];
  function decorateCase() {
    var article = document.querySelector('.md-content__inner.md-typeset');
    if (!article || !isCasePage()) return;
    article.querySelectorAll('h3').forEach(function (h3) {
      if (h3.classList.contains('case-h3')) return;
      var txt = (h3.textContent || '').trim();
      for (var i = 0; i < H3_ICONS.length; i++) {
        if (H3_ICONS[i][0].test(txt)) {
          h3.classList.add('case-h3');
          h3.setAttribute('data-icon', H3_ICONS[i][1]);
          break;
        }
      }
    });
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

    var pr = document.createElement('button');
    pr.type = 'button';
    pr.className = 'print-btn';
    pr.innerHTML = '🖨 Imprimer ce cas';
    pr.title = 'Version PDF propre (questions + corrigé, sans menus)';
    pr.addEventListener('click', function () { window.print(); });

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
    wrap.appendChild(pr);
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
    var cur = 0;
    var d = new Date();
    if (!h[today]) { d.setDate(d.getDate() - 1); }
    for (;;) {
      var m = d.getMonth() + 1, day = d.getDate();
      var k = d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
      if (h[k]) { cur++; d.setDate(d.getDate() - 1); } else { break; }
    }
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
    return { current: cur, best: Math.max(best, cur), today: h[today] || 0, total: totalCases, history: h };
  }

  function renderStreakWidgets() {
    ['streak-app', 'streak-inline'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var st = streakStats();
      var today = todayStr();
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
      var flame = st.current >= 1 ? '🔥' : '💤';
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
      var isDoneLink = doneKeys.indexOf(abs) !== -1;
      var isFavLink = favKeys.indexOf(abs) !== -1;
      a.classList.toggle('nav-done', isDoneLink);
      a.classList.toggle('nav-fav', isFavLink);
      if (isDoneLink && !chk) {
        chk = document.createElement('span');
        chk.className = 'nav-check';
        chk.textContent = '✔';
        a.appendChild(chk);
      } else if (!isDoneLink && chk) {
        chk.remove();
      }
      var star = a.querySelector('.nav-star');
      if (isFavLink && !star) {
        star = document.createElement('span');
        star.className = 'nav-star';
        star.textContent = '★';
        a.appendChild(star);
      } else if (!isFavLink && star) {
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

  /* -------- radar SVG (SVG pur, sans bibliothèque) -------- */
  function radarSVG(size, labels, values) {
    var cx = size / 2, cy = size / 2 + 8;
    var R = size / 2 - 40;
    var n = labels.length;
    function pt(i, r) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    }
    var out = '';
    for (var g = 1; g <= 4; g++) {
      var pts = [];
      for (var i = 0; i < n; i++) { var p = pt(i, R * g / 4); pts.push(p[0].toFixed(1) + ',' + p[1].toFixed(1)); }
      out += '<polygon points="' + pts.join(' ') + '" class="radar-ring"/>';
    }
    for (var i = 0; i < n; i++) {
      var p2 = pt(i, R);
      out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '" class="radar-axis"/>';
    }
    var vpts = [];
    for (var i = 0; i < n; i++) {
      var v = Math.max(3, values[i]);
      var p3 = pt(i, R * v / 100);
      vpts.push(p3[0].toFixed(1) + ',' + p3[1].toFixed(1));
    }
    out += '<polygon points="' + vpts.join(' ') + '" class="radar-area"/>';
    for (var i = 0; i < n; i++) {
      var p4 = pt(i, R + 14);
      var anchor = Math.abs(p4[0] - cx) < 12 ? 'middle' : (p4[0] > cx ? 'start' : 'end');
      var dy = p4[1] < cy ? -2 : (p4[1] > cy + 6 ? 8 : 3);
      out += '<text x="' + p4[0].toFixed(1) + '" y="' + (p4[1] + dy).toFixed(1) + '" text-anchor="' + anchor + '" class="radar-label" title="' +
        labels[i].replace(/"/g, '') + '">' + labels[i] + '</text>';
    }
    return '<svg class="radar" viewBox="-72 -14 ' + (size + 144) + ' ' + (size + 36) + '">' + out + '</svg>';
  }

  function shortLabel(s, max) {
    s = s.replace(/\s+/g, ' ').trim();
    // évite 10 fois le même préfixe sur un radar
    s = s.replace(/^(Infections?|Cas cliniques?)\s+/i, '');
    if (s.length <= max) return s;
    var cut = s.slice(0, max - 1);
    var sp = cut.lastIndexOf(' ');
    if (sp > 4) { cut = cut.slice(0, sp); }
    return cut + '…';
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
      var progStore = read(LS.progress);
      var totalCases = 0, doneCases = 0, favCount = 0;
      var html = [];

      /* ---------- section favoris ---------- */
      var favHtml = [];
      Object.keys(favStore).sort(function (a, b) { return favStore[a] - favStore[b]; }).forEach(function (k) {
        var rel = null;
        data.parts.forEach(function (p) {
          p.sections.forEach(function (sec) {
            sec.cases.forEach(function (c) {
              if (k.slice(-normRel(c).length) === normRel(c)) rel = c;
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

      /* ---------- données par chapitre (pour les stats) ---------- */
      var chapStats = [];  // {part, partTitle, icon, title, done, total, fav}
      data.parts.forEach(function (p) {
        p.sections.forEach(function (sec) {
          var done = 0, fav = 0;
          sec.cases.forEach(function (c) {
            totalCases++;
            var full = normRel(c);
            if (keyMatches(progStore, full)) { done++; doneCases++; }
            if (keyMatches(favStore, full)) { fav++; }
          });
          chapStats.push({ pslug: p.slug, ptitle: p.title, icon: p.icon, title: sec.title, done: done, total: sec.cases.length, fav: fav });
        });
      });

      /* ---------- liste des cas par partie ---------- */
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
            var full = normRel(c);
            var done = keyMatches(progStore, full);
            var isFavC = keyMatches(favStore, full);
            var url = BASE + c.replace(/\.md$/, '') + '/';
            block.push(
              '<li class="pp-case' + (done ? ' is-done' : '') + (isFavC ? ' is-fav' : '') + '" data-rel="' + c + '">' +
              '<a href="' + url + '">' + (isFavC ? '⭐ ' : '') + caseLabel(c) + '</a>' +
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
        '<div id="streak-inline"></div>' +
        '<div class="pp-actions-row">' +
        '<button type="button" id="pp-reset" class="md-button md-button--primary">Réinitialiser ma progression</button>' +
        '</div>' +
        '</div>';

      /* ---------- statistiques par chapitre ---------- */
      var stats = [];
      stats.push('<div class="pp-part pp-stats"><h2>📉 Statistiques par chapitre</h2>');

      // radars : une figure par partie ayant >= 3 chapitres
      var radarBlocks = [];
      data.parts.forEach(function (p) {
        var chaps = chapStats.filter(function (c) { return c.pslug === p.slug; });
        if (chaps.length < 3) return;
        var labels = chaps.map(function (c) { return shortLabel(c.title, 16); });
        var values = chaps.map(function (c) { return c.total ? Math.round(c.done / c.total * 100) : 0; });
        var size = 340;
        radarBlocks.push(
          '<figure class="radar-fig"><div class="radar-wrap">' +
          radarSVG(size, labels, values) +
          '</div><figcaption>' + p.icon + ' ' + p.title.replace(/^.*·\s*/, '') +
          ' — pourcentage de cas terminés par chapitre</figcaption></figure>');
      });
      if (radarBlocks.length) {
        stats.push('<div class="radar-grid">' + radarBlocks.join('') + '</div>');
      }

      // points faibles : chapitres triés par taux de complétion
      var weak = chapStats.slice().sort(function (a, b) {
        var pa = a.total ? a.done / a.total : 0;
        var pb = b.total ? b.done / b.total : 0;
        if (pa !== pb) return pa - pb;
        return b.fav - a.fav;
      });
      stats.push('<h3>Vos points faibles — chapitres à retravailler en priorité</h3>');
      stats.push('<div class="weak-list">');
      weak.forEach(function (c) {
        var pct = c.total ? Math.round(c.done / c.total * 100) : 0;
        var cls = pct < 33 ? 'weak-danger' : (pct < 66 ? 'weak-warn' : 'weak-ok');
        stats.push(
          '<div class="weak-row ' + cls + '">' +
          '<span class="weak-name">' + c.icon + ' ' + c.title + '</span>' +
          '<span class="weak-meta">' + (c.fav ? '⭐ ' + c.fav : '') + '</span>' +
          '<span class="weak-bar"><span class="weak-fill" style="width:' + pct + '%"></span></span>' +
          '<span class="weak-pct">' + c.done + '/' + c.total + ' · ' + pct + ' %</span>' +
          '</div>');
      });
      stats.push('</div>');
      stats.push('<p class="pp-hint">Vert = bien maîtrisé · Orange = en cours · Rouge = à travailler. ⭐ = nombre de cas épinglés « à revoir ».</p>');
      stats.push('</div>');
      html.unshift(stats.join(''));

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
      '<input type="search" id="sr-q" class="sr-input" placeholder="Rechercher un germe, un antibiotique, un symptôme… (ex : BLSE, e.coli, hépatite)" autocomplete="off">' +
      '</div>' +
      '<div class="sr-filters">' +
      '<select id="sr-part" class="sr-select"><option value="">Toutes les parties</option></select>' +
      '<select id="sr-sec" class="sr-select"><option value="">Tous les chapitres</option></select>' +
      '<button type="button" id="sr-clear" class="sr-clear">✕ Réinitialiser</button>' +
      '<span id="sr-count" class="sr-count"></span>' +
      '</div>' +
      '<div class="sr-tags" id="sr-tags"></div>' +
      '<div class="sr-results" id="sr-results"></div>' +
      '</div>';

    var input = document.getElementById('sr-q');
    var partSel = document.getElementById('sr-part');
    var secSel = document.getElementById('sr-sec');
    var clearBtn = document.getElementById('sr-clear');
    var tagsBox = document.getElementById('sr-tags');
    var results = document.getElementById('sr-results');
    var countEl = document.getElementById('sr-count');

    loadAsset('search-index.json')
      .then(build)
      .catch(function () {
        app.innerHTML = '<p class="progress-error">Impossible de charger l\'index de recherche.</p>';
      });

    function norm(s) {
      // minuscules, sans accents, ET sans points — « e.coli » trouve « E. coli »
      return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[.']/g, ' ').replace(/\s+/g, ' ');
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
        p.sections.forEach(function (s) { secTitles[s.slug] = s.title; });
      });
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
      clearBtn.addEventListener('click', function () {
        input.value = '';
        partSel.value = '';
        activeTag = '';
        tagsBox.querySelectorAll('.sr-chip').forEach(function (x) { x.classList.remove('active'); });
        fillSecs();
        run();
        input.focus();
      });

      fillSecs();
      run();
    }

    function fillSecs() {
      secSel.innerHTML = '<option value="">Tous les chapitres</option>';
      if (!data) return;
      var pslug = partSel.value;
      data.parts.forEach(function (p) {
        if (pslug && p.slug !== pslug) return;
        p.sections.forEach(function (s) {
          var o = document.createElement('option');
          o.value = s.slug;
          o.textContent = s.title;
          secSel.appendChild(o);
        });
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
          var pt = null;
          for (var k = 0; k < data.parts.length; k++) { if (data.parts[k].slug === c.p) { pt = data.parts[k]; break; } }
          pt = pt || { icon: '', title: '' };
          var done = keyMatches(read(LS.progress), normRel(c.f));
          var favC = keyMatches(read(LS.fav), normRel(c.f));
          out.push(
            '<a class="sr-item' + (done ? ' is-done' : '') + (favC ? ' is-fav' : '') + '" href="' + BASE + c.f.replace(/\.md$/, '') + '/">' +
            '<span class="sr-item-label">' + (favC ? '⭐ ' : '') + esc(c.l) + (done ? ' <span class="sr-done">✔</span>' : '') + '</span>' +
            '<span class="sr-item-meta">' + pt.icon + ' ' + esc(pt.title) + ' · ' + esc(secTitles[c.s] || c.s) + '</span>' +
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

  /* -------------------------------------------------- 8. centre d'impression */
  function renderPrintPage() {
    var app = document.getElementById('print-app');
    if (!app) return;
    if (app.querySelector('.pr-config')) return;

    // cache le titre et le texte d'intro de la page à l'impression
    var article = document.querySelector('.md-content__inner.md-typeset');
    if (article) {
      Array.prototype.slice.call(article.children).forEach(function (el) {
        if (el !== app) { el.classList.add('print-hidden'); }
      });
    }

    app.innerHTML =
      '<div class="pr-config">' +
      '<p class="pp-hint">Sélectionnez une partie puis un chapitre (ou « Tous les chapitres »), cochez les cas souhaités, ' +
      'vérifiez l\'aperçu puis imprimez ou enregistrez en PDF (<em>Destination → Enregistrer au format PDF</em> dans la fenêtre d\'impression).</p>' +
      '<div class="sr-filters">' +
      '<select id="pr-part" class="sr-select"><option value="">Choisir une partie…</option></select>' +
      '<select id="pr-sec" class="sr-select" disabled><option value="">Tous les chapitres</option></select>' +
      '<button type="button" id="pr-all" class="md-button">Tout cocher</button>' +
      '<button type="button" id="pr-none" class="md-button">Tout décocher</button>' +
      '</div>' +
      '<div class="pr-cases" id="pr-cases"></div>' +
      '<div class="pr-actions">' +
      '<button type="button" id="pr-load" class="md-button md-button--primary">👁 Charger l\'aperçu</button>' +
      '<button type="button" id="pr-print" class="pr-print-main" disabled>🖨 Imprimer / PDF</button>' +
      '<span id="pr-status" class="pr-status"></span>' +
      '</div>' +
      '</div>' +
      '<div id="print-doc" class="print-doc"></div>';

    var partSel = document.getElementById('pr-part');
    var secSel = document.getElementById('pr-sec');
    var casesBox = document.getElementById('pr-cases');
    var loadBtn = document.getElementById('pr-load');
    var printBtn = document.getElementById('pr-print');
    var statusEl = document.getElementById('pr-status');

    loadAsset('cases.json')
      .then(build)
      .catch(function () {
        app.innerHTML = '<p class="progress-error">Impossible de charger la liste des cas.</p>';
      });

    function build(data) {
      app.dataset.ready = '1';
      data.parts.forEach(function (p) {
        var o = document.createElement('option');
        o.value = p.slug;
        o.textContent = p.icon + ' ' + p.title + ' (' + p.sections.reduce(function (n, s) { return n + s.cases.length; }, 0) + ' cas)';
        partSel.appendChild(o);
      });
      partSel.addEventListener('change', function () {
        secSel.innerHTML = '<option value="">Tous les chapitres</option>';
        secSel.disabled = !partSel.value;
        if (partSel.value) {
          data.parts.forEach(function (p) {
            if (p.slug !== partSel.value) return;
            p.sections.forEach(function (s) {
              var o = document.createElement('option');
              o.value = s.slug;
              o.textContent = s.title + ' (' + s.cases.length + ' cas)';
              secSel.appendChild(o);
            });
          });
        }
        fillCases(data);
      });
      secSel.addEventListener('change', function () { fillCases(data); });

      function fillCases(data) {
        var pslug = partSel.value, sslug = secSel.value;
        if (!pslug) { casesBox.innerHTML = '<p class="pp-hint">Choisissez d\'abord une partie.</p>'; return; }
        var items = [];
        data.parts.forEach(function (p) {
          if (p.slug !== pslug) return;
          p.sections.forEach(function (sec) {
            if (sslug && sec.slug !== sslug) return;
            sec.cases.forEach(function (c) { items.push({ rel: c, sec: sec.title }); });
          });
        });
        casesBox.innerHTML = items.map(function (it) {
          var url = BASE + it.rel.replace(/\.md$/, '') + '/';
          return '<label class="pr-case"><input type="checkbox" value="' + it.rel + '"> ' +
            '<a href="' + url + '" target="_blank">' + caseLabel(it.rel) + '</a>' +
            '<span class="pr-secname">' + it.sec + '</span></label>';
        }).join('') +
          '<p class="pp-hint">' + items.length + ' cas disponibles dans cette sélection.</p>';
      }

      function checkedRels() {
        return Array.prototype.slice.call(casesBox.querySelectorAll('input[type=checkbox]:checked')).map(function (cb) { return cb.value; });
      }

      document.getElementById('pr-all').addEventListener('click', function () {
        casesBox.querySelectorAll('input[type=checkbox]').forEach(function (cb) { cb.checked = true; });
      });
      document.getElementById('pr-none').addEventListener('click', function () {
        casesBox.querySelectorAll('input[type=checkbox]').forEach(function (cb) { cb.checked = false; });
      });

      loadBtn.addEventListener('click', function () {
        var rels = checkedRels();
        if (!rels.length) { statusEl.textContent = '⚠️ Cochez au moins un cas.'; return; }
        printBtn.disabled = true;
        statusEl.textContent = 'Chargement des cas… (0/' + rels.length + ')';
        var doc = document.getElementById('print-doc');
        doc.innerHTML = '';
        var doneCount = 0;
        var frag = document.createDocumentFragment();
        rels.forEach(function (rel) {
          var url = BASE + rel.replace(/\.md$/, '') + '/';
          fetch(url)
            .then(function (r) { return r.text(); })
            .then(function (txt) {
              var dp = new DOMParser().parseFromString(txt, 'text/html');
              var art = dp.querySelector('.md-content__inner.md-typeset');
              var wrapEl = document.createElement('div');
              wrapEl.className = 'print-case';
              if (art) {
                var clone = art.cloneNode(true);
                ['.progress-actions', '.notes-box'].forEach(function (sel) {
                  clone.querySelectorAll(sel).forEach(function (x) { x.remove(); });
                });
                clone.querySelectorAll('details.corrige').forEach(function (d) { d.open = true; });
                clone.querySelectorAll('a').forEach(function (a) {
                  var span = document.createElement('span');
                  span.innerHTML = a.innerHTML;
                  a.parentNode.replaceChild(span, a);
                });
                while (clone.firstChild) { wrapEl.appendChild(clone.firstChild); }
              } else {
                wrapEl.textContent = '(cas indisponible : ' + rel + ')';
              }
              frag.appendChild(wrapEl);
            })
            .catch(function () { })
            .then(function () {
              doneCount++;
              statusEl.textContent = 'Chargement des cas… (' + doneCount + '/' + rels.length + ')';
              if (doneCount === rels.length) {
                doc.innerHTML = '';
                doc.appendChild(frag);
                printBtn.disabled = false;
                statusEl.textContent = '✅ Aperçu prêt : ' + rels.length + ' cas. Utilisez « 🖨 Imprimer / PDF » ou Ctrl+P.';
                doc.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            });
        });
      });

      printBtn.addEventListener('click', function () {
        if (!document.getElementById('print-doc').children.length) {
          statusEl.textContent = '⚠️ Chargez d\'abord l\'aperçu.';
          return;
        }
        window.print();
      });
    }
  }

  /* -------------------------------------------------- démarrage */
  function init() {
    wrapCorrige();
    decorateCase();
    addCaseToolbar();
    addNotes();
    markNav();
    updateBars();
    renderStreakWidgets();
    renderProgressPage();
    renderSearchPage();
    renderPrintPage();
  }
  init();

  // MkDocs Material instant loading : ré-exécute au changement de page
  if (window.document$) {
    document$.subscribe(init);
  }
})();
