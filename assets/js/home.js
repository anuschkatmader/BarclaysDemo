/* Homepage: newsletter pop-up + inline sign-up (OneTrust web form or demo stand-in). */
(function () {
  var OT = window.OT_CONFIG || {};
  var state = Demo.state;

  /* ---------------------------- Demo form (stand-in) ---------------------------- */
  function demoForm(hostId, ctx) {
    var host = document.getElementById(hostId);
    if (Demo.hasWebform) { host.innerHTML = ''; return; }
    host.innerHTML =
      '<div class="slot-note">Demo form — replaced by the OneTrust embedded web form once webformCpId is set.</div>' +
      '<form class="demo-form" novalidate>' +
        '<div class="fields">' +
          '<label class="f" for="' + ctx + '-name">First name</label><input type="text" id="' + ctx + '-name" autocomplete="off">' +
          '<label class="f" for="' + ctx + '-email">Email address</label><input type="email" id="' + ctx + '-email" required autocomplete="off">' +
          '<label class="chk"><input type="checkbox" name="tips"><span><strong>Money tips &amp; financial wellbeing</strong><span class="d">Guides on budgeting, saving and planning ahead.</span></span></label>' +
          '<label class="chk"><input type="checkbox" name="offers"><span><strong>Product news &amp; offers</strong><span class="d">New products, rate changes and offers.</span></span></label>' +
          '<button type="submit" class="btn btn-navy" style="width:100%">Sign me up</button>' +
          '<p class="fine">You can unsubscribe at any time using the link in our emails or in My Barclays. See our privacy policy for how we use your data.</p>' +
        '</div>' +
        '<div class="form-ok"><div class="tick">✓</div><strong>You\'re signed up</strong><p class="fine">We\'ve recorded your choices. You\'ll see them in My Barclays → Marketing preferences.</p></div>' +
      '</form>';
    var f = host.querySelector('form');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var em = f.querySelector('input[type=email]');
      if (!em.value || em.value.indexOf('@') < 1) { em.focus(); em.style.borderColor = '#C62828'; return; }
      var picked = [];
      // Explicit consent: only what the visitor actively ticked.
      if (f.tips.checked) { picked.push('Money tips & financial wellbeing'); state.purposes.tips.on = state.purposes.tips.rec = true; }
      if (f.offers.checked) { picked.push('Product news & offers'); state.purposes.offers.on = state.purposes.offers.rec = true; }
      if (!picked.length) { toast('Please choose at least one topic'); return; }
      state.marketing = true;
      Demo.log('Explicit consent: ' + picked.join(', ') + ' → ACTIVE', ctx === 'pop' ? 'Newsletter pop-up' : 'Homepage sign-up');
      f.querySelector('.fields').style.display = 'none';
      f.querySelector('.form-ok').style.display = 'block';
      try { sessionStorage.setItem('bcDemo.popupDone', '1'); } catch (err) {}
      console.log('[demo] consent payload', { email: em.value, purposes: picked, source: ctx });
      if (ctx === 'pop') setTimeout(closeNewsletter, 2200);
    });
  }

  /* ---------------------------- Pop-up ---------------------------- */
  function popupDone() { try { return sessionStorage.getItem('bcDemo.popupDone') === '1'; } catch (e) { return false; } }
  window.openNewsletter = function () {
    try { sessionStorage.setItem('bcDemo.popupDone', '1'); } catch (e) {}
    document.getElementById('nlModal').classList.add('show');
    // Install only once the container is visible and laid out.
    requestAnimationFrame(function () { requestAnimationFrame(function () { Demo.installForm('#ot-container'); }); });
  };
  window.closeNewsletter = function () { document.getElementById('nlModal').classList.remove('show'); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNewsletter(); });

  // Pop-up once per browser session, a few seconds after the cookie choice.
  function schedulePopup() {
    if (popupDone()) return;
    setTimeout(function () { if (!popupDone()) openNewsletter(); }, OT.popupDelayMs || 3500);
  }
  document.addEventListener('demo:cookies-decided', schedulePopup);
  document.addEventListener('demo:cookies-ready', schedulePopup);

  document.addEventListener('DOMContentLoaded', function () {
    demoForm('demoPopup', 'pop');
    demoForm('demoInline', 'inline');
    Demo.installForm('#ot-container-inline');
  });
})();
