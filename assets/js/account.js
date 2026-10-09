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

  /* ---------------------------- Account opening (soft opt-in stand-in) ---------------------------- */
  function softForm() {
    var host = document.getElementById('demoSoft');
    if (Demo.hasSoftForm) { host.innerHTML = ''; return; }
    host.innerHTML =
      '<div class="slot-note">Demo form — replaced by the OneTrust account-opening web form once softOptInCpId is set.</div>' +
      '<form class="demo-form" novalidate>' +
        // Soft opt-in: notice + opt-out at the point of collection (own, similar products only)
        '<div class="notice">As a Barclays customer, we\'ll send you emails about our own products and services that are similar to the ones you hold. ' +
          'You can tell us now if you\'d rather not hear from us, or unsubscribe at any time using the link in every email or in My Barclays.</div>' +
        '<label class="chk"><input type="checkbox" name="softOut" data-purpose-id="topic-similar"><span><strong>I don\'t want to receive offers about similar Barclays products</strong>' +
          '<span class="d">Leave this unticked to keep hearing about them.</span></span></label>' +
        // Explicit consent: third-party marketing is never covered by soft opt-in
        '<div class="optgroup"><div class="lbl">Optional</div>' +
        '<label class="chk"><input type="checkbox" name="partners" data-purpose-id="topic-partners"><span><strong>Yes, send me insurance offers from Barclays\' selected partners</strong>' +
          '<span class="d">We only send partner offers with your explicit consent.</span></span></label></div>' +
        '<div class="optgroup">' +
        '<label class="chk"><input type="checkbox" name="terms"><span><strong>I\'ve read and agree to the Easy Access Saver terms and conditions</strong></span></label></div>' +
        '<button type="submit" class="btn btn-navy" style="width:100%;margin-top:6px">Open my account</button>' +
      '</form>';

    var f = host.querySelector('form');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.terms.checked) { toast('Please accept the terms and conditions'); f.terms.focus(); return; }
      var lines = [];
      P.similar.rec = true;
      P.similar.on = !f.softOut.checked;
      Demo.log(P.similar.on
        ? 'Soft opt-in (implicit): Offers on products similar to yours → ACTIVE'
        : 'Opted out at collection: Offers on products similar to yours → OPT_OUT', 'Account opening');
      lines.push(P.similar.on ? 'You\'ll hear about similar Barclays products (soft opt-in).' : 'You opted out of offers on similar products.');
      if (f.partners.checked) {
        P.partners.on = P.partners.rec = true;
        Demo.log('Explicit consent: Partner offers → ACTIVE', 'Account opening');
        lines.push('You agreed to partner offers.');
      } else {
        lines.push('No partner offers — we didn\'t assume consent.');
      }
      state.marketing = true;
      state.opened = lines.join(' ');
      Demo.save();
      console.log('[demo] account opening payload', { similar: Demo.status(P.similar), partners: Demo.status(P.partners) });
      document.getElementById('openFlow').style.display = 'none';
      document.getElementById('openOkLine').textContent = lines.join(' ');
      document.getElementById('openOk').style.display = 'block';
      render();
    });
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
  if (state.opened) {
    document.getElementById('openFlow').style.display = 'none';
    document.getElementById('openOkLine').textContent = state.opened;
    document.getElementById('openOk').style.display = 'block';
  }
  render();
  showPanel(location.hash.slice(1));
})();
