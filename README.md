# Haunted GSE: Four Missions + Bonus

A Halloween escape activity using an interactive 360° lobby and five existing ThingLink puzzle rooms.

- **Backup site:** https://shayanahmad7.github.io/haunted-gse-escape-room/
- **Primary site:** https://haunted-gse-five-missions.nutmegcarp516.chatgpt.site/

## Play

Choose a room from the lobby to open its original ThingLink view directly. Inside a room, drag or swipe to look around, zoom, click clue markers, and enter your answer at the door. **How to explore** opens the room instructions. You can return to the lobby to try a different room without earning completion credit for an unsolved room.

Each successful door answer earns one point. Rooms **202, 259, 322, and 355** are required. The main exit opens when those four are solved. Room **357** is an optional one-point bonus that unlocks after two distinct missions have been completed. The bonus cannot substitute for a required room.

The 3D explorer appears only on the lobby screen. There are no character overlays, route previews, elevator rides, or artificial travel delays inside the puzzle rooms. Room photos and puzzles remain in ThingLink.

The activity uses a shared 10-minute presentation timer. The website does not run a separate countdown. Progress stays in browser-local storage and is independent on the primary and backup sites. **New attempt** resets progress in that browser.

## Run locally

The website is static and needs no API keys, backend, or build step. Three.js is already included in `dist/vendor/` for the lobby mascot.

```sh
git clone https://github.com/shayanahmad7/haunted-gse-escape-room.git
cd haunted-gse-escape-room
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. With Node.js installed, run:

```sh
npm run check
npm test
```

## Deploy and recover

Every push to `main` runs JavaScript syntax checks and the mission-completion tests, then publishes `dist/` to GitHub Pages. Pull requests run checks without deploying. The workflow can also be run from the repository's Actions tab.

If the primary hosting link stops working, use the backup link above. For another static HTTPS host, upload the contents of `dist/`. Relative asset paths support subdirectory hosting. Tagged releases provide ready-to-host ZIP archives.

Both deployments load the room panoramas, puzzles, and password gates from ThingLink, so those scenes must remain available to viewers. Password changes are managed in ThingLink, not in this code. Google Fonts provides typography with local fallback fonts in the stylesheet.

## Project files

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Website entry point |
| `dist/app.js` | Lobby, direct room navigation, help, and progress |
| `dist/lobby-character.js` | Lobby-only Three.js mascot |
| `dist/mission-state.js` | Room IDs, bonus unlock, required rooms, and trusted completion events |
| `dist/styles.css` | Responsive appearance |
| `dist/vendor/` | Pinned Three.js runtime and its MIT license |
| `mission-state.test.js` | Five checks for completion, required rooms, bonus gating, and trusted origins |
| `.github/workflows/deploy.yml` | Tests and GitHub Pages publication |

Room content is edited in ThingLink. The repository contains the website shell and no course notes, recordings, account credentials, or primary-host configuration.

## Update Three.js

To restore the vendored runtime from the pinned dependency:

```sh
npm ci
npm run vendor
```

## Current version

Version 1.6.1 simplifies navigation to direct room entry and keeps the explorer only in the lobby. Earlier versions remain available in Git history and tagged releases. Existing browser progress is preserved.

Website source snapshot: primary Site commit `40e7f1faf650f067e8de0ec833a8778dcfc16a71`.

Application and stylesheet URLs are versioned so browser caches pick up the current interface after an update.

The final exit opens the GSE exterior view, with a congratulations message and the completed room list.

## Explorer movement

Hold arrow keys or WASD anywhere in the lobby, or use the on-screen arrows. Dragging the explorer selects a floor destination and follows a route around the sofa. Foot collision boundaries prevent crossing the sofa, glass wall and window wall; speed eases in and out and diagonal input is normalized. Movement pauses in dialogs, when hidden, and on browser blur. Puzzle rooms have no explorer overlay.

The lobby uses the existing panorama from the project with a fixed camera so collision boundaries stay aligned at different screen sizes. This is an approximation based on the photograph, not a surveyed 3D scan. The original ThingLink scenes and backups are unchanged. The local panorama is `dist/assets/gse-lobby-panorama.jpg`, from the project’s publicly shared lobby scene 2172808776581645156.

Puzzle rooms open directly in their original ThingLink 360° view. There is no room explorer and no walking/clue mode switch. The explorer and collision-aware movement remain in the main lobby only.

On the first visit to each room in an attempt, the 3D explorer flings both arms up and launches vertically in 680 ms while the camera tilts toward the real lobby ceiling, then fades directly into the original ThingLink room. Revisits enter directly. Reduced-motion preferences skip the flight. There are no travel scenes, elevators, in-room characters, or mode switches. Room locks and scoring are checked before the animation begins.
