/**
 * cards.js
 * Loads card data from JSON files, filters by selected countries,
 * shuffles the deck, and provides a draw function.
 */

const Cards = (() => {

  const COUNTRY_META = {
    za: { name: 'South Africa', flag: '🇿🇦', file: 'data/south-africa.json' },
    uk: { name: 'United Kingdom', flag: '🇬🇧', file: 'data/uk.json' },
    es: { name: 'Spain',          flag: '🇪🇸', file: 'data/spain.json' },
    us: { name: 'United States',  flag: '🇺🇸', file: 'data/usa.json' },
  };

  let deck = [];       // shuffled array of card objects
  let drawIndex = 0;   // current position in the deck

  /** Fisher-Yates shuffle (in-place) */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Load and build a deck from the given country codes.
   * @param {string[]} countryCodes  e.g. ['za', 'uk']
   * @returns {Promise<void>}
   */
  async function buildDeck(countryCodes) {
    const fetches = countryCodes.map(code => {
      const meta = COUNTRY_META[code];
      if (!meta) return Promise.resolve([]);
      return fetch(meta.file)
        .then(r => r.json())
        .catch(() => []);
    });

    const results = await Promise.all(fetches);
    const allCards = results.flat();

    deck = shuffle(allCards);
    drawIndex = 0;
  }

  /**
   * Draw the next card from the deck.
   * Reshuffles automatically when the deck is exhausted.
   * @returns {Object} card object { id, items[] }
   */
  function drawCard() {
    if (deck.length === 0) return null;
    if (drawIndex >= deck.length) {
      shuffle(deck);
      drawIndex = 0;
    }
    return deck[drawIndex++];
  }

  /** Returns display metadata for a country code */
  function getMeta(code) {
    return COUNTRY_META[code] || { name: code, flag: '🌍' };
  }

  return { buildDeck, drawCard, getMeta };
})();
