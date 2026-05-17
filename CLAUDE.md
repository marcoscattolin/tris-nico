# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page static site with two browser games — **Tris** (tic-tac-toe vs. an unbeatable AI) and **Impiccato** (hangman in Italian) — deployed on GitHub Pages. Pure HTML/CSS/JavaScript, no build step, no dependencies.

The user communicates in Italian; reply in Italian. UI strings in `index.html` are in Italian.

## Architecture

Everything lives in `index.html`: markup, styles, and game logic are inlined to keep the deployment a single file. The script is organized as three IIFE-style modules plus a small top-level orchestrator:

- **Shared layer** — `BACKGROUNDS` array (12 gradients) and `changeBackground()`. Both games call this whenever they start a new round, so the page background rotates randomly without repeating consecutively.
- **`Tris` module** — board state, `chooseAiMove()` implementing the Newell &amp; Simon priority list (**Win → Block → Fork → Block opponent's fork → Center → Opposite corner → Empty corner → Empty side**). When the opponent has multiple fork moves, step 4 picks a two-in-a-row threat whose forced block doesn't itself create the opponent's fork — this is what prevents the classic corner/opposite-corner trap.
- **`Impiccato` module** — Italian word list (~100 words, no accented characters), 21-letter Italian alphabet keyboard (`ABCDEFGHILMNOPQRSTUVZ`, no J/K/W/X/Y), 6-error limit. The hangman figure is an inline SVG with body parts marked `.part[data-part="0..5"]`; each error toggles `.shown` on the next part. Listens for physical keyboard input but ignores it when the impiccato view is hidden.
- **Menu** — clicking a `.game-tab` toggles `.hidden` on the corresponding `.game-view`. Game state in the hidden tab is preserved.

Both modules implement a 1-second auto-restart timer after every round. Switching tabs does not restart anything; clicking "Nuova partita" / "Nuova parola" or changing who starts the tris cancels the pending auto-restart timer to avoid double-init.

## Invariants to preserve

- **Tris AI must never lose.** The corner-opposite-corner scenario (human plays a corner, AI plays center, human plays opposite corner) is the classic failure mode — verify the AI responds with a *side*, not a corner.
- **Impiccato words must contain only the 21 Italian alphabet letters.** Adding accented characters (à, è, ì, ò, ù) or J/K/W/X/Y would make the word unsolvable from the on-screen keyboard.

## Running locally

Open `index.html` directly in a browser, or serve the directory with any static server (e.g. `python -m http.server`). No build needed.

## Deployment

GitHub Pages from the `main` branch, root folder. `.nojekyll` is present so Pages serves the files as-is.
