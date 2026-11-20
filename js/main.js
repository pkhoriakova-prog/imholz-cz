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

