# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page static site with five browser games — **Tris** (tic-tac-toe vs. an unbeatable AI), **Impiccato** (hangman), **Anagrammi** (anagrams), **Memory** (matching pairs), and **2048** — localized in 8 languages (it / en-gb / en-us / de / es / zh / hi / la), deployed on GitHub Pages. Pure HTML/CSS/JavaScript, no build step, no dependencies.

The user communicates in Italian; reply in Italian. UI defaults are in Italian but every visible string lives in the `I18N` object and can be switched at runtime.

## Architecture

Everything is in `index.html`: markup, styles, and game logic are inlined to keep the deployment a single file. The script is organized as:

- **i18n layer** — `I18N` (translations per language with function templates), `ALPHABETS` (keyboard letters per language, used by Impiccato), `WORDS` (word pool per language, used by Impiccato and Anagrammi), `currentLang` (persisted in `localStorage`), and `T()` returning the current bundle. Chinese uses pinyin (Latin 26), Hindi uses ITRANS-style romanization (Latin 26), Latin uses the 24-letter convention (no J, no W). Spanish includes Ñ.
- **Shared layer** — `BACKGROUNDS` (12 gradients) and `changeBackground()`. Each game calls this when it starts a new round.
- **Five game modules**, each as an IIFE exposing `{ init, refreshText, resetStats }` (Tris exposes `resetScores`):
  - **`Tris`** — Newell &amp; Simon priority list (Win → Block → Fork → Block fork → Center → Opposite corner → Empty corner → Empty side). The corner-opposite-corner trap is the classic failure mode — at step 4 we pick a threat whose forced block doesn't itself create the opponent's fork.
  - **`Impiccato`** — language-aware word picker and keyboard rendered from `WORDS[currentLang]` / `ALPHABETS[currentLang]`. 9-error limit. SVG starts with only the ground bar; each error reveals the next `.part[data-part="0..8"]`. First and last letters pre-revealed. Listens to physical keyboard input only when its view is visible.
  - **`Anagram`** — picks a 4+ letter word from `WORDS[currentLang]`, shuffles its letters into tiles. Click a tile to place it in the next empty slot; click a filled slot to return it. Auto-verifies when all slots are filled. Wrong attempt triggers a shake animation and clears slots; correct triggers a pulse and auto-advances. Wins streak is the score; "Nuova parola" (skip) breaks the streak and increments losses. Per-language record stored in `localStorage` as `anagram-best-<lang>`.
  - **`Memory`** — 4×4 grid of 8 emoji pairs (`🐶 🐱 🦊 🐯 🐻 🐼 🦁 🐰`), language-independent. Click flips a card, two non-matching flips wait 700ms before flipping back. Move counter, pairs found, and best (lowest moves) saved globally in `localStorage` as `memory-best`.
  - **`T2048`** — classic 4×4 2048 implementation. `slideRow` collapses a row to the left with merging; the move function applies it after rotating the grid `dir` times CW and rotates back after. Arrow keys when visible; swipe on the board. Wins at 2048, loses when `canMove()` returns false. Best score in `localStorage` as `t2048-best`.
- **Language selector + game menu** — `applyLanguage(lang)` writes static text by walking elements with `data-i18n="path.to.key"` plus calling each module's `refreshText()`. On change, all game stats are reset and Impiccato/Anagrammi reinitialize (their content depends on the language).

## Invariants to preserve

- **Tris AI must never lose.** Corner-opposite-corner is the classic test case — verify the AI responds with a side, not a corner.
- **Each language's hangman/anagram words must contain only letters in that language's `ALPHABETS` entry.** Italian skips J/K/W/X/Y; Latin skips J/W; German words must avoid umlauts and ß; Spanish words may include Ñ.
- **When adding a new UI string**, add it to *every* language in `I18N` — there is no fallback chain, missing keys render as `undefined`.
- **Each new game module must expose `init`, `refreshText`, and `resetStats`** so the language selector can re-render and reset it. Add it to both the `views` map (for tab toggling) and to the bootstrap section at the bottom.

## Running locally

Open `index.html` directly in a browser, or serve the directory with any static server (e.g. `python -m http.server`). No build needed.

## Deployment

GitHub Pages from the `main` branch, root folder. `.nojekyll` is present so Pages serves the files as-is.
