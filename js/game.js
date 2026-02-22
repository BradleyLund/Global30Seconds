/**
 * game.js
 * Core game state: teams, scores, turn order, win condition.
 */

const Game = (() => {

  const WIN_SCORE = 35;
  const TEAM_COLOURS = ['#2980b9','#c0392b','#27ae60','#8e44ad','#e67e22','#16a085'];

  let teams      = [];   // [{ name, score, colour }]
  let turnIndex  = 0;    // index into teams[]
  let winner     = null; // team object when someone wins

  /** Initialise teams from an array of name strings */
  function init(teamNames) {
    teams = teamNames.map((name, i) => ({
      name,
      score: 0,
      colour: TEAM_COLOURS[i % TEAM_COLOURS.length],
    }));
    turnIndex = 0;
    winner    = null;
  }

  /** Return the team whose turn it currently is */
  function activeTeam() {
    return teams[turnIndex];
  }

  /**
   * Add points to the active team, advance the turn, and check for a winner.
   * @param {number} points
   * @returns {Object|null} winning team object, or null if game continues
   */
  function recordScore(points) {
    teams[turnIndex].score += points;

    if (teams[turnIndex].score >= WIN_SCORE) {
      winner = teams[turnIndex];
    }

    // Advance turn
    turnIndex = (turnIndex + 1) % teams.length;

    return winner;
  }

  /** Return a copy of the current teams array (for rendering) */
  function getTeams() {
    return teams.map(t => ({ ...t }));
  }

  /** Return the winner (or null) */
  function getWinner() {
    return winner;
  }

  return { init, activeTeam, recordScore, getTeams, getWinner };
})();
