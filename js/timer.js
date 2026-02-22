/**
 * timer.js
 * 30-second countdown with SVG ring animation and Web Audio buzzer.
 */

const Timer = (() => {

  const DURATION = 30;
  const CIRCUMFERENCE = 2 * Math.PI * 54; // 2πr where r=54 matches SVG

  let _seconds   = DURATION;
  let _intervalId = null;
  let _onTick    = null;  // callback(secondsLeft)
  let _onEnd     = null;  // callback()
  let _audioCtx  = null;

  const ringFill  = () => document.getElementById('ring-fill');
  const countEl   = () => document.getElementById('timer-count');

  /** Update the SVG ring and digit display */
  function _updateDisplay(secs) {
    const pct = secs / DURATION;
    const offset = CIRCUMFERENCE * (1 - pct);
    const ring = ringFill();
    const count = countEl();
    if (!ring || !count) return;

    ring.style.strokeDashoffset = offset;

    // colour phases
    ring.classList.remove('warning', 'danger');
    if (secs <= 5)       ring.classList.add('danger');
    else if (secs <= 10) ring.classList.add('warning');

    count.textContent = secs;
  }

  /** Play a buzzer sound using the Web Audio API (no file needed) */
  function _playBuzzer() {
    try {
      if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = _audioCtx;

      // Three descending tones in quick succession
      const tones = [
        { freq: 880, start: 0,   dur: 0.18 },
        { freq: 660, start: 0.2, dur: 0.18 },
        { freq: 440, start: 0.4, dur: 0.35 },
      ];

      tones.forEach(({ freq, start, dur }) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

        gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);

        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.05);
      });
    } catch (e) {
      // Web Audio not available — silent fallback
      console.warn('Web Audio unavailable:', e);
    }
  }

  /** Start the countdown */
  function start(onTick, onEnd) {
    stop(); // clear any previous
    _seconds = DURATION;
    _onTick  = onTick;
    _onEnd   = onEnd;

    _updateDisplay(_seconds);

    _intervalId = setInterval(() => {
      _seconds--;
      _updateDisplay(_seconds);
      if (_onTick) _onTick(_seconds);

      if (_seconds <= 0) {
        stop();
        _playBuzzer();
        if (_onEnd) _onEnd();
      }
    }, 1000);
  }

  /** Stop / cancel the countdown */
  function stop() {
    if (_intervalId !== null) {
      clearInterval(_intervalId);
      _intervalId = null;
    }
  }

  /** Reset ring to full without starting */
  function reset() {
    stop();
    _seconds = DURATION;
    _updateDisplay(DURATION);
  }

  return { start, stop, reset };
})();
