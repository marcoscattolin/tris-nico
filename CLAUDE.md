# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page tic-tac-toe ("tris") game with an unbeatable AI, deployed as a static site on GitHub Pages. Pure HTML/CSS/JavaScript — no build step, no dependencies, no package manager.

The user communicates in Italian; reply in Italian. UI strings in `index.html` are in Italian.

## Architecture

Everything lives in `index.html`: markup, styles, and game logic are inlined to keep the deployment a single file. The JS is wrapped in an IIFE at the bottom of the file.

Key pieces inside the `<script>` block:

- `LINES` — the 8 winning lines, indexing the flat 9-cell board array.
- `init(humanFirst)` — resets the board and decides whether human plays X (first) or O (second).
- `chooseAiMove()` — the unbeatable AI. Implements the Newell & Simon priority list from [Wikipedia](https://en.wikipedia.org/wiki/Tic-tac-toe) in this exact order: **Win → Block → Fork → Block opponent's fork → Center → Opposite corner → Empty corner → Empty side**. When the opponent has multiple fork moves available, step 4 forces a two-in-a-row threat (`findThreatMoves`) whose forced block does not itself create an opponent fork — this prevents the classic corner/opposite-corner trap.
- `findWinningMove`, `countOpenTwos`, `findForkMoves`, `findThreatMoves` — helpers used by the priority list.

If you modify the AI, the property to preserve is: **the AI must never lose**. The corner-opposite-corner scenario (human plays a corner, AI center, human plays opposite corner) is the classic failure mode — verify the AI responds with a side, not a corner.

## Running locally

Open `index.html` directly in a browser, or serve the directory with any static server (e.g. `python -m http.server`). No build needed.

## Deployment

GitHub Pages from the `main` branch, root folder. `.nojekyll` is present so Pages serves the files as-is without running Jekyll.
