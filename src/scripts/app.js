/* Cas Cliniques de Microbiologie — Dr Wail NAMOUNE
 * Astro v2 — interactions :
 *  1. Corrigé masqué derrière un bouton repliable
 *  2. Suivi de progression par cas (localStorage)
 *  3. Favoris / cas à revoir (épinglables)
 *  4. Annotations personnelles par cas
 *  5. Série (streak) journalière
 *  6. Recherche avancée (texte intégral, filtres, tags)
 *  7. Statistiques par chapitre — radar + points faibles
 *  8. Impression PDF propre — cas sélectionnés ou chapitres entiers
 *  9. Thème clair/sombre, menu latéral mobile, coches de progression
 */
(function () {
  'use strict';

  var BASE = (function () {
    var m = location.pathname.match(/^(.*\/Cas-Clinique-Microbio\/)/);
    return m ? m[1] : '/';
  })();

  /* ------------------------------------------------------------ stockage */
  var LS = { progress: 'ccm_progress_v1', fav: 'ccm_fav_v1', notes: 'ccm_notes_v1', history: 'ccm_history_v1' };
  function read(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function pageKey() { return location.pathname.replace(/\/(index\.html)?$/, '/') || '/'; }
  function isCasePage() { return /\/cas-[\w.-]+\/?$/.test(pageKey()); }

  function fetchJson(url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  function loadAsset(name) { return fetchJson(BASE + 'data/' + name); }

  function isDone(key) { return !!read(LS.progress)[key]; }
  function isFav(key) { return !!read(LS.fav)[key]; }
  function toggleDone(key) {
    var s = read(LS.progress), h = read(LS.history), t = todayStr();
    if (s[key]) { delete s[key]; if (h[t] > 1) { h[t]--; } else { delete h[t]; } }
    else { s[key] = Date.now(); h[t] = (h[t] || 0) + 1; }
    write(LS.progress, s); write(LS.history, h);
  }
  function toggleFav(key) {
    var s = read(LS.fav);
    if (s[key]) { delete s[key]; } else { s[key] = Date.now(); }
    write(LS.fav, s);
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  function normRel(rel) { return BASE + rel.replace(/\.md$/, '') + '/'; }

  /* ------------------------------------------------------------ thème */
  function initTheme() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    function render() {
      var t = document.documentElement.dataset.theme || 'light';
      btn.textContent = t === 'dark' ? '☀️' : '🌙';
    }
    btn.addEventListener('click', function () {
      var t = (document.documentElement.dataset.theme === 'dark') ? 'light' : 'dark';
      document.documentElement.dataset.theme = t;
      try { localStorage.setItem('ccm_theme', t); } catch (e) {}
      render();
    });
    render();
  }

  /* ------------------------------------------------------------ menu mobile */
  function initMobile() {
    var sb = document.getElementById('sidebar'), ov = document.getElementById('overlay'), bg = document.getElementById('burger');
    if (!sb || !bg) return;
    function close() { sb.classList.remove('open'); ov && ov.classList.remove('show'); }
    bg.addEventListener('click', function () { sb.classList.toggle('open'); ov && ov.classList.toggle('show'); });
    ov && ov.addEventListener('click', close);
    sb.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  }

  /* ------------------------------------------------------------ 1. corrigé replié */
  var H3_ICONS = [
    [/^contexte clinique/i, '🔍'], [/^r[ée]sultats?/i, '📊'], [/^questions?\b/i, '❓'],
    [/^compl[ée]ments/i, '📚'], [/^exercice/i, '✍️'], [/^traitement/i, '💊'], [/^diagnostic/i, '🩺']
  ];
  function setupCase() {
    var article = document.querySelector('.case-content');
    if (!article || !isCasePage()) return;
    // icônes de titres
    article.querySelectorAll('h3').forEach(function (h3) {
      var txt = (h3.textContent || '').trim();
      for (var i = 0; i < H3_ICONS.length; i++) {
        if (H3_ICONS[i][0].test(txt)) { h3.classList.add('case-h3'); h3.setAttribute('data-icon', H3_ICONS[i][1]); break; }
      }
    });
    // corrigé -> details
    if (!article.querySelector('details.corrige')) {
      var kids = Array.prototype.slice.call(article.children);
      var idx = -1;
      for (var i = 0; i < kids.length; i++) {
        if (/^H[2-4]$/.test(kids[i].tagName) && /corrig/i.test(kids[i].textContent || '')) { idx = i; break; }
      }
      if (idx !== -1) {
        var details = document.createElement('details');
        details.className = 'corrige';
        var summary = document.createElement('summary');
        summary.className = 'corrige-summary';
        summary.innerHTML = '<span class="corrige-icon">📖</span>' +
          '<span class="corrige-label">Corrigé</span>' +
          '<span class="corrige-hint">Cliquer pour afficher / masquer</span>' +
          '<span class="corrige-arrow">▾</span>';
        var body = document.createElement('div');
        body.className = 'corrige-body corrige-reveal';
        details.appendChild(summary);
        details.appendChild(body);
        var moved = kids.slice(idx);
        moved[0].parentNode.insertBefore(details, moved[0]);
        moved.forEach(function (el) { body.appendChild(el); });
        details.addEventListener('toggle', function () {
          body.classList.toggle('corrige-reveal', details.open);
        });
      }
    }
  }

  /* ------------------------------------------------------------ 2. barre d'actions du cas + notes */
  function addCaseToolbar() {
    var wrapAnchor = document.getElementById('case-actions');
    if (!wrapAnchor || wrapAnchor.dataset.ready === '1') return;
    wrapAnchor.dataset.ready = '1';
    var key = pageKey();

    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'btn';
    var fav = document.createElement('button');
    fav.type = 'button'; fav.className = 'btn'; fav.title = 'Épingler ce cas dans « Favoris / cas à revoir »';
    var pr = document.createElement('button');
    pr.type = 'button'; pr.className = 'btn'; pr.title = 'Version PDF propre (questions + corrigé, sans menus)';
    pr.innerHTML = '🖨️ Imprimer ce cas';
    pr.addEventListener('click', function () { window.print(); });

    function render() {
      var done = isDone(key), pinned = isFav(key);
      btn.classList.toggle('done-state', done);
      btn.innerHTML = done
        ? '✔ Cas terminé — décocher'
        : '<span style="font-size:15px">○</span> Marquer ce cas comme terminé';
      fav.classList.toggle('fav-active', pinned);
      fav.innerHTML = pinned ? '★ Épinglé — cas à revoir' : '☆ Épingler ce cas';
    }
    btn.addEventListener('click', function () { toggleDone(key); render(); refreshProgress(); });
    fav.addEventListener('click', function () { toggleFav(key); render(); refreshProgress(); toast(isFav(key) ? '★ Ajouté aux favoris' : 'Retiré des favoris'); });

    wrapAnchor.appendChild(btn);
    wrapAnchor.appendChild(fav);
    wrapAnchor.appendChild(pr);
    render();

    // bandeau visible uniquement à l'impression d'un cas seul
    var article = wrapAnchor.closest('.case-wrap') || document;
    if (!article.querySelector('.print-casehead')) {
      var head = document.createElement('div');
      head.className = 'print-casehead';
      head.innerHTML = '<span>Les Cas Cliniques de Microbiologie — Résidanat en Algérie</span>' +
        '<span>Dr. Wail NAMOUNE</span>';
      var h1 = document.querySelector('.case-h1');
      if (h1) h1.parentNode.insertBefore(head, h1);
    }

    // annotations
    var notes = read(LS.notes);
    var saved = notes[key] ? notes[key].text || '' : '';
    var box = document.createElement('details');
    box.className = 'notes-box';
    if (saved) box.open = true;
    var summary = document.createElement('summary');
    summary.className = 'notes-summary';
    summary.innerHTML = '<span>📝</span><span>Mes annotations</span>' +
      '<span class="notes-count">' + (saved ? 'notes enregistrées' : 'aucune note') + '</span>';
    var body = document.createElement('div');
    body.className = 'notes-body';
    var ta = document.createElement('textarea');
    ta.className = 'notes-area';
    ta.placeholder = 'Écrivez ici vos remarques, points à retenir, pièges de ce cas… (enregistré automatiquement dans votre navigateur)';
    ta.value = saved;
    var status = document.createElement('span');
    status.className = 'notes-status';
    status.textContent = saved ? 'Enregistré ✓' : '';
    body.appendChild(ta); body.appendChild(status);
    box.appendChild(summary); box.appendChild(body);
    wrapAnchor.parentNode.insertBefore(box, wrapAnchor.nextSibling);

    var timer = null;
    ta.addEventListener('input', function () {
      status.textContent = 'Enregistrement…';
      clearTimeout(timer);
      timer = setTimeout(function () {
        var n = read(LS.notes), txt = ta.value;
        if (txt.trim()) { n[key] = { text: txt, ts: Date.now() }; } else { delete n[key]; }
        write(LS.notes, n);
        status.textContent = txt.trim() ? 'Enregistré ✓' : '';
        summary.querySelector('.notes-count').textContent = txt.trim() ? 'notes enregistrées' : 'aucune note';
      }, 600);
    });
  }

  /* ------------------------------------------------------------ 5. streak */
  function streakStats() {
    var h = read(LS.history), today = todayStr(), cur = 0, d = new Date();
    if (!h[today]) d.setDate(d.getDate() - 1);
    for (;;) {
      var k = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      if (h[k]) { cur++; d.setDate(d.getDate() - 1); } else { break; }
    }
    var dates = Object.keys(h).filter(function (k) { return h[k] > 0; }).sort();
    var best = 0, run = 0, prev = null;
    dates.forEach(function (k) {
      if (prev) {
        var a = new Date(prev + 'T00:00:00'); a.setDate(a.getDate() + 1);
        var nk = a.getFullYear() + '-' + pad(a.getMonth() + 1) + '-' + pad(a.getDate());
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
      var st = streakStats(), today = todayStr(), bars = [], max = 1, days = [];
      for (var i = 13; i >= 0; i--) {
        var d = new Date(); d.setDate(d.getDate() - i);
        var k = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
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
        '<div class="st-stat"><span class="st-num">' + st.today + '</span><span class="st-label">aujourd\'hui</span></div>' +
        '<div class="st-stat"><span class="st-num">' + st.best + '</span><span class="st-label">record</span></div>' +
        '<div class="st-stat"><span class="st-num">' + st.total + '</span><span class="st-label">cas résolus</span></div>' +
        '</div>' +
        '<div class="streak-chart">' + bars.join('') + '</div>' +
        '</div>';
    });
  }

  /* ------------------------------------------------------------ 6/9. coches + barres */
  function keyMatches(storeObj, full) {
    var keys = Object.keys(storeObj);
    for (var i = 0; i < keys.length; i++) { if (keys[i].slice(-full.length) === full) return true; }
    return false;
  }

  function markTiles() {
    var doneKeys = Object.keys(read(LS.progress)), favKeys = Object.keys(read(LS.fav));
    document.querySelectorAll('.case-tile[data-case]').forEach(function (a) {
      var key = a.getAttribute('data-case') || '';
      var done = keyMatches(read(LS.progress), key), fav = keyMatches(read(LS.fav), key);
      var st = a.querySelector('.ct-status');
      if (st) st.innerHTML = (fav ? '<span title="Favori / à revoir">★</span>' : '') + (done ? '<span title="Terminé" style="color:var(--green)">✔</span>' : '');
      a.classList.toggle('tile-done', done);
    });
    document.querySelectorAll('.nav-link[href]').forEach(function (a) { /* réservé futur */ });
  }

  function updateBars() {
    var s = read(LS.progress);
    document.querySelectorAll('.part-card[data-part]').forEach(function (card) {
      var slug = card.getAttribute('data-part');
      var total = parseInt(card.getAttribute('data-total') || '0', 10);
      var done = 0;
      Object.keys(s).forEach(function (k) { if (k.indexOf('/cases/' + slug + '/') !== -1) done++; });
      done = Math.min(done, total);
      var bar = card.querySelector('.progress-bar'), txt = card.querySelector('.progress-text');
      var pct = total ? Math.round((done / total) * 100) : 0;
      if (bar) bar.style.width = pct + '%';
      if (txt) txt.textContent = (done === total && total > 0 ? '🎉 ' : '✅ ') + done + '/' + total + ' cas terminés (' + pct + ' %)';
    });
    // barre latérale globale
    var fill = document.getElementById('sp-fill'), pctEl = document.getElementById('sp-pct');
    var grand = document.body.getAttribute('data-total-cases');
    if (fill && grand) {
      var d = 0;
      Object.keys(s).forEach(function (k) { if (k.indexOf('/cases/') !== -1) d++; });
      var pct = Math.min(100, Math.round(d / parseInt(grand, 10) * 100));
      fill.style.width = pct + '%';
      if (pctEl) pctEl.textContent = d + ' / ' + grand + ' (' + pct + ' %)';
    }
  }

  function refreshProgress() { markTiles(); updateBars(); renderStreakWidgets(); }

  /* ------------------------------------------------------------ 7. radar (SVG pur) */
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shortLabel(s, max) {
    s = s.replace(/\s+/g, ' ').trim().replace(/^(Infections?|Cas cliniques?)\s+/i, '');
    if (s.length <= max) return s;
    var cut = s.slice(0, max - 1), sp = cut.lastIndexOf(' ');
    if (sp > 4) cut = cut.slice(0, sp);
    return cut + '…';
  }
  function radarSVG(size, labels, values) {
    var cx = size / 2, cy = size / 2 + 8, R = size / 2 - 40, n = labels.length;
    function pt(i, r) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
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
      var v = Math.max(3, values[i]), p3 = pt(i, R * v / 100);
      vpts.push(p3[0].toFixed(1) + ',' + p3[1].toFixed(1));
    }
    out += '<polygon points="' + vpts.join(' ') + '" class="radar-area"/>';
    for (var i = 0; i < n; i++) {
      var p4 = pt(i, R + 14);
      var anchor = Math.abs(p4[0] - cx) < 12 ? 'middle' : (p4[0] > cx ? 'start' : 'end');
      var dy = p4[1] < cy ? -2 : (p4[1] > cy + 6 ? 8 : 3);
      out += '<text x="' + p4[0].toFixed(1) + '" y="' + (p4[1] + dy).toFixed(1) + '" text-anchor="' + anchor + '" class="radar-label">' + esc(shortLabel(labels[i], 22)) + '</text>';
    }
    return '<svg class="radar" viewBox="-76 -14 ' + (size + 152) + ' ' + (size + 36) + '">' + out + '</svg>';
  }

  /* ------------------------------------------------------------ 8. page « Mes progrès » */
  function renderProgressPage() {
    var app = document.getElementById('progress-app');
    if (!app || app.dataset.ready === '1') return;
    app.dataset.ready = '1';
    loadAsset('cases.json').then(build).catch(function (e) {
      app.innerHTML = '<p>Erreur : ' + (e && e.message ? e.message : e) + '</p>';
    });

    function build(data) {
      var favStore = read(LS.fav), progStore = read(LS.progress);
      var doneCases = 0, favCount = 0, html = '';

      /* favoris */
      var favHtml = [];
      Object.keys(favStore).sort(function (a, b) { return favStore[a] - favStore[b]; }).forEach(function (k) {
        var rel = null;
        data.parts.forEach(function (p) { p.sections.forEach(function (sec) { sec.cases.forEach(function (c) {
          var u = normRel(c);
          if (k.slice(-u.length) === u) rel = c; }); }); });
        if (!rel) return;
        favCount++;
        var url = normRel(rel);
        var name = rel.replace(/^.*\//, '').replace(/\.md$/, '');
        var mm = name.match(/^cas-(\d+)-(\d+)$/);
        var label = mm ? 'Cas ' + mm[1] + '.' + parseInt(mm[2], 10) : name;
        favHtml.push('<a class="result-item" href="' + url + '"><div class="ri-head"><span>★</span> ' + esc(label) +
          '<span class="chip plain" style="margin-left:auto">' + esc(data.parts.filter(function(p){return rel.indexOf(p.slug)!==-1;})[0] ? data.parts.filter(function(p){return rel.indexOf(p.slug)!==-1;})[0].title : '') + '</span></div></a>');
      });
      html += '<div class="app-panel"><h3 style="margin:0 0 10px">★ Favoris / cas à revoir <span class="chip plain">' + favCount + '</span></h3>' +
        (favHtml.length ? favHtml.join('') : '<p style="color:var(--text-3);font-size:13.5px">Aucun favori pour l\'instant. Épinglez un cas depuis sa page (bouton « ☆ Épingler ce cas »).</p>') + '</div>';

      /* annotations */
      var notesStore = read(LS.notes);
      var noteKeys = Object.keys(notesStore).sort(function (a, b) { return (notesStore[b].ts || 0) - (notesStore[a].ts || 0); });
      var notesHtml = [];
      noteKeys.forEach(function (k) {
        var item = notesStore[k];
        if (!item || !item.text) return;
        var name = k.replace(/\/$/, '').split('/').pop() || k;
        var mm = name.match(/^cas-(\d+)-(\d+)$/);
        var label = mm ? 'Cas ' + mm[1] + '.' + parseInt(mm[2], 10) : name;
        notesHtml.push('<a class="result-item" href="' + k + '"><div class="ri-head"><span>📝</span> ' + esc(label) + '</div>' +
          '<div class="ri-snip">' + esc(String(item.text).slice(0, 160)) + (String(item.text).length > 160 ? '…' : '') + '</div></a>');
      });
      html += '<div class="app-panel"><h3 style="margin:0 0 10px">📝 Mes annotations <span class="chip plain">' + notesHtml.length + '</span></h3>' +
        (notesHtml.length ? notesHtml.join('') : '<p style="color:var(--text-3);font-size:13.5px">Aucune annotation. Ouvrez un cas et dépliez « 📝 Mes annotations ».</p>') + '</div>';

      /* stats par partie + radar + points faibles */
      var doneKeys = Object.keys(progStore);
      var weak = [];
      data.parts.forEach(function (p) {
        var labels = [], values = [];
        p.sections.forEach(function (sec) {
          var total = sec.cases.length, done = 0, pinned = 0;
          sec.cases.forEach(function (c) {
            var url = BASE + '/' + c.replace(/\.md$/, '') + '/';
            var hit = null;
            doneKeys.forEach(function (k) { if (k.slice(-url.length) === url) hit = k; });
            if (hit) done++;
          });
          // épinglés
          Object.keys(favStore).forEach(function (k) {
            sec.cases.forEach(function (c) {
              var url = BASE + '/' + c.replace(/\.md$/, '') + '/';
              if (k.slice(-url.length) === url) pinned++;
            });
          });
          var pct = total ? Math.round(done / total * 100) : 0;
          labels.push(sec.title); values.push(pct);
          weak.push({ part: p, sec: sec, total: total, done: done, pinned: pinned, pct: pct });
        });
        if (labels.length) {
          html += '<div class="stats-grid"><div class="radar-card"><h3>' + p.icon + ' ' + esc(p.title) + '</h3>' +
            '<div class="rc-sub">Taux de complétion par chapitre</div>' +
            radarSVG(300, labels, values) + '</div></div>';
        }
      });

      weak.sort(function (a, b) {
        var sa = (100 - a.pct) + a.pinned * 15, sb = (100 - b.pct) + b.pinned * 15;
        return sb - sa;
      });
      var weakHtml = weak.slice(0, 8).map(function (w, i) {
        var score = Math.max(4, Math.min(100, Math.round((100 - w.pct) * 0.8 + w.pinned * 12)));
        var color = score > 66 ? '#dc2626' : score > 38 ? '#d97706' : '#059669';
        return '<li class="weak-item"><span class="wi-rank" style="background:' + color + '">' + (i + 1) + '</span>' +
          '<span style="min-width:0;flex:1">' + esc(w.sec.title) + ' <span style="color:var(--text-3);font-weight:600">· ' + esc(w.part.title) + '</span></span>' +
          '<span class="wi-bar-track"><span class="wi-bar" style="width:' + score + '%;background:' + color + '"></span></span>' +
          '<span class="wi-val">' + w.done + '/' + w.total + ' · ' + w.pinned + ' ★</span></li>';
      }).join('');
      html += '<div class="app-panel"><h3 style="margin:0 0 6px">📉 Vos points faibles</h3>' +
        '<p style="margin:0;font-size:12.5px;color:var(--text-3)">Chapitres classés par cas restants et favoris à revoir.</p>' +
        '<ul class="weak-list">' + weakHtml + '</ul></div>';

      app.innerHTML = html;
      renderStreakWidgets();
    }
  }

  /* ------------------------------------------------------------ 9. recherche */
  function normText(s) {
    var out = {};
    s = s.toLowerCase();
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return s;
  }
  function renderSearchPage() {
    var app = document.getElementById('search-app');
    if (!app || app.dataset.ready === '1') return;
    app.dataset.ready = '1';
    loadAsset('search-index.json').then(build).catch(function (e) {
      app.innerHTML = '<p>Impossible de charger l\'index de recherche.</p>';
    });

    function build(data) {
      var cases = data.cases.map(function (c) {
        var x = Object.assign({}, c);
        x._n = normText(x.t);
        x._l = normText(x.l);
        return x;
      });
      var partSel = document.getElementById('sq-part'), chapSel = document.getElementById('sq-chap');
      var input = document.getElementById('sq-input'), count = document.getElementById('sq-count');
      var results = document.getElementById('sq-results'), tagRow = document.getElementById('sq-tags');
      var state = { q: '', part: '', chap: '', tags: [] };

      data.parts.forEach(function (p) {
        var o = document.createElement('option'); o.value = p.slug; o.textContent = p.icon + ' ' + p.roman + ' · ' + p.title + ' (' + p.count + ')';
        partSel.appendChild(o);
      });
      partSel.addEventListener('change', function () {
        state.part = partSel.value; state.chap = ''; chapSel.innerHTML = '<option value="">Tous les chapitres</option>';
        var p = data.parts.filter(function (x) { return x.slug === state.part; })[0];
        if (p) p.sections.forEach(function (s) {
          var o = document.createElement('option'); o.value = s.slug; o.textContent = s.title + ' (' + s.count + ')';
          chapSel.appendChild(o);
        });
        run();
      });
      chapSel.addEventListener('change', function () { state.chap = chapSel.value; run(); });
      input.addEventListener('input', function () { state.q = normText(input.value.trim()); run(); });

      // chips de tags (top 30)
      data.tags.slice(0, 30).forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'tag-chip'; b.textContent = t.n;
        b.addEventListener('click', function () {
          var i = state.tags.indexOf(t.n);
          if (i === -1) { state.tags.push(t.n); b.classList.add('on'); }
          else { state.tags.splice(i, 1); b.classList.remove('on'); }
          run();
        });
        tagRow.appendChild(b);
      });

      function snippet(c) {
        if (!state.q) return c.t.slice(0, 170) + '…';
        var idx = c._n.indexOf(state.q);
        if (idx === -1) idx = 0;
        var start = Math.max(0, idx - 60);
        var raw = c.t.slice(start, start + 190);
        return (start > 0 ? '…' : '') + esc(raw).replace(new RegExp('(' + state.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>') + '…';
      }
      function highlightTags(c) {
        return c.g.map(function (g) { return '<span class="ri-tag">' + esc(g) + '</span>'; }).join('');
      }

      function run() {
        var res = cases.filter(function (c) {
          if (state.part && c.p !== state.part) return false;
          if (state.chap && c.s !== state.chap) return false;
          for (var i = 0; i < state.tags.length; i++) { if (c.g.indexOf(state.tags[i]) === -1) return false; }
          if (state.q && c._n.indexOf(state.q) === -1 && c._l.indexOf(state.q) === -1) return false;
          return true;
        });
        count.textContent = res.length + ' cas trouvé' + (res.length > 1 ? 's' : '');
        results.innerHTML = res.slice(0, 60).map(function (c) {
          var p = data.parts.filter(function (x) { return x.slug === c.p; })[0];
          var sec = p ? p.sections.filter(function (x) { return x.slug === c.s; })[0] : null;
          var url = BASE + '/' + c.f.replace(/\.md$/, '') + '/';
          return '<a class="result-item" href="' + url + '">' +
            '<div class="ri-head"><span>' + (p ? p.icon : '📄') + '</span> ' + esc(c.l) +
            '<span class="chip plain" style="margin-left:auto">' + (sec ? esc(sec.title) : '') + '</span></div>' +
            '<div class="ri-snip">' + snippet(c) + '</div>' +
            '<div class="ri-tags">' + highlightTags(c) + '</div></a>';
        }).join('') || '<p style="color:var(--text-3)">Aucun cas ne correspond. Essayez un autre mot-clé (la recherche ignore les accents).</p>';
      }
      run();
    }
  }

  /* ------------------------------------------------------------ 10. impression */
  function renderPrintPage() {
    var app = document.getElementById('print-app');
    if (!app || app.dataset.ready === '1') return;
    app.dataset.ready = '1';
    loadAsset('cases.json').then(build).catch(function (e) {
      app.innerHTML = '<p>Erreur : ' + (e && e.message ? e.message : e) + '</p>';
    });

    function build(data) {
      var preChap = new URLSearchParams(location.search).get('c') || '';
      var prePart = preChap.slice(-2) === '/*' ? preChap.slice(0, -2) : '';
      var html = '<p style="font-size:13px;color:var(--text-3);margin:0 0 14px">Cochez les chapitres ou les cas à imprimer. Le PDF final contient les questions <b>et</b> les corrigés, sans menus.</p>';
      data.parts.forEach(function (p) {
        html += '<div class="card" style="margin-bottom:16px"><div class="pc-head" style="margin-bottom:8px">' +
          '<div class="pc-icon">' + p.icon + '</div><div><div class="card-title">' + esc(p.roman) + ' · ' + esc(p.title) + '</div>' +
          '<div style="font-size:12px;color:var(--text-3)">' + p.count + ' cas</div></div>' +
          '<button type="button" class="btn btn-sm btn-soft pr-part" style="margin-left:auto">Tout cocher</button></div>';
        p.sections.forEach(function (sec) {
          var checked = (preChap === (p.slug + '/' + sec.slug) || prePart === p.slug) ? ' checked' : '';
          html += '<div class="print-row"><label><input type="checkbox" class="pr-chap" data-part="' + p.slug + '"' + checked +
            '><span><b>' + esc(sec.title) + '</b></span></label><span class="pr-count">' + sec.count + ' cas</span>' +
            '<button type="button" class="btn btn-sm btn-ghost pr-expand">détails ▾</button></div>';
          html += '<div class="pr-cases" style="display:none;padding:2px 0 10px 34px">';
          sec.cases.forEach(function (c) {
            var name = c.replace(/^.*\//, '').replace(/\.md$/, '');
            var mm = name.match(/^cas-(\d+)-(\d+)$/);
            var label = mm ? 'Cas ' + mm[1] + '.' + parseInt(mm[2], 10) : name;
            html += '<div class="print-row" style="padding:7px 14px;margin-bottom:6px"><label><input type="checkbox" class="pr-case" data-url="' + BASE + '/' + c.replace(/\.md$/, '') + '/">' + esc(label) + '</label></div>';
          });
          html += '</div>';
        });
        html += '</div>';
      });
      html += '<div class="print-actions">' +
        '<button type="button" class="btn" id="pr-clear">Tout décocher</button>' +
        '<button type="button" class="btn btn-primary btn-lg" id="pr-go">🖨️ Imprimer la sélection</button></div>';
      app.innerHTML = html;

      app.querySelectorAll('.pr-expand').forEach(function (b) {
        b.addEventListener('click', function () {
          var box = b.closest('.print-row').nextElementSibling;
          var open = box.style.display === 'none';
          box.style.display = open ? 'block' : 'none';
          b.textContent = open ? 'replier ▴' : 'détails ▾';
        });
      });
      app.querySelectorAll('.pr-chap').forEach(function (cb) {
        cb.addEventListener('change', function () { /* la sélection pilote les cases cochées */ });
      });
      app.querySelectorAll('.pr-part').forEach(function (b) {
        b.addEventListener('click', function () {
          var card = b.closest('.card');
          var boxes = card.querySelectorAll('.pr-chap');
          var all = Array.prototype.every.call(boxes, function (x) { return x.checked; });
          boxes.forEach(function (x) { x.checked = !all; });
        });
      });
      document.getElementById('pr-clear').addEventListener('click', function () {
        app.querySelectorAll('input[type="checkbox"]').forEach(function (x) { x.checked = false; });
      });

      document.getElementById('pr-go').addEventListener('click', function () {
        var urls = [];
        // chapitres cochés -> tous leurs cas
        app.querySelectorAll('.pr-chap:checked').forEach(function (cb) {
          var part = cb.getAttribute('data-part');
          var row = cb.closest('.print-row');
          var title = row.querySelector('b').textContent;
          var p = data.parts.filter(function (x) { return x.slug === part; })[0];
          var sec = p.sections.filter(function (s) { return s.title === title; })[0];
          if (sec) sec.cases.forEach(function (c) {
            urls.push(BASE + '/' + c.replace(/\.md$/, '') + '/');
          });
        });
        app.querySelectorAll('.pr-case:checked').forEach(function (cb) {
          var u = cb.getAttribute('data-url');
          if (urls.indexOf(u) === -1) urls.push(u);
        });
        if (!urls.length) { toast('Cochez au moins un cas ou un chapitre.'); return; }
        printUrls(urls);
      });

      function printUrls(urls) {
        var btn = document.getElementById('pr-go');
        btn.disabled = true; btn.textContent = '⏳ Préparation (' + urls.length + ')…';
        var container = document.getElementById('print-container');
        container.innerHTML = '';
        var chain = Promise.resolve();
        urls.forEach(function (u) {
          chain = chain.then(function () {
            return fetch(u).then(function (r) { return r.text(); }).then(function (t) {
              var doc = new DOMParser().parseFromString(t, 'text/html');
              var content = doc.querySelector('.case-content');
              var head = doc.querySelector('.case-h1');
              var h = document.createElement('div');
              h.className = 'print-chunk';
              h.innerHTML = '<div class="print-casehead"><span>Les Cas Cliniques de Microbiologie — Résidanat en Algérie</span><span>Dr. Wail NAMOUNE</span></div>' +
                (head ? '<h2 style="font-size:16pt;margin:0 0 10px">' + esc(head.textContent) + '</h2>' : '') +
                (content ? content.innerHTML : '');
              h.style.pageBreakAfter = 'always';
              container.appendChild(h);
            });
          });
        });
        chain.then(function () {
          container.style.display = 'block';
          document.body.classList.add('printing-selection');
          btn.disabled = false; btn.textContent = '🖨️ Imprimer la sélection';
          window.print();
          setTimeout(function () {
            container.style.display = 'none'; container.innerHTML = '';
            document.body.classList.remove('printing-selection');
          }, 500);
        }).catch(function () {
          btn.disabled = false; btn.textContent = '🖨️ Imprimer la sélection';
          toast('Erreur pendant la préparation du PDF.');
        });
      }
    }
  }

  /* impression de la sélection : cacher la page, ne montrer que le conteneur */
  var style = document.createElement('style');
  style.textContent = '@media print{body.printing-selection>*:not(#print-container){display:none!important}body.printing-selection #print-container{display:block!important}#print-container .corrige-hint,#print-container .corrige-arrow{display:none}}';
  document.head.appendChild(style);

  /* ------------------------------------------------------------ fiche : impression */
  function initFichePrint() {
    var b = document.getElementById('fiche-print');
    if (!b) return;
    b.addEventListener('click', function () {
      document.documentElement.classList.add('printing-fiche');
      setTimeout(function () {
        window.print();
        setTimeout(function () { document.documentElement.classList.remove('printing-fiche'); }, 400);
      }, 50);
    });
    var dl = document.getElementById('fiche-download');
    if (dl) {
      dl.addEventListener('click', function () {
        var sheet = document.querySelector('.fiche-sheet');
        if (!sheet) return;
        var w = window.open('', '_blank');
        var css = Array.prototype.map.call(document.querySelectorAll('style'), function (s) { return s.textContent; }).join('\n');
        var ficheCss = css.substring(css.indexOf('/* feuille fiche'), css.indexOf('/* ============================================================ RADAR'));
        w.document.write('<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>' + document.title + '</title><style>' + ficheCss + '</style></head><body>' + sheet.outerHTML + '</body></html>');
        w.document.close();
      });
    }
  }

  /* ------------------------------------------------------------ raccourci « / » */
  function initShortcut() {
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        var a = document.querySelector('.hdr-search');
        if (a) { e.preventDefault(); a.click(); }
      }
    });
  }

  /* ------------------------------------------------------------ init */
  function init() {
    initTheme();
    initMobile();
    initShortcut();
    initFichePrint();
    var page = document.body.getAttribute('data-page') || '';
    setupCase();
    addCaseToolbar();
    renderStreakWidgets();
    renderProgressPage();
    renderSearchPage();
    renderPrintPage();
    refreshProgress();
    // impression d'un chapitre depuis /cases/
    document.querySelectorAll('[data-print-chapter]').forEach(function (b) {
      b.addEventListener('click', function () {
        location.href = BASE + '/impression/?c=' + b.getAttribute('data-print-chapter');
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
