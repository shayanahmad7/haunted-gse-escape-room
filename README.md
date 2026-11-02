# Haunted GSE: Five Missions

A Halloween escape activity with five ThingLink puzzle rooms, an interactive 360° lobby, and an animated 3D explorer.

- **Independent backup site:** https://shayanahmad7.github.io/haunted-gse-escape-room/
- **Primary site:** https://haunted-gse-five-missions.nutmegcarp516.chatgpt.site/

## Play

Choose rooms in any order. The explorer leaves the lobby, flies to the selected floor, approaches the room doorway, and lands inside the room before the puzzle begins. Flying is a stylized transition; it does not reproduce GSE's actual floor plan or stair/elevator routes.

Solve the room's existing door puzzle to return to the lobby with completion credit. You can also leave an unsolved room and try another. Only successful door answers count, and the main exit opens after five distinct missions. A new attempt resets progress on that browser.

The class uses a shared 10-minute presentation timer. The website does not run a separate countdown. Progress stays in browser-local storage, so it is independent on the primary and backup sites.

## Run locally

The website is static and needs no API keys, backend, or build step. Three.js is already vendored in `dist/vendor/`.

```sh
git clone https://github.com/shayanahmad7/haunted-gse-escape-room.git
cd haunted-gse-escape-room
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080.

With Node.js installed, run checks:

```sh
npm run check
npm test
```

## Deploy and recover

Every push to `main` runs syntax checks and the mission-completion tests, then publishes `dist/` to GitHub Pages. Pull requests run checks without deploying. You can also run the workflow from the repository's Actions tab.

If the primary hosting link stops working, use the independent backup link above. To deploy elsewhere, upload the contents of `dist/` to any static HTTPS host. Relative asset paths support deployment in a subdirectory.

The room panoramas, puzzles, and password gates are embedded from ThingLink. Both deployments depend on those scenes remaining available to viewers. Google Fonts is used for typography; local fallback fonts are supplied in the stylesheet.

## Project files

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Website entry point |
| `dist/app.js` | Lobby, room journeys, navigation, and progress |
| `dist/lobby-character.js` | Three.js character, walking, flight, doorway, and landing |
| `dist/mission-state.js` | Room IDs, trusted message handling, and completion rules |
| `dist/styles.css` | Responsive appearance |
| `dist/vendor/` | Pinned Three.js runtime and its MIT license |
| `mission-state.test.js` | Checks for successful door events, distinct completion, and trusted origins |
| `.github/workflows/deploy.yml` | Tests and GitHub Pages publication |

Room mappings are in `dist/mission-state.js`. Rooms 202 and 259 are on floor 2; rooms 322, 355, and 357 are on floor 3. Room content is edited in ThingLink rather than in this repository.

## Update Three.js

The current version is pinned in `package-lock.json`. To restore the vendored files from that version:

```sh
npm ci
npm run vendor
```

## Backup source

Initial website snapshot: primary Site commit `32102ac5761217d0ab95098f888b46f711119285`, saved version 5, November 2, 2026. The website files were copied directly; course notes, recordings, account credentials, and primary-host configuration are not included.
