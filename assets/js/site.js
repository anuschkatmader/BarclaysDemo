/* Barclays UCPM demo — shared behaviour for every page.
   Demo state lives in the visitor's browser (localStorage), so choices made on
   the homepage show up in My Barclays. Use "Reset demo" in the footer to start over. */
(function () {
  var OT = window.OT_CONFIG || {};
  var KEY = 'bcDemo.v2';

  /* ---------------------------- Demo state ----------------------------
     basis: 'consent' = explicit opt-in (unticked box / clear action)
            'soft'    = soft opt-in: legitimate interests + PECR reg. 22, implicit
                        consent captured at account opening, opt-out only
     rec:   true once a record exists in OneTrust (drives the status shown)    */
  var DEFAULT_STATE = {
    marketing: true,
    purposes: {
      similar:  { t: "Offers on products similar to yours", d: "Our own savings, account and card offers related to the products you hold. You can opt out at any time.", on: false, rec: false, basis: 'soft' },
      offers:   { t: "Product news & offers", d: "New products, rate changes and offers on accounts, cards, loans and mortgages.", on: true, rec: true, basis: 'consent' },
      tips:     { t: "Money tips & financial wellbeing", d: "Guides on budgeting, saving and planning for big life moments.", on: false, rec: false, basis: 'consent' },
      partners: { t: "Partner offers", d: "Insurance and other offers from selected partners. Always needs your explicit consent.", on: false, rec: false, basis: 'consent' },
      research: { t: "Research & surveys", d: "Help shape our products by sharing your views now and then.", on: false, rec: false, basis: 'consent' }
    },
    channels: { Email: true, SMS: false, Phone: false, Post: false, "In-app": true },
    freq: "monthly",
    cookies: null,
    history: [
      { d: "12 Mar 2017", c: "Explicit consent: Product news & offers → ACTIVE", s: "Online banking registration" }
    ]
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
  var state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  window.Demo = {
    state: state,
    save: save,
    today: function () { return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); },
    log: function (change, source) { state.history.unshift({ d: Demo.today(), c: change, s: source }); save(); },
    reset: function () {
      try { localStorage.removeItem(KEY); sessionStorage.clear(); } catch (e) {}
      location.href = 'index.html';
    }
  };

  /* ---------------------------- Toast ---------------------------- */
  var toastEl, toastT;
  window.toast = function (msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  };

  /* ---------------------------- OneTrust web form ---------------------------- */
  function whenOTReady(cb) {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (window.OneTrust && OneTrust.webform && OneTrust.webform.InstallCP) { clearInterval(timer); cb(); }
      else if (tries > 150) { clearInterval(timer); console.warn('OneTrust web form SDK not found — is the OtFormStub script uncommented?'); }
    }, 80);
  }
  var installed = {};
  Demo.hasWebform = !!OT.webformCpId;
  Demo.hasSoftForm = !!OT.softOptInCpId;
  // Install a collection point into a VISIBLE container, once per container.
  Demo.installForm = function (target, cpId) {
    cpId = cpId || OT.webformCpId;
    if (!cpId || installed[target]) return;
    installed[target] = true; // never re-render in a loop
    whenOTReady(function () { OneTrust.webform.InstallCP(cpId, { target: target }); });
  };

  // OneTrust-style status for a purpose (what the data subject profile would show).
  Demo.status = function (p) {
    if (p.on) return 'ACTIVE';
    if (!p.rec) return 'NO_CONSENT';
    return p.basis === 'soft' ? 'OPT_OUT' : 'WITHDRAWN';
  };
  window.addEventListener('OnetrustFormLoaded', function (e) { console.log('OnetrustFormLoaded', e.detail); });

  /* ---------------------------- Cookie banner ---------------------------- */
  var BANNER = ''
    + '<div class="overlay" id="cookieModal" role="dialog" aria-modal="true" aria-labelledby="ckTitle">'
    + ' <div class="modal">'
    + '  <div class="head"><div class="brand">Barclays</div><h2 id="ckTitle">We value your privacy</h2></div>'
    + '  <div class="body">'
    + '   <div id="ckMain">'
    + '    <p>We use cookies to make our website work, to understand how you use it and to show you relevant content and ads. You can accept all cookies, reject non-essential ones, or choose which to allow.</p>'
    + '    <div class="btn-row"><button class="btn btn-navy" data-ck="all">Accept all</button><button class="btn btn-navy" data-ck="none">Reject non-essential</button></div>'
    + '    <div class="btn-row" style="margin-top:10px"><button class="btn btn-ghost" data-ck="detail">Manage settings</button></div>'
    + '   </div>'
    + '   <div id="ckDetail" style="display:none">'
    + '    <div class="ck-cat"><div><h4>Strictly necessary</h4><p>Needed for security and for the site to work.</p></div><span class="always">Always on</span></div>'
    + '    <div class="ck-cat"><div><h4>Performance</h4><p>Help us understand how the site is used so we can improve it.</p></div><label class="tgl"><input type="checkbox" id="ckPerf"><span></span></label></div>'
    + '    <div class="ck-cat"><div><h4>Functional</h4><p>Remember your choices, like region and language.</p></div><label class="tgl"><input type="checkbox" id="ckFunc"><span></span></label></div>'
    + '    <div class="ck-cat"><div><h4>Targeting</h4><p>Show you relevant ads on other sites.</p></div><label class="tgl"><input type="checkbox" id="ckTarg"><span></span></label></div>'
    + '    <div class="btn-row" style="margin-top:14px"><button class="btn btn-navy" data-ck="custom">Confirm my choices</button><button class="btn btn-ghost" data-ck="all">Accept all</button></div>'
    + '   </div>'
    + '  </div>'
    + ' </div>'
    + '</div>';

  function realBannerPresent() { return !!document.getElementById('onetrust-banner-sdk') || !!document.getElementById('onetrust-consent-sdk'); }
  function cookieModal() { return document.getElementById('cookieModal'); }

  function showCookieDetail() {
    var c = state.cookies || {};
    document.getElementById('ckPerf').checked = !!c.perf;
    document.getElementById('ckFunc').checked = !!c.func;
    document.getElementById('ckTarg').checked = !!c.targ;
    document.getElementById('ckMain').style.display = 'none';
    document.getElementById('ckDetail').style.display = 'block';
  }
  window.openCookieSettings = function () {
    if (window.OneTrust && typeof OneTrust.ToggleInfoDisplay === 'function') { OneTrust.ToggleInfoDisplay(); return; }
    showCookieDetail();
    cookieModal().classList.add('show');
  };
  function cookieChoice(mode) {
    var first = !state.cookies;
    if (mode === 'all') state.cookies = { perf: 1, func: 1, targ: 1 };
    else if (mode === 'none') state.cookies = { perf: 0, func: 0, targ: 0 };
    else state.cookies = {
      perf: +document.getElementById('ckPerf').checked,
      func: +document.getElementById('ckFunc').checked,
      targ: +document.getElementById('ckTarg').checked
    };
    save();
    cookieModal().classList.remove('show');
    toast(mode === 'all' ? 'All cookies accepted' : mode === 'none' ? 'Non-essential cookies rejected' : 'Cookie choices saved');
    if (first) document.dispatchEvent(new CustomEvent('demo:cookies-decided'));
  }

  /* ---------------------------- Boot ---------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    document.body.insertAdjacentHTML('beforeend', BANNER);
    cookieModal().addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]'); if (!b) return;
      if (b.dataset.ck === 'detail') showCookieDetail(); else cookieChoice(b.dataset.ck);
    });
    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); openCookieSettings(); });
    });
    document.querySelectorAll('[data-reset-demo]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); Demo.reset(); });
    });

    // Show the demo banner once, unless consent was already given or the real OneTrust banner takes over.
    setTimeout(function () {
      if (state.cookies) { document.dispatchEvent(new CustomEvent('demo:cookies-ready')); return; }
      if (realBannerPresent()) { state.cookies = { ot: 1 }; save(); document.dispatchEvent(new CustomEvent('demo:cookies-decided')); return; }
      cookieModal().classList.add('show');
    }, 700);
  });
})();
