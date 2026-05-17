# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Multi-page static site with six browser games — **Tris** (tic-tac-toe vs. an unbeatable AI), **Impiccato** (hangman), **Anagrammi** (anagrams), **Memory** (matching pairs), **2048**, and **P15** (15 puzzle / fifteen sliding puzzle) — localized in 2 languages (it / en). Pure HTML/CSS/JavaScript using native ES modules, no build step, no dependencies.

The user communicates in Italian; reply in Italian. UI defaults are in Italian but every visible string lives in `shared/lang/<lang>.js` and can be switched at runtime via the language selector.

## Folder structure

```
/
├── index.html                  # Landing page: title, lang selector, 6 game cards (built from registry)
├── games/
│   ├── tris/{index.html, tris.js, tris.css}
│   ├── impiccato/{index.html, impiccato.js, impiccato.css}
│   ├── anagrammi/{index.html, anagrammi.js, anagrammi.css}
│   ├── memory/{index.html, memory.js, memory.css}
│   ├── t2048/{index.html, t2048.js, t2048.css}
│   └── p15/{index.html, p15.js, p15.css}
├── shared/
│   ├── i18n.js                 # currentLang, T(), applyLanguage(), onLanguageChange()
│   ├── lang/{it.js, en.js}     # one translation bundle per language
│   ├── words.js                # ALPHABETS + WORDS (used by Impiccato, Anagrammi)
│   ├── backgrounds.js          # 12 gradient backgrounds + changeBackground()
│   ├── header.js               # renderHeader({ backHref }) — injects title/lang-select/back-link
│   └── registry.js             # GAMES = [{ id, slug, i18nTab, emoji }, …]
├── styles/
│   └── base.css                # CSS vars, body, header, grid, panel/controls/status/stat-item, landing cards
├── .nojekyll
├── CLAUDE.md
└── README.md
```

## Architecture

- **Native ES modules**: each `.js` uses `import`/`export`; loaded via `<script type="module">`. The browser handles dependency resolution. No bundler.
- **Multi-page**: each game has its own page (`/games/<slug>/`). The shared header (rendered by `shared/header.js`) provides the back-link to the landing and the language selector. The landing page (`/index.html`) renders a card per game by iterating `GAMES` from `shared/registry.js`.
- **i18n**:
  - `shared/i18n.js` exposes `currentLang` (a live binding from `localStorage.lang`), `T()` (the current language bundle), `applyLanguage(lang)` (sets lang, writes `data-i18n` elements, fires listeners), and `onLanguageChange(fn)` (subscribe).
  - Each language file (`shared/lang/it.js`, `shared/lang/en.js`) `export default`s a flat bundle. Adding a language = create `shared/lang/<code>.js` + register it in `shared/i18n.js`.
  - Use `data-i18n="path.to.key"` on a static element to have its text written automatically when `applyLanguage` runs. Dynamic text (function-template strings) is set imperatively by the game's `refreshText()`.
- **Game module contract**: each `games/<slug>/<game>.js` `export default`s `{ init, refreshText, resetStats }` (Tris also exports `resetScores`). The page's bootstrap (inline `<script type="module">` at end of the game's HTML) calls `renderHeader(...)`, `game.init()`, then `applyLanguage(currentLang)`. The game module subscribes to `onLanguageChange` internally to refresh its text (and re-pick words for Impiccato/Anagrammi).
- **localStorage keys** (unchanged across the refactor): `lang`, `anagram-best-<lang>`, `memory-best`, `t2048-best`, `p15-best`.

## Game-specific notes

- **`Tris`** — Newell &amp; Simon priority list (Win → Block → Fork → Block fork → Center → Opposite corner → Empty corner → Empty side). The corner-opposite-corner trap is the classic failure mode — at step 4 we pick a threat whose forced block doesn't itself create the opponent's fork.
- **`Impiccato`** — language-aware word picker and keyboard rendered from `WORDS[currentLang]` / `ALPHABETS[currentLang]`. 9-error limit. SVG starts with only the ground bar; each error reveals the next `.part[data-part="0..8"]`. First and last letters pre-revealed. Listens to physical keyboard input on the document.
- **`Anagram`** — picks a 4+ letter word from `WORDS[currentLang]`, shuffles its letters into tiles. Click a tile to place it in the next empty slot; click a filled slot to return it. Auto-verifies when all slots are filled. Wrong attempt triggers a shake animation and clears slots; correct triggers a pulse and auto-advances. Wins streak is the score; "Nuova parola" (skip) breaks the streak and increments losses. Per-language record stored in `localStorage` as `anagram-best-<lang>`.
- **`Memory`** — 4×4 grid of 8 emoji pairs (`🐶 🐱 🦊 🐯 🐻 🐼 🦁 🐰`), language-independent. Click flips a card, two non-matching flips wait 700ms before flipping back. Move counter, pairs found, and best (lowest moves) saved globally in `localStorage` as `memory-best`.
- **`T2048`** — classic 4×4 2048 implementation. Each tile is a DOM element with `--r` / `--c` CSS variables; `translate: calc(var(--c) * (var(--cell-size) + 8px)) ...` and `transition: translate 0.15s` make tiles slide smoothly. `--cell-size` uses `cqw` (container query unit) so it resolves identically in `width` and `translate` contexts (a plain `%` would not — `%` inside `translate` refers to the tile's own size, not the container). Move logic preserves tile identity: existing tiles update their `r`/`c`, two tiles in a merge both slide to the destination then the survivor's value/style updates and the consumed tile is removed after the animation. A `moving` flag blocks input during the 160ms animation. Win at 2048, lose when `canMove()` returns false. Best score in `localStorage` as `t2048-best`.
- **`P15`** — 4×4 fifteen-puzzle. Same DOM/CSS structure as 2048 (background grid + absolute-positioned tiles, `cqw`-based `--cell-size`, `translate` transition). Clicking a tile in the same row or column as the blank slides all tiles between toward the blank (each step counts as one move). Shuffle by performing ~250 random valid moves from the solved state (guarantees solvability). Tiles correctly placed get a green `.correct` background. Stats: moves count, mm:ss timer (starts on first move), best (lowest moves) saved in `localStorage` as `p15-best`.

## Adding a new game

1. Create `games/<slug>/{index.html, <game>.js, <game>.css}`. Copy an existing game's bootstrap script as a template.
2. The JS module must `export default { init, refreshText, resetStats }`.
3. Add a translation bundle key per language under `shared/lang/it.js` and `shared/lang/en.js` (e.g. `newgame: { subtitle, btnNew, … }`). Add a label under `tabs.newgame` in both.
4. Append `{ id: 'newgame', slug: 'newgame', i18nTab: 'newgame', emoji: '…' }` to `shared/registry.js`.

The landing page picks up the new game automatically.

## Invariants to preserve

- **Tris AI must never lose.** Corner-opposite-corner is the classic test case — verify the AI responds with a side, not a corner.
- **Each language's hangman/anagram words must contain only letters in that language's `ALPHABETS` entry.** Italian skips J/K/W/X/Y; English uses the full 26-letter alphabet.
- **When adding a new UI string**, add it to *every* language bundle in `shared/lang/` — there is no fallback chain, missing keys render as `undefined`.
- **Each game module must keep the `{ init, refreshText, resetStats }` contract** so the page bootstrap can call them uniformly and language switching keeps working.

## Running locally

ES modules require a real HTTP server (they don't load via `file://`). Use:

```
python -m http.server 8000
```

Then open `http://localhost:8000/`. No build step.

## Deployment

Static hosting (any provider): copy the repo contents to web root. `.nojekyll` keeps GitHub Pages from preprocessing the files. The site is currently linked to a custom domain.
