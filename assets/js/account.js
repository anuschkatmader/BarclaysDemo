/* My Barclays: tabs (deep-linkable, e.g. account.html#open), account opening with
   SOFT OPT-IN (second OneTrust web form), and the preference centre. */
(function () {
  var OT = window.OT_CONFIG || {};
  var state = Demo.state;
  var P = state.purposes;
  var PANELS = ['profile', 'open', 'marketing', 'comms', 'privacy'];

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* ---------------------------- Greeting ---------------------------- */
  var hr = new Date().getHours();
  document.getElementById('greeting').textContent =
    (hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening') + ', Anuschka';

  /* ---------------------------- Tabs ---------------------------- */
  function showPanel(id) {
    if (PANELS.indexOf(id) < 0) id = 'profile';
    document.querySelectorAll('.side button').forEach(function (b) { b.classList.toggle('active', b.dataset.panel === id); });
    document.querySelectorAll('.panel').forEach(function (p) { p.classList.toggle('active', p.id === 'panel-' + id); });
    // Account-opening form: install only once its container is visible and laid out.
    if (id === 'open') requestAnimationFrame(function () { requestAnimationFrame(function () {
      Demo.installForm('#ot-container-softoptin', OT.softOptInCpId);
    }); });
  }
  document.querySelectorAll('.side button').forEach(function (b) {
    b.addEventListener('click', function () { history.replaceState(null, '', '#' + b.dataset.panel); showPanel(b.dataset.panel); });
  });
  window.addEventListener('hashchange', function () { showPanel(location.hash.slice(1)); window.scrollTo(0, 0); });

  /* ---------------------------- Account opening: shared outcome ---------------------------- */
  function recordOpening(optedOut, source) {
    P.similar.rec = true;
    P.similar.on = !optedOut;
    Demo.log(optedOut
      ? 'Refused at collection: Offers on products similar to yours → not granted'
      : 'Soft opt-in (implicit): Offers on products similar to yours → ACTIVE', source);
    state.marketing = true;
    state.opened = optedOut
      ? 'You told us you don\'t want offers about similar products, so we won\'t send them.'
      : 'You\'ll hear about Barclays products similar to yours. You can opt out any time in Marketing preferences.';
    Demo.save();
    render();
  }
  function showOpened() {
    document.getElementById('openFlow').style.display = 'none';
    document.getElementById('openOkLine').textContent = state.opened;
    document.getElementById('openOk').style.display = 'block';
  }

  /* ---------------------------- Stand-in form (only when softOptInCpId is empty) ---------------------------- */
  function softForm() {
    var host = document.getElementById('demoSoft');
    if (Demo.hasSoftForm) { host.innerHTML = ''; return; }
    host.innerHTML =
      '<div class="slot-note">Demo form — replaced by the OneTrust account-opening web form once softOptInCpId is set.</div>' +
      '<form class="demo-form" novalidate>' +
        '<label class="f" for="soft-name">Full name</label><input type="text" id="soft-name" value="Anuschka Mader">' +
        '<label class="f" for="soft-email">Email</label><input type="email" id="soft-email" value="anuschka.mader@example.com">' +
        '<p class="notice">As a Barclays customer, we\'ll send you emails about our own products and services that are similar to the ones you hold. ' +
          'If you\'d rather not hear from us, tick the box below, or unsubscribe at any time using the link in every email or in My Barclays.</p>' +
        '<label class="chk"><input type="checkbox" name="softOut"><span><strong>I don\'t want to receive offers about similar Barclays products</strong>' +
          '<span class="d">Leave this unticked to keep hearing about them.</span></span></label>' +
        '<button type="submit" class="btn btn-navy" style="width:100%;margin-top:6px">Open my account</button>' +
      '</form>';
    var f = host.querySelector('form');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      recordOpening(f.softOut.checked, 'Account opening (demo form)');
      showOpened();
    });
  }

  /* ---------------------------- Live OneTrust form: "Account Opening - Soft Opt-In" ----------------------------
     The purpose is a hidden checkbox with default value Checked (= implicit consent on submit).
     We move our visible opt-out box into the form above the submit button and keep the hidden
     field in sync with it: opt-out ticked → hidden purpose field unchecked.                      */
  var SOFT = '#ot-container-softoptin';
  var softWired = false;
  var optBox = document.getElementById('softOptOutBox'); // kept as a reference: it may move into a shadow root

  var THEME = [
    '{P}*{font-family:"Figtree","Helvetica Neue",Arial,sans-serif !important;box-shadow:none !important}',
    '{P}form,{P}fieldset{background:transparent !important;border:0 !important;margin:0 !important;padding:0 !important;max-width:none !important;width:100% !important}',
    '{P}label{color:#11132A !important;font-weight:700 !important;font-size:.88rem !important;margin-bottom:6px !important}',
    '{P}input[type=text],{P}input[type=email],{P}input[type=tel],{P}select,{P}textarea{width:100% !important;box-sizing:border-box !important;padding:12px 14px !important;border:1px solid #9FB1BD !important;border-radius:6px !important;background:#fff !important;color:#11132A !important;font-size:1rem !important;margin-bottom:14px !important}',
    '{P}input:focus,{P}select:focus,{P}textarea:focus{outline:2px solid #5091F2 !important;border-color:#5091F2 !important}',
    '{P}p,{P}span,{P}div{color:#11132A}',
    '{P}input[type=checkbox]{accent-color:#2F6FDB;width:18px;height:18px}',
    '{P}button,{P}input[type=submit]{background:#5091F2 !important;color:#0B1240 !important;border:0 !important;border-radius:30px !important;padding:14px 30px !important;font-weight:600 !important;font-size:1.05rem !important;width:100% !important;cursor:pointer !important;margin-top:8px !important}',
    '{P}button:hover,{P}input[type=submit]:hover{background:#6AA3F5 !important}',
    '{P}.soft-optout{display:flex !important;gap:10px;align-items:flex-start;margin:4px 0 14px !important;font-weight:400 !important}',
    '{P}.soft-optout strong{display:block;font-weight:700}',
    '{P}.soft-optout .d{display:block;color:#5B5F73 !important;font-size:.84rem;font-weight:400}',
    '{P}.soft-optout input{margin-top:3px;flex-shrink:0}'
  ].join('\n');

  function softRoot() {
    var c = document.querySelector(SOFT);
    return c && c.shadowRoot ? c.shadowRoot : c;
  }
  function injectTheme(root) {
    if (!document.getElementById('ot-soft-theme')) {
      var s = document.createElement('style'); s.id = 'ot-soft-theme';
      s.textContent = THEME.replace(/\{P\}/g, SOFT + ' ');
      document.head.appendChild(s);
    }
    if (root !== document.querySelector(SOFT) && !root.getElementById('ot-soft-theme')) {
      var t = document.createElement('style'); t.id = 'ot-soft-theme';
      t.textContent = THEME.replace(/\{P\}/g, '');
      root.appendChild(t); // form lives in a shadow root
    }
  }

  // Set a value the way a user would, so the form's own scripts see it.
  function setNative(el, prop, val) {
    var proto = Object.getPrototypeOf(el);
    var d = Object.getOwnPropertyDescriptor(proto, prop);
    if (d && d.set) d.set.call(el, val); else el[prop] = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // The hidden purpose checkbox = any checkbox in the form that isn't ours.
  function purposeFields(root) {
    return Array.prototype.filter.call(root.querySelectorAll('input[type=checkbox]'), function (i) { return i.id !== 'softOptOutBox'; });
  }
  function syncHidden() {
    var root = softRoot(); if (!root) return;
    var out = optBox;
    var fields = purposeFields(root);
    fields.forEach(function (f) { if (f.checked === out.checked) setNative(f, 'checked', !out.checked); });
    console.log('[soft opt-in] opt-out box ' + (out.checked ? 'TICKED' : 'unticked') + ' → hidden purpose field(s) now',
      fields.map(function (f) { return f.checked ? 'checked' : 'unchecked'; }), fields.length ? '' : '(none found — see otSoftDebug())');
  }

  function prefill(root) {
    root.querySelectorAll('input[type=email]').forEach(function (i) { if (!i.value) setNative(i, 'value', 'anuschka.mader@example.com'); });
    root.querySelectorAll('input[type=text]').forEach(function (i) {
      var hint = ((i.name || '') + ' ' + (i.id || '') + ' ' + (i.placeholder || '') + ' ' + (i.getAttribute('aria-label') || '')).toLowerCase();
      var lab = i.id && root.querySelector('label[for="' + i.id + '"]');
      if (lab) hint += ' ' + lab.textContent.toLowerCase();
      if (!i.value && /name/.test(hint)) setNative(i, 'value', 'Anuschka Mader');
    });
  }

  function wireSoftForm() {
    var root = softRoot();
    if (softWired || !root) return false;
    var submit = root.querySelector('button[type=submit], input[type=submit]') || (function () {
      var b = root.querySelectorAll('button'); return b[b.length - 1];
    })();
    if (!submit || !root.querySelector('input')) return false; // not rendered yet
    softWired = true;

    injectTheme(root);
    prefill(root);

    // Our opt-out box goes inside the form, right above the submit button.
    var opt = document.getElementById('softOptOut');
    opt.hidden = false;
    submit.parentNode.insertBefore(opt, submit);
    opt.querySelector('input').addEventListener('change', syncHidden);

    // Re-sync at the last moment, in case the form re-rendered the hidden field.
    var form = submit.closest('form');
    function onSubmit() {
      syncHidden();
      var em = root.querySelector('input[type=email]');
      if (em && !em.value) return;
      var optedOut = optBox.checked;
      setTimeout(function () { recordOpening(optedOut, 'Account opening (OneTrust)'); }, 0);
      setTimeout(showOpened, 2500); // leave OneTrust's own confirmation on screen briefly
    }
    submit.addEventListener('click', syncHidden, true);
    if (form) form.addEventListener('submit', onSubmit, true);
    else submit.addEventListener('click', onSubmit);

    document.getElementById('otSoftFallback').hidden = true;
    var n = purposeFields(root).length;
    console.log('[soft opt-in] OneTrust form wired. Hidden purpose checkbox(es) found: ' + n +
      (n ? ' — the opt-out box can untick them.' : ' — the form does not render the hidden field; the opt-out box cannot change what OneTrust records.'));
    otSoftDebug();
    return true;
  }

  // Console helper: lists every field the OneTrust form rendered.
  window.otSoftDebug = function () {
    var root = softRoot(); if (!root) return console.log('No form container');
    console.table(Array.prototype.map.call(root.querySelectorAll('input, select, textarea, button'), function (e) {
      return { tag: e.tagName.toLowerCase(), type: e.type, id: e.id, name: e.name, value: e.value,
               checked: e.type === 'checkbox' ? e.checked : '', visible: !!(e.offsetWidth || e.offsetHeight) };
    }));
  };

  function watchSoftForm() {
    if (!Demo.hasSoftForm) return;
    var c = document.querySelector(SOFT);
    var mo = new MutationObserver(function () { if (wireSoftForm()) mo.disconnect(); });
    mo.observe(c, { childList: true, subtree: true });
    var tries = 0, poll = setInterval(function () { // also catches shadow-root rendering
      tries++;
      if (wireSoftForm() || softWired) { clearInterval(poll); mo.disconnect(); }
      else if (tries > 100 && document.getElementById('panel-open').classList.contains('active')) {
        clearInterval(poll); document.getElementById('otSoftFallback').hidden = false;
      }
    }, 200);
  }

  document.getElementById('notesToggle').addEventListener('click', function () {
    var n = document.getElementById('notes'); n.hidden = !n.hidden;
    this.setAttribute('aria-expanded', String(!n.hidden));
  });

  /* ---------------------------- Preference centre ---------------------------- */
  function render() {
    var pl = document.getElementById('purposeList');
    pl.innerHTML = '';
    Object.keys(P).forEach(function (k) {
      var p = P[k], st = Demo.status(p);
      var row = document.createElement('div'); row.className = 'row';
      row.innerHTML = '<div><div class="t">' + esc(p.t) + '</div><div class="d">' + esc(p.d) + '</div>' +
        '<div class="chips"><span class="chip basis-' + p.basis + '">' + (p.basis === 'soft' ? 'Soft opt-in · legitimate interests' : 'Consent') + '</span>' +
        '<span class="chip st-' + st + '">' + st + '</span></div></div>' +
        '<label class="tgl"><input type="checkbox" data-purpose-id="topic-' + k + '" ' + (p.on ? 'checked' : '') + '><span></span></label>';
      row.querySelector('input').addEventListener('change', function (e) { p.on = e.target.checked; });
      pl.appendChild(row);
    });

    var cl = document.getElementById('channelList');
    cl.innerHTML = '';
    Object.keys(state.channels).forEach(function (c) {
      var lab = document.createElement('label');
      lab.className = state.channels[c] ? 'on' : '';
      lab.innerHTML = '<input type="checkbox" data-purpose-id="channel-' + c.toLowerCase() + '" ' + (state.channels[c] ? 'checked' : '') + '>' + esc(c);
      lab.querySelector('input').addEventListener('change', function (e) { state.channels[c] = e.target.checked; lab.classList.toggle('on', e.target.checked); });
      cl.appendChild(lab);
    });

    document.querySelectorAll('#freqSeg button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === state.freq); });
    document.getElementById('masterOpt').checked = state.marketing;
    document.getElementById('prefDetail').classList.toggle('muted-all', !state.marketing);

    document.getElementById('historyBody').innerHTML = state.history.map(function (h) {
      return '<tr><td>' + esc(h.d) + '</td><td>' + esc(h.c) + '</td><td>' + esc(h.s) + '</td></tr>';
    }).join('');

    var on = Object.keys(P).filter(function (k) { return P[k].on; }).length;
    var ch = Object.keys(state.channels).filter(function (k) { return state.channels[k]; });
    document.getElementById('summaryLine').textContent = state.marketing
      ? on + ' of ' + Object.keys(P).length + ' topics on · via ' + (ch.join(', ') || 'no channels') + ' · ' + state.freq
      : 'You have opted out of all marketing.';

    var c = state.cookies;
    document.getElementById('cookieSummary').textContent = !c ? 'You haven\'t made a cookie choice on this device yet.'
      : c.ot ? 'Your cookie choices are managed by OneTrust on this device.'
      : 'Allowed on this device: strictly necessary' + (c.perf ? ', performance' : '') + (c.func ? ', functional' : '') + (c.targ ? ', targeting' : '') + '.';
  }

  document.getElementById('masterOpt').addEventListener('change', function (e) {
    state.marketing = e.target.checked;
    document.getElementById('prefDetail').classList.toggle('muted-all', !state.marketing);
  });
  document.querySelectorAll('#freqSeg button').forEach(function (b) {
    b.addEventListener('click', function () { state.freq = b.dataset.v; render(); });
  });
  document.querySelectorAll('#fmtSeg button').forEach(function (b) {
    b.addEventListener('click', function () { document.querySelectorAll('#fmtSeg button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); });
  });
  document.querySelectorAll('[data-pill]').forEach(function (inp) {
    inp.addEventListener('change', function () { var p = inp.closest('.row').querySelector('.pill'); if (p) p.textContent = inp.checked ? 'On' : 'Off'; });
  });

  // Save: one history row per purpose whose status actually changed.
  var lastSaved = {};
  function snapshot() { Object.keys(P).forEach(function (k) { lastSaved[k] = Demo.status(P[k]); }); }
  snapshot();
  document.getElementById('saveBtn').addEventListener('click', function () {
    var changed = 0;
    if (!state.marketing) {
      Object.keys(P).forEach(function (k) { if (P[k].on) { P[k].on = false; } });
    }
    Object.keys(P).forEach(function (k) {
      if (P[k].on) P[k].rec = true;
      var st = Demo.status(P[k]);
      if (st !== lastSaved[k]) { Demo.log(P[k].t + ' → ' + st, 'My Barclays preference centre'); changed++; }
    });
    if (!changed) Demo.log('Preferences re-confirmed · ' + state.freq, 'My Barclays preference centre');
    Demo.save(); snapshot(); render();
    document.getElementById('prefStamp').textContent = 'Last saved ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    toast('Your preferences have been saved');
    console.log('[demo] preference payload', JSON.parse(JSON.stringify(state)));
  });

  // Cookie choices made in the banner update the Privacy tab summary.
  document.addEventListener('demo:cookies-decided', render);
  document.addEventListener('click', function (e) { if (e.target.closest('[data-ck]')) setTimeout(render, 0); });

  /* ---------------------------- Init ---------------------------- */
  if (OT.prefCenterUrl) {
    document.getElementById('prefEmbedWrap').style.display = 'block';
    document.getElementById('prefEmbed').src = OT.prefCenterUrl;
  }
  softForm();
  watchSoftForm();
  if (state.opened) showOpened();
  render();
  showPanel(location.hash.slice(1));
})();
