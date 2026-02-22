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

  let itemPool = [];    // flat array of all individual items from selected countries
  let poolIndex = 0;    // current position in the shuffled item pool
  let cardCounter = 0;  // used to generate unique card IDs

  /** Fisher-Yates shuffle (in-place) */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Load and build an item pool from the given country codes.
   * All items from all selected countries are combined into one shuffled pool.
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
    // Flatten all cards from all countries into individual items
    const allItems = results.flat().flatMap(card => card.items);

    itemPool = shuffle(allItems);
    poolIndex = 0;
    cardCounter = 0;
  }

  /**
   * Draw the next card from the pool.
   * Each card is assembled on-the-fly by picking 5 items from the shuffled pool.
   * Reshuffles the pool automatically when exhausted.
   * @returns {Object} card object { id, items[] }
   */
  function drawCard() {
    if (itemPool.length === 0) return null;

    // Reshuffle if we don't have enough items left for a full card
    if (poolIndex + 5 > itemPool.length) {
      shuffle(itemPool);
      poolIndex = 0;
    }

    const items = itemPool.slice(poolIndex, poolIndex + 5);
    poolIndex += 5;
    cardCounter++;

    return { id: `card-${cardCounter}`, items };
  }

  /** Returns display metadata for a country code */
  function getMeta(code) {
    return COUNTRY_META[code] || { name: code, flag: '🌍' };
  }

  return { buildDeck, drawCard, getMeta };
})();
