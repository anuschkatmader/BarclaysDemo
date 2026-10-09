/* Homepage: newsletter sign-up in the "Money tips, straight to your inbox" section.
   OneTrust collection point "Newsletter Pop-Up Banking" (explicit consent) renders into
   #ot-container-main. No automatic pop-up. We only restyle the form — we never change
   what the visitor ticks, so every purpose is recorded exactly as they chose it. */
(function () {
  var OT = window.OT_CONFIG || {};
  var state = Demo.state;
  var SEL = '#ot-container-main';

  /* ---------------------------- Stand-in form (only when webformCpId is empty) ---------------------------- */
  function demoForm() {
    var host = document.getElementById('demoInline');
    if (Demo.hasWebform) { host.innerHTML = ''; return; }
    host.innerHTML =
      '<div class="slot-note">Demo form — replaced by the OneTrust web form once webformCpId is set.</div>' +
      '<form class="demo-form" novalidate>' +
        '<div class="fields">' +
          '<label class="f" for="nl-name">First name</label><input type="text" id="nl-name" autocomplete="off">' +
          '<label class="f" for="nl-email">Email address</label><input type="email" id="nl-email" required autocomplete="off">' +
          '<label class="chk"><input type="checkbox" name="tips"><span><strong>Money tips &amp; financial wellbeing</strong><span class="d">Guides on budgeting, saving and planning ahead.</span></span></label>' +
          '<label class="chk"><input type="checkbox" name="offers"><span><strong>Product news &amp; offers</strong><span class="d">New products, rate changes and offers.</span></span></label>' +
          '<button type="submit" class="btn btn-navy" style="width:100%">Sign me up</button>' +
        '</div>' +
        '<div class="form-ok"><div class="tick">✓</div><strong>You\'re signed up</strong></div>' +
      '</form>';
    var f = host.querySelector('form');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var em = f.querySelector('input[type=email]');
      if (!em.value || em.value.indexOf('@') < 1) { em.focus(); return; }
      var picked = [];
      if (f.tips.checked) picked.push('tips');
      if (f.offers.checked) picked.push('offers');
      if (!picked.length) { toast('Please choose at least one topic'); return; }
      record(picked, 'Homepage sign-up (demo form)');
      f.querySelector('.fields').style.display = 'none';
      f.querySelector('.form-ok').style.display = 'block';
    });
  }

  // Mirror explicit opt-ins into the demo's preference centre and consent history.
  function record(keys, source) {
    if (!keys.length) return;
    var names = keys.map(function (k) { state.purposes[k].on = state.purposes[k].rec = true; return state.purposes[k].t; });
    state.marketing = true;
    Demo.log('Explicit consent: ' + names.join(', ') + ' → ACTIVE', source);
  }

  /* ---------------------------- Live OneTrust form: theme only ---------------------------- */
  var THEME = [
    '{P}*:not(input):not(select):not(textarea):not(button){border:0 !important;background:transparent !important;box-shadow:none !important;outline:0 !important}',
    '{P}*{font-family:"Figtree","Helvetica Neue",Arial,sans-serif !important}',
    '{P}form,{P}fieldset{margin:0 !important;padding:0 !important;max-width:none !important;width:100% !important}',
    '{P}form > *,{P}fieldset > *{max-width:none !important}',
    '{P}label{color:#11132A !important;font-weight:700 !important;font-size:.88rem !important}',
    '{P}p,{P}span,{P}div{color:#11132A !important;font-size:.95rem;line-height:1.5}',
    '{P}input[type=text],{P}input[type=email],{P}input[type=tel],{P}select,{P}textarea{width:100% !important;box-sizing:border-box !important;padding:12px 14px !important;border:1px solid #9FB1BD !important;border-radius:6px !important;background:#fff !important;color:#11132A !important;font-size:1rem !important;margin:0 0 16px !important}',
    '{P}input:focus,{P}select:focus,{P}textarea:focus{outline:2px solid #5091F2 !important;border-color:#5091F2 !important}',
    '{P}input[type=checkbox]{accent-color:#2F6FDB;width:18px !important;height:18px !important;flex-shrink:0;margin:0 10px 0 0 !important;vertical-align:-3px}',
    '{P}button,{P}input[type=submit]{display:block;background:#5091F2 !important;color:#0B1240 !important;border:0 !important;border-radius:30px !important;padding:14px 30px !important;font-weight:600 !important;font-size:1.05rem !important;width:100% !important;cursor:pointer !important;margin:8px 0 0 !important;height:auto !important;min-height:0 !important;line-height:1.2 !important;flex:none !important;align-self:stretch !important}',
    '{P}button *{font-size:1.05rem !important;font-weight:600 !important;color:#0B1240 !important;line-height:1.2 !important}',
    '{P}button,{P}input[type=submit]{box-sizing:border-box !important;max-width:100% !important;border-top-left-radius:30px !important;border-top-right-radius:30px !important;border-bottom-left-radius:30px !important;border-bottom-right-radius:30px !important;clip-path:none !important;transform:none !important}',
    '{P}form *:not(input):not(select):not(textarea){overflow:visible !important;clip-path:none !important}',
    '{P}button:hover,{P}input[type=submit]:hover{background:#6AA3F5 !important}'
  ].join('\n');

  var frameWarned = false;
  function formRoot() {
    var c = document.querySelector(SEL);
    if (!c) return null;
    if (c.shadowRoot) return c.shadowRoot;
    var f = c.querySelector('iframe');
    if (f) {
      f.style.border = '0'; f.style.width = '100%'; f.style.display = 'block'; f.style.background = 'transparent';
      var d = null;
      try { d = f.contentDocument; } catch (e) {}
      if (d && d.body && d.querySelector('input')) return d;
      if (!frameWarned && !d) { frameWarned = true; console.warn('[newsletter] Form is in a OneTrust-hosted frame — style it in the web form\'s Branding tab.'); }
      return null;
    }
    return c;
  }
  function injectTheme(root) {
    if (!document.getElementById('ot-main-theme')) {
      var s = document.createElement('style'); s.id = 'ot-main-theme';
      s.textContent = THEME.replace(/\{P\}/g, SEL + ' ');
      document.head.appendChild(s);
    }
    if (root !== document.querySelector(SEL) && !root.getElementById('ot-main-theme')) {
      var t = document.createElement('style'); t.id = 'ot-main-theme';
      t.textContent = THEME.replace(/\{P\}/g, '');
      (root.head || root).appendChild(t);
    }
  }
  function tidyTop(root) {
    var c = document.querySelector(SEL);
    var el = root.querySelector('label, input[type=text], input[type=email]');
    while (el && el !== c && el !== root) {
      el.style.marginTop = '0'; el.style.paddingTop = '0';
      var sib = el.previousElementSibling;
      while (sib) {
        if (!sib.textContent.trim() && !sib.querySelector('input, select, textarea, img')) sib.style.display = 'none';
        sib = sib.previousElementSibling;
      }
      el = el.parentElement;
    }
  }
  function imp(el, props) { Object.keys(props).forEach(function (k) { el.style.setProperty(k, props[k], 'important'); }); }
  function fitButton(btn, container) {
    imp(btn, { 'box-sizing': 'border-box', 'width': '100%', 'max-width': '100%', 'margin-left': '0', 'margin-right': '0',
               'border-radius': '30px', 'height': 'auto', 'min-height': '0', 'padding': '14px 30px', 'display': 'block' });
    var el = btn.parentElement;
    while (el && el !== container) { imp(el, { 'overflow': 'visible', 'max-width': '100%', 'box-sizing': 'border-box' }); el = el.parentElement; }
  }
  function labelText(root, box) {
    var l = (box.id && root.querySelector('label[for="' + box.id + '"]')) || box.closest('label') || box.parentElement;
    return l ? l.textContent.toLowerCase() : '';
  }

  var wired = false;
  function wire() {
    var root = formRoot();
    if (wired || !root) return false;
    var submit = root.querySelector('button[type=submit], input[type=submit]') || (function () { var b = root.querySelectorAll('button'); return b[b.length - 1]; })();
    if (!submit || !root.querySelector('input')) return false;
    wired = true;
    injectTheme(root);
    tidyTop(root);
    fitButton(submit, document.querySelector(SEL));
    var form = submit.closest('form');
    var wrap = submit.parentNode;
    if (wrap && wrap !== form) { wrap.style.display = 'block'; wrap.style.width = '100%'; wrap.style.boxSizing = 'border-box'; wrap.style.padding = '0'; wrap.style.overflow = 'visible'; }

    // Read-only: note which topics were ticked, for the demo's own preference centre.
    function onSubmit() {
      var em = root.querySelector('input[type=email]');
      if (em && !em.value) return;
      var keys = [];
      root.querySelectorAll('input[type=checkbox]:checked').forEach(function (b) {
        var t = labelText(root, b);
        if (/money tips|wellbeing/.test(t)) keys.push('tips');
        else if (/product news|offers/.test(t)) keys.push('offers');
      });
      setTimeout(function () { record(keys, 'Homepage sign-up (OneTrust)'); }, 0);
    }
    if (form) form.addEventListener('submit', onSubmit, true);
    else submit.addEventListener('click', onSubmit);
    document.getElementById('otMainFallback').hidden = true;
    console.log('[newsletter] OneTrust form wired and styled.');
    return true;
  }

  function watch() {
    if (!Demo.hasWebform) return;
    var c = document.querySelector(SEL);
    var mo = new MutationObserver(function () { if (wire()) mo.disconnect(); });
    mo.observe(c, { childList: true, subtree: true });
    var tries = 0, poll = setInterval(function () {
      tries++;
      if (wire() || wired) { clearInterval(poll); mo.disconnect(); }
      else if (tries > 100) { clearInterval(poll); document.getElementById('otMainFallback').hidden = false; }
    }, 200);
  }

  document.addEventListener('DOMContentLoaded', function () {
    demoForm();
    Demo.installForm(SEL, OT.webformCpId);
    watch();
  });
})();
