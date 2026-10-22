# Daily

A habit tracker for prayers, Quran reading, training and streaks. One static page,
no build step, no framework, no account.

**Live:** https://cristianand24.github.io/habits/

## Add it to your iPhone home screen

1. Open the link **in Safari** (not Chrome — only Safari can install to the home screen).
2. Tap the Share button, then **Add to Home Screen**.
3. Open it from the icon. It now runs full screen with no browser chrome, and works
   with no signal.

## Where your data lives

Everything you log is stored in your phone's browser storage, on the device. Nothing
leaves it unless you turn sync on, and nothing personal is in this repository.

That storage is durable but **not guaranteed forever**. iOS can clear it if you delete
the home-screen icon, clear Safari's data, or the device runs very low on space.
The app asks iOS to mark the data as persistent, but iOS decides.

So: **take a backup now and then.** The `⋯` menu has *Export backup*, which hands the
file to the iOS share sheet — choose *Save to Files* and keep it in iCloud Drive. The
file is a few KB of JSON. *Data & storage* in the same menu has *Restore from a file*,
and reports what iOS will actually tell us about how safe the data is.

When it has been more than two weeks since your last backup, a small gold dot appears
on the `⋯` button. That is the only nagging the app does.

## Sync

Optional, off until you ask for it, and there is no account anywhere — no email, no
password, no sign-in screen. `⋯` → *Data & storage* → *Sync*.

Turning it on mints a 160-bit key on the device. Every read and write carries that
key, and the server only ever touches the row matching it.

**A second device:** tap *Copy the key* on the first one, then *Use a key from another
device* on the second and paste it. The second device's log is merged in, not replaced.

Two things worth knowing:

- **The key is the only way back to the synced copy.** It lives inside the backup
  file, so restoring a backup restores sync along with the data. But lose every
  device *and* every backup and that copy is unreachable, by you or anyone. It is a
  password that cannot be reset.
- **Sync is a second copy, not a safety net.** It replicates a mistake to every
  device as faithfully as a correction. The export file is still the only copy that
  survives everything.

When two devices both edited offline, the merge keeps everything: days are unioned,
the fuller record wins where both hold the same date, and lists are unioned by id.
The cost is that deleting something on one device can bring it back from the other.
For a log whose job is to survive, resurrecting an entry beats losing one.

### Running your own

`supabase-setup.sql` is the whole backend: one table and two functions, pasted into
the SQL editor of a free Supabase project. Then set `SB_URL` and `SB_KEY` near the
top of the script block in `index.html`. Leave them empty and sync disappears from
the UI entirely and the app makes no network calls.

The publishable key sits in this page's source on purpose — Supabase designs it to
ship in client code. What makes that safe is the table: RLS is on with **no
policies**, so it is unreachable over REST, and the two `security definer` functions
only ever touch the row matching the key passed in. The key alone reads nothing.

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
| `supabase-setup.sql` | The sync schema — run once in a Supabase project |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is |

## Local preview

A service worker needs `http://`, so opening the file directly won't exercise the
offline path. Serve it instead:

```bash
python -m http.server 8731
```

Then open http://localhost:8731/.
