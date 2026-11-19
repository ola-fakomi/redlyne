# Chrome Web Store Launch Checklist

## Files in this folder

| File | Status |
|---|---|
| `redlyne-v0.0.2.zip` | ✅ Ready to upload |
| `listing.md` | ✅ Copy-paste into CWS dashboard |
| `privacy-policy.html` | ✅ Host this (see step 3 below) |
| `screenshots/` | ⬜ Take 2–3 screenshots (see below) |

---

## Step-by-step submission

### 1. Developer account
- Go to [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
- Sign in with a Google account
- Pay the one-time $5 developer registration fee if not already registered

### 2. Create a new item
- Click **New item** → upload `redlyne-v0.0.2.zip`
- CWS will auto-read the manifest and icons

### 3. Host the privacy policy
The easiest option — enable GitHub Pages on the repo:
1. Repo Settings → Pages → Source: Deploy from branch `main`, folder `/docs`
2. Create `docs/privacy.html` (copy content from `store/privacy-policy.html`)
3. Privacy policy URL: `https://ola-fakomi.github.io/redlyne/privacy`

### 4. Fill in the listing
Copy from `store/listing.md`:
- **Short description** (132 chars): paste the short description line
- **Detailed description**: paste the full description block
- **Category**: Developer Tools
- **Language**: English (United States)
- **Homepage URL**: https://github.com/ola-fakomi/redlyne
- **Support URL**: https://github.com/ola-fakomi/redlyne/issues
- **Privacy policy URL**: your hosted privacy policy URL

### 5. Screenshots (required — min 1, max 5)
Size must be exactly **1280×800** or **640×400** pixels, PNG or JPG.

Suggested shots:
1. **Panel open on a real page** — shows the Design tab with an element selected, Fill + Typography sections visible
2. **Code tab** — shows the Code tab with some modified properties highlighted in blue
3. **Copy changes / prompt output** — shows the copied prompt pasted into a terminal or Claude Code

**How to take them:**
1. Load the extension in Chrome (Developer mode, `output/chrome-mv3/`)
2. Open any real website
3. Select an element, make a couple of changes
4. Use Chrome DevTools device toolbar → set to 1280×800 → take a screenshot
   Or: press `Cmd+Shift+4` on Mac and drag exactly 1280×800

Save screenshots to `store/screenshots/`.

### 6. Promotional tile (optional but recommended)
Size: **440×280 PNG** — shown on search results pages.
Consider creating this in Figma with the logo + a headline + a mini panel mockup.

### 7. Submit for review
- Click **Submit for review**
- Review typically takes 1–3 business days
- You'll receive an email when approved

---

## After approval

1. Update README install section — replace "listing pending review" with the actual CWS link
2. Post Show HN: "Redlyne – edit any webpage with Figma controls, paste changes into Claude Code"
3. Post to Product Hunt
4. Push the `v0.0.2` git tag to trigger the GitHub Actions release zip
