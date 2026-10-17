(function () {
  var lg = document.querySelector('img.logo');
  if (!lg) return;
  var ext = ['png', 'svg', 'jpg', 'jpeg', 'webp', 'gif'], i = 0;
  function next() { i++; if (i < ext.length) lg.src = 'assets/logo.' + ext[i]; else lg.parentNode.style.display = 'none'; }
  lg.addEventListener('error', next);
  if (lg.complete && lg.naturalWidth === 0 && !/\.svg$/.test(lg.src)) next();
})();
(function () {
  var $ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var q = document.getElementById('q');
  function filter() {
    var t = q ? q.value.toLowerCase().trim() : '';
    $('.item').forEach(function (d) { d.hidden = !!t && d.textContent.toLowerCase().indexOf(t) < 0; });
    $('.sec-block').forEach(function (s) {
      var items = $('.item', s);
      s.hidden = items.length > 0 && !items.some(function (d) { return !d.hidden; });
    });
  }
  if (q) q.addEventListener('input', filter);
  var tq = document.getElementById('tq');
  var ROLES = { ds: 'Data Science', aiml: 'AI/ML', ba: 'Business Analyst' };
  var allView = document.getElementById('all-view'), roleView = document.getElementById('role-view');
  function applySearch() {
    var t = tq ? tq.value.toLowerCase().trim() : '';
    $('.grid .btn').forEach(function (c) {
      var nm = (c.querySelector('span') || c).textContent.toLowerCase();
      c.hidden = !!t && nm.indexOf(t) < 0;
    });
    $('.grp-block').forEach(function (g) { g.hidden = !$('.btn', g).some(function (c) { return !c.hidden; }); });
  }
  if (tq) tq.addEventListener('input', applySearch);
  function tier(card, role) {
    var m = (card.getAttribute('data-roles') || '').split(',');
    for (var i = 0; i < m.length; i++) { var p = m[i].split(':'); if (p[0] === role) return p[1]; }
    return null;
  }
  function group(title, cards) {
    if (!cards.length) return null;
    var s = document.createElement('section'); s.className = 'grp-block';
    var h = document.createElement('h2'); h.className = 'grp'; h.textContent = title;
    var g = document.createElement('div'); g.className = 'grid';
    cards.forEach(function (c) { g.appendChild(c); });
    s.appendChild(h); s.appendChild(g);
    return s;
  }
  function setRole(role) {
    if (!ROLES[role]) role = 'all';
    $('.pill').forEach(function (p) {
      var on = p.getAttribute('data-role') === role;
      p.classList.toggle('on', on); p.setAttribute('aria-pressed', on);
    });
    try { localStorage.setItem('faqRole', role); } catch (e) {}
    roleView.innerHTML = '';
    if (role === 'all') { allView.hidden = false; roleView.hidden = true; applySearch(); return; }
    var core = [], useful = [], other = [];
    $('#all-view .btn').forEach(function (c) {
      var n = c.cloneNode(true), t = tier(c, role);
      if (t && t !== 'u') {
        n.classList.add('core');
        n.insertAdjacentHTML('afterbegin', '<em class="rank">' + t + '</em><b class="tag">Core</b>');
        n.rank = parseInt(t, 10); core.push(n);
      } else if (t === 'u') { n.classList.add('useful'); useful.push(n); }
      else { n.classList.add('other'); other.push(n); }
    });
    core.sort(function (a, b) { return a.rank - b.rank; });
    [['Core for ' + ROLES[role], core], ['Also useful', useful], ['Other topics', other]].forEach(function (x) {
      var s = group(x[0], x[1]); if (s) roleView.appendChild(s);
    });
    allView.hidden = true; roleView.hidden = false; applySearch();
  }
  if (allView && roleView) {
    $('.pill').forEach(function (p) {
      p.addEventListener('click', function () {
        var r = p.getAttribute('data-role');
        setRole(r);
        history.replaceState(null, '', r === 'all' ? location.pathname : '#role=' + r);
      });
    });
    var m = location.hash.match(/role=(\w+)/), saved = null;
    try { saved = localStorage.getItem('faqRole'); } catch (e) {}
    setRole(m ? m[1] : (saved || 'all'));
    window.addEventListener('hashchange', function () {
      var k = location.hash.match(/role=(\w+)/); setRole(k ? k[1] : 'all');
    });
  }
  function setAll(open) { $('details.item').forEach(function (d) { if (!d.hidden) d.open = open; }); }

  var KW = {}, FN = {};
  ('SELECT FROM WHERE GROUP BY ORDER HAVING AS JOIN INNER LEFT RIGHT FULL OUTER CROSS ON AND OR NOT IN IS NULL LIKE BETWEEN EXISTS DISTINCT TOP ASC DESC UNION ALL ANY INSERT INTO UPDATE SET DELETE CREATE ALTER TABLE ADD CONSTRAINT FOREIGN KEY REFERENCES VIEW CASE WHEN THEN ELSE END FOR XML PATH WITH APPLY VALUES OVER ROWID').split(' ').forEach(function (w) { KW[w] = 1; });
  ('COUNT SUM AVG MIN MAX UPPER LOWER CONCAT SUBSTRING LEN ISNULL STUFF MONTH YEAR CAST DATENAME DENSE_RANK STRING_AGG DECIMAL').split(' ').forEach(function (w) { FN[w] = 1; });
  var RX = /(--[^\n]*)|('(?:[^']|'')*')|(\[[^\]]*\])|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z_0-9]*\b)/g;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function hl(src) {
    var out = '', last = 0, m; RX.lastIndex = 0;
    while ((m = RX.exec(src))) {
      var t = m[0], u = t.toUpperCase();
      var c = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'b' : m[4] ? 'n' : KW[u] ? 'k' : FN[u] ? 'f' : '';
      out += esc(src.slice(last, m.index)) + (c ? '<span class="t-' + c + '">' + esc(t) + '</span>' : esc(t));
      last = RX.lastIndex;
    }
    return out + esc(src.slice(last));
  }
  $('pre code.language-sql').forEach(function (c) { c.innerHTML = hl(c.textContent); });
  var ex = document.getElementById('ex'), co = document.getElementById('co');
  if (ex) ex.addEventListener('click', function () { setAll(true); });
  if (co) co.addEventListener('click', function () { setAll(false); });
  if (location.hash.length > 1) {
    var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el && el.tagName === 'DETAILS') { el.open = true; el.scrollIntoView(); }
  }
  document.addEventListener('click', function (e) {
    var img = e.target.closest && e.target.closest('.wrap img');
    if (!img) return;
    var lb = document.createElement('div');
    lb.className = 'lb';
    var c = document.createElement('img');
    c.src = img.src;
    lb.appendChild(c);
    lb.addEventListener('click', function () { lb.remove(); });
    document.body.appendChild(lb);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') $('.lb').forEach(function (n) { n.remove(); });
  });
})();
