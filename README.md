# Barclays — OneTrust CMP / UCPM demo

Clickable mock-up for a OneTrust consent and preference management demo.
**Demo only — not affiliated with Barclays.** No login, no credentials, no balances
or payments; the persona (Anuschka Mader) is already "signed in".

## Structure

```
index.html                 Homepage: cookie banner → newsletter pop-up → inline sign-up
account.html               My Barclays (second layer): details, marketing preferences,
                           communication settings, privacy & cookies
assets/js/onetrust-config.js   ← the only file to edit for OneTrust IDs
assets/js/site.js          Shared: cookie banner, demo state, web form installer
assets/js/home.js          Pop-up + inline sign-up
assets/js/account.js       Tabs + preference centre
assets/css/site.css        All styles (palette tokens at the top)
assets/img/                Photos (see below)
get-images.sh / .ps1       Downloads the photos into assets/img
```

## Deploy

**GitHub Pages:** push the folder, then Settings → Pages → *Deploy from a branch* →
`main` → `/ (root)`. Open the Pages URL (`https://<user>.github.io/<repo>/`), not the
file view. `.nojekyll` is included so the assets folder is served as-is.

## Photos

Every `<img>` points at `assets/img/<name>.jpg` first and falls back to the same photo
on the Unsplash CDN, so the site works straight away. To serve them from the repo:

```bash
bash get-images.sh        # macOS / Linux
.\get-images.ps1          # Windows PowerShell
```

Then commit `assets/img`. To swap a photo, replace the file with the same name
(and update `data-cdn` on the `<img>` if you want the fallback to match).

| File | Used on |
|---|---|
| hero.jpg | Homepage hero |
| streaming.jpg | Offers & subscriptions card |
| card-payment.jpg | Platinum card feature |
| family-cycling.jpg | "Good money habits" section |
| mortgage.jpg | Mortgage section |
| newsletter.jpg | Newsletter pop-up header |
| account.jpg | My Barclays header |

All photos are from Unsplash (free to use under the Unsplash licence).

## OneTrust wiring

1. **Cookie banner (CMP):** uncomment the `otSDKStub` block in the `<head>` of both
   pages and set `data-domain-script`. The demo banner steps aside once the real one loads.
2. **Embedded web form (UCPM):** uncomment the `OtFormStub` block in `index.html`
   (set `data-id`) and set `webformCpId` in `assets/js/onetrust-config.js` — the
   form ID without the `ot-` prefix. It renders into the pop-up (installed only when
   the pop-up opens) and the homepage sign-up band.
3. **Account opening web form (soft opt-in):** a *second* web form / collection point.
   Uncomment the `OtFormStub` block in `account.html` (set its `data-id`) and set
   `softOptInCpId`. It renders into `#ot-container-softoptin` on `account.html#open`,
   installed when that tab is first shown.
4. **Hosted preference centre (optional):** set `prefCenterUrl`. It appears on
   `account.html#marketing` next to the built-in preference centre, so you can show both.

## Demo flow

1. Open the homepage → cookie banner (centred).
2. After the choice, the newsletter pop-up opens (once per browser session).
3. Sign up → the opt-in is written to the consent history.
4. **Log in** → *Open an account* → "Review and open" step = **soft opt-in**: own-products
   notice, unticked opt-out box, separate unticked explicit opt-in for partner offers.
   Leave the opt-out unticked → *Offers on similar products* = `ACTIVE` (implicit).
5. *Marketing preferences* shows each purpose with its lawful basis (Soft opt-in vs
   Consent) and status (`ACTIVE`, `OPT_OUT`, `WITHDRAWN`, `NO_CONSENT`). Opt out and
   save → `OPT_OUT`, logged in the consent history next to the earlier receipts.
6. *Reset demo* in the footer clears everything for the next run.

*Presenter notes* (button under the account-opening form) list the matching OneTrust
setup: implicit consent on the purpose, expiry, lawful-basis attribute, and statuses.

Deep links: `account.html#open`, `#marketing`, `#comms`, `#privacy`.
Toggles carry `data-purpose-id` attributes (`topic-*`, `channel-*`) for mapping to
OneTrust purposes later.
