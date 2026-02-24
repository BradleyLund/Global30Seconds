/**
 * app.js
 * Screen routing, UI rendering, and event wiring.
 * Depends on: cards.js, timer.js, game.js
 */

(() => {

  /* ── Helpers ─────────────────────────────────────── */

  function $(id) { return document.getElementById(id); }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = $(id);
    if (el) { el.classList.add('active'); el.scrollTop = 0; }
  }

  const DEFAULT_TEAM_NAMES = ['Team 1','Team 2','Team 3','Team 4','Team 5','Team 6'];

  /* ─── State ──────────────────────────────────────── */

  let selectedCountries = [];   // ['za','uk', ...]
  let currentCard       = null; // the drawn card object
  let numTeams          = 2;

  /* ═══════════════════════════════════════════════════
     SCREEN: Home / Country Select
     ═══════════════════════════════════════════════════ */

  const countryBtns  = document.querySelectorAll('.country-btn');
  const btnToTeams   = $('btn-to-teams');

  countryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const code    = btn.dataset.country;
      const pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!pressed));

      if (!pressed) {
        selectedCountries.push(code);
      } else {
        selectedCountries = selectedCountries.filter(c => c !== code);
      }

      btnToTeams.disabled = selectedCountries.length === 0;
    });
  });

  btnToTeams.addEventListener('click', () => {
    renderTeamSetup();
    showScreen('screen-teams');
  });

  /* ═══════════════════════════════════════════════════
     SCREEN: Team Setup
     ═══════════════════════════════════════════════════ */

  const teamsList     = $('teams-list');
  const btnAddTeam    = $('btn-add-team');
  const btnRemoveTeam = $('btn-remove-team');
  const btnBackHome   = $('btn-back-home');
  const btnStartGame  = $('btn-start-game');

  function renderTeamSetup() {
    teamsList.innerHTML = '';
    for (let i = 0; i < numTeams; i++) {
      const row = document.createElement('div');
      row.className = 'team-input-row';

      const dot = document.createElement('div');
      dot.className = 'team-color-dot';
      dot.style.background = ['#2980b9','#c0392b','#27ae60','#8e44ad','#e67e22','#16a085'][i];

      const input = document.createElement('input');
      input.type        = 'text';
      input.className   = 'team-name-input';
      input.value       = DEFAULT_TEAM_NAMES[i];
      input.maxLength   = 24;
      input.placeholder = `Team ${i + 1}`;
      input.dataset.idx = i;

      row.appendChild(dot);
      row.appendChild(input);
      teamsList.appendChild(row);
    }

    btnRemoveTeam.disabled = numTeams <= 2;
    btnAddTeam.disabled    = numTeams >= 6;
  }

  btnAddTeam.addEventListener('click', () => {
    if (numTeams < 6) { numTeams++; renderTeamSetup(); }
  });

  btnRemoveTeam.addEventListener('click', () => {
    if (numTeams > 2) { numTeams--; renderTeamSetup(); }
  });

  btnBackHome.addEventListener('click', () => showScreen('screen-home'));

  btnStartGame.addEventListener('click', async () => {
    const inputs = teamsList.querySelectorAll('.team-name-input');
    const names  = [...inputs].map(inp => inp.value.trim() || inp.placeholder);

    Game.init(names);

    // Load cards (show a brief loading state on the button)
    btnStartGame.textContent = 'Loading cards…';
    btnStartGame.disabled    = true;
    await Cards.buildDeck(selectedCountries);
    btnStartGame.textContent = 'Start Game!';
    btnStartGame.disabled    = false;

    renderBoard();
    showScreen('screen-board');
  });

  /* ═══════════════════════════════════════════════════
     SCREEN: Game Board
     ═══════════════════════════════════════════════════ */

  const scoreRows      = $('score-rows');
  const activeTeamName = $('active-team-name');
  const btnDrawCard    = $('btn-draw-card');

  function renderBoard() {
    const teams = Game.getTeams();
    const active = Game.activeTeam();

    // Scoreboard
    scoreRows.innerHTML = '';
    teams.forEach(team => {
      const row = document.createElement('div');
      row.className = 'score-row' + (team.name === active.name ? ' active-team-row' : '');

      const dot = document.createElement('div');
      dot.className   = 'score-dot';
      dot.style.background = team.colour;

      const nameEl = document.createElement('div');
      nameEl.className = 'score-team-name';
      nameEl.textContent = team.name;

      const barWrap = document.createElement('div');
      barWrap.className = 'score-bar-wrap';
      const bar = document.createElement('div');
      bar.className = 'score-bar';
      bar.style.background = team.colour;
      bar.style.width = Math.min(100, (team.score / 35) * 100) + '%';
      barWrap.appendChild(bar);

      const pts = document.createElement('div');
      pts.className   = 'score-pts';
      pts.textContent = team.score + ' pts';

      row.appendChild(dot);
      row.appendChild(nameEl);
      row.appendChild(barWrap);
      row.appendChild(pts);
      scoreRows.appendChild(row);
    });

    // Turn label
    activeTeamName.textContent = active.name;
  }

  btnDrawCard.addEventListener('click', () => {
    currentCard = Cards.drawCard();
    if (!currentCard) return;
    renderCardScreen(currentCard);
    showScreen('screen-card');
    Timer.start(null, () => {
      // Auto-advance to scoring when time runs out
      setTimeout(() => renderScoringScreen(currentCard), 400);
    });
  });

  /* ═══════════════════════════════════════════════════
     SCREEN: Card
     ═══════════════════════════════════════════════════ */

  const cardItemsEl  = $('card-items');
  const btnStopTimer = $('btn-stop-timer');

  function renderCardScreen(card) {
    cardItemsEl.innerHTML = '';
    card.items.forEach((item, idx) => {
      const meta = Cards.getMeta(item.country);

      const div = document.createElement('div');
      div.className = 'card-item';

      const num = document.createElement('div');
      num.className   = 'item-number';
      num.textContent = idx + 1;

      const text = document.createElement('div');
      text.className   = 'item-text';
      text.textContent = item.text;

      const tag = document.createElement('div');
      tag.className = 'item-country-tag';
      tag.innerHTML = `<span class="tag-flag">${meta.flag}</span>${item.country.toUpperCase()}`;

      div.appendChild(num);
      div.appendChild(text);
      div.appendChild(tag);
      cardItemsEl.appendChild(div);
    });
  }

  btnStopTimer.addEventListener('click', () => {
    Timer.stop();
    renderScoringScreen(currentCard);
  });

  /* ═══════════════════════════════════════════════════
     SCREEN: Scoring
     ═══════════════════════════════════════════════════ */

  const scoringTeamLabel = $('scoring-team-label');
  const scoringItemsEl   = $('scoring-items');
  const tallyCount       = $('tally-count');
  const btnConfirmScore  = $('btn-confirm-score');

  function renderScoringScreen(card) {
    const team = Game.activeTeam();
    scoringTeamLabel.textContent = `${team.name}'s turn`;
    scoringItemsEl.innerHTML = '';
    tallyCount.textContent   = '0';

    card.items.forEach((item, idx) => {
      const meta = Cards.getMeta(item.country);

      const row = document.createElement('div');
      row.className = 'scoring-item';
      row.dataset.idx = idx;

      const box = document.createElement('div');
      box.className = 'scoring-checkbox';
      box.textContent = '';

      const text = document.createElement('div');
      text.className   = 'scoring-item-text';
      text.textContent = item.text;

      const tag = document.createElement('div');
      tag.className = 'scoring-country-tag';
      tag.innerHTML = `<span>${meta.flag}</span>${item.country.toUpperCase()}`;

      const learnBtn = document.createElement('a');
      learnBtn.className = 'learn-btn';
      learnBtn.textContent = '?';
      learnBtn.title = `Learn about "${item.text}"`;
      learnBtn.href = `https://www.google.com/search?q=${encodeURIComponent(item.text)}`;
      learnBtn.target = '_blank';
      learnBtn.rel = 'noopener noreferrer';

      row.appendChild(box);
      row.appendChild(text);
      row.appendChild(tag);
      row.appendChild(learnBtn);
      scoringItemsEl.appendChild(row);

      row.addEventListener('click', (e) => {
        if (e.target === learnBtn) return;
        row.classList.toggle('checked');
        box.textContent = row.classList.contains('checked') ? '✓' : '';
        updateTally();
      });
    });

    showScreen('screen-scoring');
  }

  function updateTally() {
    const count = scoringItemsEl.querySelectorAll('.scoring-item.checked').length;
    tallyCount.textContent = count;
  }

  btnConfirmScore.addEventListener('click', () => {
    const points = scoringItemsEl.querySelectorAll('.scoring-item.checked').length;
    const winner = Game.recordScore(points);

    if (winner) {
      renderWinnerScreen(winner);
      showScreen('screen-winner');
    } else {
      renderBoard();
      showScreen('screen-board');
    }
  });

  /* ═══════════════════════════════════════════════════
     SCREEN: Winner
     ═══════════════════════════════════════════════════ */

  const winnerTeamName  = $('winner-team-name');
  const winnerScoreRows = $('winner-score-rows');
  const btnPlayAgain    = $('btn-play-again');

  function renderWinnerScreen(winner) {
    winnerTeamName.textContent = winner.name;

    const teams = Game.getTeams();
    winnerScoreRows.innerHTML = '';
    // Sort descending by score for final display
    [...teams].sort((a,b) => b.score - a.score).forEach(team => {
      const row = document.createElement('div');
      row.className = 'score-row';

      const dot = document.createElement('div');
      dot.className   = 'score-dot';
      dot.style.background = team.colour;

      const nameEl = document.createElement('div');
      nameEl.className   = 'score-team-name';
      nameEl.textContent = team.name;

      const pts = document.createElement('div');
      pts.className   = 'score-pts';
      pts.textContent = team.score + ' pts';

      row.appendChild(dot);
      row.appendChild(nameEl);
      row.appendChild(pts);
      winnerScoreRows.appendChild(row);
    });
  }

  btnPlayAgain.addEventListener('click', () => {
    // Reset country selections
    selectedCountries = [];
    numTeams = 2;
    countryBtns.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
    btnToTeams.disabled = true;
    Timer.reset();
    showScreen('screen-home');
  });

})();
