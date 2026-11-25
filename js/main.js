/* Header menu — only active while the inline navigation is collapsed. */
(function () {
  var toggle = document.querySelector('.bb-nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      nav.setAttribute('data-open', 'true');
    } else {
      nav.removeAttribute('data-open');
    }
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });

  // leaving the collapsed range must not strand the panel open
  var wide = window.matchMedia('(min-width: 1081px)');
  (wide.addEventListener ? wide.addEventListener.bind(wide, 'change')
                         : wide.addListener.bind(wide))(function (e) {
    if (e.matches) setOpen(false);
  });
})();

/* Header menu — mark the link of the page we are on (articles count as Insights). */
(function () {
  var links = document.querySelectorAll('#primary-nav a');
  function key(path) {
    var s = path.replace(/\/+$/, '').split('/').pop().replace(/\.html$/, '');
    return /^insights/.test(s) ? 'insights' : s;
  }
  var here = key(location.pathname);
  if (!here) return;
  for (var i = 0; i < links.length; i++) {
    var href = (links[i].getAttribute('href') || '').split('#')[0];
    if (href && key(href) === here) links[i].setAttribute('aria-current', 'page');
  }
})();

/* The audience pills. The panel is swapped in place — the section keeps its
   position on the page, so the reader compares three readings of one sheet
   rather than being moved between screens. Arrow keys walk the set, as a
   tab list should. */
(function () {
  var list = document.querySelector('.bb-pills');
  if (!list) return;

  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  function panelOf(tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  }

  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = panelOf(t);
      if (panel) panel.hidden = !on;
      var lead = document.getElementById(t.id.replace('tab-', 'lead-'));
      if (lead) lead.hidden = !on;
    });
    if (focus) tab.focus();
  }

  list.addEventListener('click', function (e) {
    var tab = e.target.closest('[role="tab"]');
    if (tab) select(tab, false);
  });

  list.addEventListener('keydown', function (e) {
    var at = tabs.indexOf(document.activeElement);
    if (at < 0) return;
    var to = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (at + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (at + tabs.length - 1) % tabs.length;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = tabs.length - 1;
    if (to === null) return;
    e.preventDefault();
    select(tabs[to], true);
  });
})();

/* The words on a link turn over letter by letter. Each character is given its
   own little window with a copy beneath it; on hover both slide up, one
   fractionally after the next. The split content is hidden from assistive
   software, which reads the label off the link itself. */
(function () {
  var rolls = Array.prototype.slice.call(document.querySelectorAll('.bb-link-underline__roll'));
  rolls.forEach(function (roll) {
    var text = roll.textContent;
    var link = roll.closest('a');
    if (link && !link.getAttribute('aria-label')) link.setAttribute('aria-label', text);
    roll.setAttribute('aria-hidden', 'true');
    roll.textContent = '';
    text.split('').forEach(function (ch, i) {
      var cell = document.createElement('span');
      cell.className = 'bb-link-underline__char';
      cell.style.transitionDelay = (i * 16) + 'ms';
      var a = document.createElement('span');
      a.textContent = ch === ' ' ? ' ' : ch;
      var b = document.createElement('span');
      b.textContent = a.textContent;
      cell.appendChild(a);
      cell.appendChild(b);
      roll.appendChild(cell);
    });
  });
})();

/* In Numbers: the figures count up the first time they come into view. */
(function () {
  var nodes = document.querySelectorAll('[data-count]');
  if (!nodes.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function run(node) {
    var target = parseInt(node.dataset.count, 10);
    var start = null;
    var DURATION = 1800;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / DURATION, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var n = Math.round(target * eased);
      node.textContent = n >= 1000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009') : n;
      if (t < 1) window.requestAnimationFrame(frame);
    }
    node.textContent = '0';
    window.requestAnimationFrame(frame);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      run(entry.target);
    });
  }, { threshold: 0.6 });
  nodes.forEach(function (node) { io.observe(node); });
})();


/* Language switch: closes on a click elsewhere and on Escape. */
(function () {
  var box = document.querySelector('.bb-lang');
  if (!box) return;
  document.addEventListener('click', function (e) {
    if (!box.contains(e.target)) box.removeAttribute('open');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && box.hasAttribute('open')) {
      box.removeAttribute('open');
      box.querySelector('summary').focus();
    }
  });
})();

/* Eco Solutions: one solution is open at a time. On a wide screen it is read
   in the panel beside the list; on a narrow one it opens under its row. */
(function () {
  var root = document.querySelector('.bb-solution-picker');
  if (!root) return;
  var rows = Array.prototype.slice.call(root.querySelectorAll('.bb-solution'));
  var panel = root.querySelector('.bb-solution-picker__panel');
  if (!rows.length || !panel) return;
  var pIcon = panel.querySelector('.bb-solution-picker__panel-icon');
  var pTitle = panel.querySelector('.bb-solution-picker__panel-title');
  var pText = panel.querySelector('.bb-solution-picker__panel-text');
  var wide = window.matchMedia('(min-width: 1151px)');
  var current = null;

  function fillPanel(row) {
    pIcon.src = 'images/icons/' + row.getAttribute('data-icon') + '.svg';
    pTitle.textContent = row.querySelector('.bb-solution__name').textContent;
    pText.innerHTML = row.querySelector('.bb-solution__detail').innerHTML;
  }

  function select(row, swap) {
    if (row === current) return;
    current = row;
    rows.forEach(function (r) {
      var on = r === row;
      r.classList.toggle('bb-solution--active', on);
      r.querySelector('.bb-solution__btn').setAttribute('aria-expanded', String(on));
    });
    if (swap && wide.matches) {
      panel.classList.add('bb-solution-picker__panel--swapping');
      window.setTimeout(function () { fillPanel(row); panel.classList.remove('bb-solution-picker__panel--swapping'); }, 180);
    } else {
      fillPanel(row);
    }
  }

  rows.forEach(function (row) {
    var btn = row.querySelector('.bb-solution__btn');
    btn.addEventListener('click', function () {
      if (!wide.matches && row === current) {   // a narrow screen can close its row
        row.classList.remove('bb-solution--active');
        btn.setAttribute('aria-expanded', 'false');
        current = null;
        return;
      }
      select(row, true);
    });
    btn.addEventListener('mouseenter', function () { if (wide.matches) select(row, true); });
  });

  panel.hidden = false;
  root.classList.add('bb-solution-picker--live');
  select(rows[0], false);
})();

/* Request form: two always-open sections (contacts, the request) and one send button that
   is always there. A folded section keeps a one-line summary. Inside the second section one direction is open at
   a time and a folded one keeps a one-line summary. Errors are shown next to the field, in Czech.
   Not connected to e-mail yet. */
(function () {
  var form = document.getElementById('request-form');
  if (!form) return;
  var $ = function (sel, root) { return (root || form).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || form).querySelectorAll(sel)); };

  var picks = $$('.bb-pick');
  var advice = $('.bb-pick__check');
  var hidden = document.getElementById('f-summary');
  var status = $('.bb-form__status');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- directions ---- */
  /* the list of directions is folded into a field-like button; it opens a panel and, closed, shows what is chosen */
  var pickWrap = $('.bb-form__pick');
  var pickToggle = $('.bb-picker__toggle');
  var pickLabel = $('.bb-picker__label');
  var pickSum = $('.bb-picker__summary');

  function setPanel(open) {
    pickWrap.classList.toggle('bb-picker--open', open);
    pickToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function plural(n) { return n === 1 ? 'oblast' : (n >= 2 && n <= 4 ? 'oblasti' : 'oblastí'); }

  function renderPicker(out) {
    var n = out.length + (advice.checked ? 1 : 0);
    pickLabel.textContent = n ? 'Vybráno: ' + n + ' ' + plural(n) : 'Vyberte, co vás zajímá';
    pickToggle.classList.toggle('is-filled', n > 0);
    $$('.bb-picker__clear').forEach(function (b) { b.hidden = n === 0; });
    pickSum.textContent = '';
    var lines = [];
    if (advice.checked) lines.push('Poradit s výběrem');
    out.forEach(function (o) { lines.push(o.head + (o.parts.length ? ': ' + o.parts.join('; ') : '')); });
    lines.forEach(function (t) {
      var l = document.createElement('span');
      l.textContent = t;
      pickSum.appendChild(l);
    });
  }

  function clearAll() {
    $$('.bb-pick__main').forEach(function (c) { c.checked = false; });
    $$('.bb-chip input').forEach(function (c) { c.checked = false; });
    advice.checked = false;
    picks.forEach(function (p) { setOpen(p, false); });
    choice();
  }

  function syncWide(pick) {
    pick.classList.toggle('bb-pick--wide', pick.classList.contains('bb-pick--open') || !!$('.bb-pick__summary', pick).textContent);
  }
  function setOpen(pick, open) {
    pick.classList.toggle('bb-pick--open', open);
    $('.bb-pick__toggle', pick).setAttribute('aria-expanded', open ? 'true' : 'false');
    syncWide(pick);
  }
  function openOnly(pick) { picks.forEach(function (p) { setOpen(p, p === pick); }); }

  function choice() {
    var out = [];
    picks.forEach(function (pick) {
      var main = $('.bb-pick__main', pick);
      var total = 0, parts = [], names = [];
      $$('.bb-pick__group', pick).forEach(function (group) {
        var chosen = $$('.bb-chip input:checked', group).map(function (c) { return c.parentNode.textContent.trim(); });
        if (!chosen.length) return;
        total += chosen.length;
        names = names.concat(chosen);
        var title = $('.bb-pick__group-title', group);
        parts.push((title ? title.textContent.trim() + ': ' : '') + chosen.join(', '));
      });
      pick.classList.toggle('bb-pick--checked', main.checked);
      $('.bb-pick__count', pick).textContent = total ? '(' + total + ')' : '';
      var sum = $('.bb-pick__summary', pick);
      sum.textContent = '';
      parts.forEach(function (p) {            /* "Omítané řezivo: Smrk, Borovice", one line per group */
        var l = document.createElement('div');
        l.textContent = p;
        sum.appendChild(l);
      });
      syncWide(pick);
      if (main.checked) out.push({ head: main.value, parts: parts, names: names });
    });
    var lines = out.map(function (o) { return o.head + (o.parts.length ? ' [' + o.parts.join('; ') + ']' : ''); });
    if (advice.checked) lines.unshift(advice.value);
    hidden.value = lines.join(' | ');
    renderPicker(out);
    return out;
  }

  function val(id) { return document.getElementById(id).value.trim(); }


  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.classList.contains('bb-pick__main')) {
      var pick = t.closest('.bb-pick');
      if (t.checked) openOnly(pick);
      else { $$('.bb-chip input', pick).forEach(function (c) { c.checked = false; }); setOpen(pick, false); }
    }
    choice();
  });
  function fold(pick) {
    if (pick.classList.contains('bb-pick--open')) setOpen(pick, false); else openOnly(pick);
  }
  picks.forEach(function (pick) {
    var main = $('.bb-pick__main', pick);
    $('.bb-pick__toggle', pick).addEventListener('click', function () { fold(pick); });
    /* a click on the name of a ticked direction only folds or unfolds it; the choice is taken off by the tick */
    $('.bb-pick__head', pick).addEventListener('click', function (e) {
      if (e.target === main || e.target.closest('.bb-pick__box') || !main.checked) return;
      e.preventDefault();
      fold(pick);
    });
    $('.bb-pick__summary', pick).addEventListener('click', function () { openOnly(pick); });
  });

  /* ---- errors next to the field ---- */
  function errorOf(el) {
    var id = el.getAttribute('aria-describedby');
    return id ? document.getElementById(id) : null;
  }
  function showError(el, msg) {
    var p = errorOf(el);
    el.setAttribute('aria-invalid', 'true');
    if (p) { p.textContent = msg; p.hidden = false; }
  }
  function clearError(el) {
    var p = errorOf(el);
    el.removeAttribute('aria-invalid');
    if (p) { p.textContent = ''; p.hidden = true; }
  }
  $$('input').forEach(function (el) {
    el.addEventListener('input', function () { clearError(el); });
    el.addEventListener('change', function () { clearError(el); });
  });

  function validContacts() {
    var rules = [
      ['f-name', function (v) { return v ? '' : 'Vyplňte prosím jméno a příjmení.'; }],
      ['f-company', function (v) { return v ? '' : 'Vyplňte prosím název firmy.'; }],
      ['f-email', function (v) {
        if (!v) return 'Vyplňte prosím e-mail.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Zadejte e-mail ve tvaru jmeno@firma.cz.';
      }]
    ];
    var first = null;
    rules.forEach(function (r) {
      var el = document.getElementById(r[0]);
      var msg = r[1](el.value.trim());
      if (msg) { showError(el, msg); if (!first) first = el; } else { clearError(el); }
    });
    if (first) {

      first.focus();
      return false;
    }
    return true;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validContacts()) return;
    var consent = $('.bb-consent input');
    if (!consent.checked) {
      showError(consent, 'Pro odeslání potřebujeme váš souhlas se zpracováním údajů.');
      consent.focus();
      return;
    }
    status.textContent = 'Testovací verze: formulář zatím není propojen s e-mailem, data se neodesílají.';
    status.hidden = false;
  });

  $('.bb-pick-list').classList.add('bb-pick-list--live');
  pickWrap.classList.add('bb-picker--live');
  pickToggle.addEventListener('click', function () { setPanel(!pickWrap.classList.contains('bb-picker--open')); });
  $('.bb-picker__close').addEventListener('click', function () { setPanel(false); pickToggle.focus(); });
  $$('.bb-picker__clear').forEach(function (b) { b.addEventListener('click', clearAll); });

  choice();
})();
