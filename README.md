# Daily

A habit tracker for prayers, Quran reading, training and streaks. One static page,
no build step, no backend, no account.

**Live:** https://cristianand24.github.io/habits/

## Add it to your iPhone home screen

1. Open the link **in Safari** (not Chrome — only Safari can install to the home screen).
2. Tap the Share button, then **Add to Home Screen**.
3. Open it from the icon. It now runs full screen with no browser chrome, and works
   with no signal.

## Where your data lives

Everything you log is stored in your phone's browser storage, on the device. Nothing
is uploaded, and nothing personal is in this repository.

That storage is durable but **not guaranteed forever**. iOS can clear it if you delete
the home-screen icon, clear Safari's data, or the device runs very low on space.
The app asks iOS to mark the data as persistent, but iOS decides.

So: **take a backup now and then.** The `⋯` menu has *Export backup*, which hands the
file to the iOS share sheet — choose *Save to Files* and keep it in iCloud Drive. The
file is a few KB of JSON. *Restore from a file* reads it back.

When it has been more than two weeks since your last backup, a small gold dot appears
on the `⋯` button. That is the only nagging the app does.

## Updating it

Edit `index.html` and push. The page is served network-first, so an installed app
picks up the new version the next time it opens with a connection.

If you change `sw.js`, bump the `CACHE` constant at the top of that file — otherwise
devices keep serving the old cached shell.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app: markup, styles and logic |
| `sw.js` | Service worker — offline shell and update strategy |
| `manifest.webmanifest` | Name, icons, standalone display |
| `apple-touch-icon.png` | Home-screen icon on iOS |
| `icon-*.png` | Manifest icons, including a maskable one |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is |

## Local preview

A service worker needs `http://`, so opening the file directly won't exercise the
offline path. Serve it instead:

```bash
python -m http.server 8731
```

Then open http://localhost:8731/.
