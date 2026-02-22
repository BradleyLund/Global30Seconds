# Global 30 Seconds — Project Spec

## What This Is

A static web app (hostable on GitHub Pages for free) based on the South African board game **30 Seconds**. This is an international version where the card content is driven by the countries the players choose before the game starts.

## The Game (Rules)

- Teams take turns. The active team's "describer" flips a card and has **30 seconds** to describe as many of the 5 items as possible to their teammates.
- Describing rules: no spelling out initials, no rhyming clues, no using part of the word.
- After the buzzer, the team **ticks** which items they guessed correctly.
- Each correct item = **1 point**.
- **First team to 35 points wins.**
- Pass-and-play on a single shared device (phone/tablet).

## Countries & Card Logic

Four countries supported at launch:

| Country | Code |
|---------|------|
| South Africa | `za` |
| United Kingdom | `uk` |
| Spain | `es` |
| United States | `us` |

- Selecting **one country** → deck is populated only with cards from that country.
- Selecting **multiple countries** → deck is a shuffled mix of cards from all selected countries.
- Each item on a card shows a small **country tag/flag** so players know which country the clue is from.

## Card Format

Each card has **5 items**. Items span mixed categories (famous people, places, landmarks, food, sport, pop culture, history, animals, etc.) — no category-themed cards, all cards are mixed.

Card data is **pre-generated and stored as static JSON files** in `/data/`. No API calls at runtime.

### JSON schema

```json
{
  "id": "za-001",
  "items": [
    { "text": "Nelson Mandela", "country": "za", "category": "people" },
    { "text": "Table Mountain", "country": "za", "category": "places" },
    { "text": "Biltong",        "country": "za", "category": "food" },
    { "text": "Springboks",     "country": "za", "category": "sport" },
    { "text": "Kruger Park",    "country": "za", "category": "places" }
  ]
}
```

Target: **50–100 cards per country** (250–400 cards total).

## UI & Visual Style

**Retro board-game feel**: warm paper/cream tones, deep greens, wood-like textures, serif/slab typography. Feels like a physical card game brought to the browser.

Screens / flow:

1. **Home / Country Select** — pick 1–4 countries, confirm.
2. **Team Setup** — enter 2–6 team names.
3. **Game Board** — current scores for all teams, whose turn it is, "Draw Card" button.
4. **Card Screen** — shows the 5 items with country tags. 30-second visual countdown starts immediately.
5. **Scoring Screen** — after buzzer, checkboxes next to each item; team taps the ones they got. Confirm to add points and pass to next team.
6. **Winner Screen** — celebrate the winning team, option to play again.

## Timer

- 30-second visual countdown (ring or bar style).
- **Buzzer sound** when time hits 0 — generated via the Web Audio API (no audio file needed, works offline, no hosting cost).

## Tech Stack

- **Vanilla HTML + CSS + JavaScript** — no frameworks, no build step, no Node dependencies.
- All assets are static; deploy by pushing to `gh-pages` branch or enabling Pages on `main`.
- Card data lives in `/data/*.json`, loaded with `fetch()`.

## File Structure

```
/
├── CLAUDE.md
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js        # Screen routing & state
│   ├── game.js       # Game logic (scoring, turn order, win condition)
│   ├── cards.js      # Card loading, shuffling, country filtering
│   └── timer.js      # Countdown + Web Audio buzzer
└── data/
    ├── south-africa.json   # 50-100 cards
    ├── uk.json             # 50-100 cards
    ├── spain.json          # 50-100 cards
    └── usa.json            # 50-100 cards
```

## Development Notes

- Target mobile-first (single phone passed around the table).
- Keep JS vanilla — no npm, no bundler. GitHub Pages serves files directly.
- `fetch()` relative paths work fine on GitHub Pages as long as the repo root is the site root.
- To deploy: enable GitHub Pages on the repo pointing to the `main` branch root.
