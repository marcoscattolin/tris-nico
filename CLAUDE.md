# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page static site with two browser games — **Tris** (tic-tac-toe vs. an unbeatable AI) and **Impiccato** (hangman) — localized in 8 languages (it / en-gb / en-us / de / es / zh / hi / la), deployed on GitHub Pages. Pure HTML/CSS/JavaScript, no build step, no dependencies.

The user communicates in Italian; reply in Italian. UI strings in `index.html` default to Italian but every visible string lives in the `I18N` object and can be switched at runtime.

## Architecture

Everything lives in `index.html`: markup, styles, and game logic are inlined to keep the deployment a single file. The script is organized as:

- **i18n layer** — `I18N` (translations per language, with function templates for placeholders), `ALPHABETS` (keyboard letters per language), `WORDS` (hangman word pool per language), `currentLang` (persisted in `localStorage`), and `T()` returning the current language's translation bundle. Chinese uses pinyin (Latin 26), Hindi uses ITRANS-style romanization (Latin 26), Latin uses the 24-letter classical-plus-U convention (no J, no W). Spanish includes Ñ.
- **Shared layer** — `BACKGROUNDS` array (12 gradients) and `changeBackground()`. Both games call this whenever they start a new round, so the page background rotates randomly without repeating consecutively.
- **`Tris` module** — board state, `chooseAiMove()` implementing the Newell &amp; Simon priority list (**Win → Block → Fork → Block opponent's fork → Center → Opposite corner → Empty corner → Empty side**). When the opponent has multiple fork moves, step 4 picks a two-in-a-row threat whose forced block doesn't itself create the opponent's fork — this is what prevents the classic corner/opposite-corner trap. Exposes `refreshText()` for re-rendering visible strings after a language change.
- **`Impiccato` module** — language-aware word picker and keyboard rendered from `WORDS[currentLang]`/`ALPHABETS[currentLang]`. 9-error limit. The SVG starts with only the ground bar; each error reveals the next `.part[data-part="0..8"]` in order: vertical post, top bar, rope, head, body, left arm, right arm, left leg, right leg. The first and last letters of the word start pre-revealed. Listens for physical keyboard input but ignores it when the impiccato view is hidden. Exposes `refreshText()` and `init()` (the latter is called on language change to swap word/alphabet).
- **Language selector + game menu** — top-level orchestrator. `applyLanguage(lang)` writes static text via each module's `refreshText()` and updates `<h1>`, tabs, language label. Game tab clicks toggle `.hidden` on the corresponding `.game-view`.

Both modules implement a 1-second auto-restart timer after every round. Switching tabs does not restart anything; clicking "Nuova partita" / "Nuova parola" or changing who starts the tris cancels the pending auto-restart timer to avoid double-init.

## Invariants to preserve

- **Tris AI must never lose.** The corner-opposite-corner scenario (human plays a corner, AI plays center, human plays opposite corner) is the classic failure mode — verify the AI responds with a *side*, not a corner.
- **Each language's hangman words must only contain letters that exist in that language's `ALPHABETS` entry.** A word with a letter not on the keyboard would be unsolvable. Italian skips J/K/W/X/Y; Latin skips J/W; German words must avoid umlauts and ß (they're not on the keyboard); Spanish words may include Ñ.
- **When adding a new UI string**, add it to *every* language in `I18N` — there is no fallback chain, missing keys will render as `undefined`.

## Running locally

Open `index.html` directly in a browser, or serve the directory with any static server (e.g. `python -m http.server`). No build needed.

## Deployment

GitHub Pages from the `main` branch, root folder. `.nojekyll` is present so Pages serves the files as-is.
