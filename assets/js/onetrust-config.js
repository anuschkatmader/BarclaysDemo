/* ============================================================================
   ONETRUST CONFIGURATION — the only file you need to edit to go live.
   Loaded by both index.html and account.html.

   webformCpId     Collection point of the NEWSLETTER web form (explicit consent),
                   WITHOUT the "ot-" prefix. Renders on index.html into the pop-up
                   and the homepage sign-up band.
                   → also set data-id on the OtFormStub script in index.html.

   softOptInCpId   Collection point of the ACCOUNT OPENING web form (soft opt-in /
                   implicit consent), WITHOUT the "ot-" prefix. Renders on
                   account.html#open in the "Review and open" step.
                   → also set data-id on the OtFormStub script in account.html.

   prefCenterUrl   Optional hosted OneTrust preference centre URL. Shown on
                   account.html#marketing next to the built-in one.
   popupDelayMs    Delay before the newsletter pop-up opens after the cookie choice.

   Leave an ID empty to run that form with the built-in stand-in.
   ============================================================================ */
window.OT_CONFIG = {
  webformCpId:   "",
  softOptInCpId: "aaf0d808-8b79-4ec8-8f9b-8eab56daa3fe", // "Account Opening - Soft Opt-In" (button trigger id minus "ot-")
  prefCenterUrl: "",
  popupDelayMs:  3500
};

// Queue stub — must exist before OtFormStub.js loads.
window.OtSdk = window.OtSdk || function () { (OtSdk.q = OtSdk.q || []).push(arguments); };
