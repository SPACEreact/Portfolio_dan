# Himanshu Bais — Portfolio

A reels-style portfolio: one full-screen piece at a time, scrolled vertically. Films and commercials autoplay as you land on them; posters sit in the same feed.

## Add work

- **Posters / images** — put the image in `site/posters/` and add an entry to `site/posters.json` (`title`, `type`, `file`, `src`, `caption`). It appears in the feed, the Work grid, the Posters filter and the skill card automatically.
- **Videos** — add an entry to `site/media.json` with the Google Drive file `id`. The publish workflow downloads and prepares it.

## Publish

In Settings → Pages, set Source to GitHub Actions. Changes to `main` publish automatically.
