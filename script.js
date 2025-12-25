/**
 * ========================================
 * DIGITAL STOPWATCH & TIMER APPLICATION
 * ========================================
 * 
 * A professional stopwatch and countdown timer
 * built with vanilla JavaScript.
 * 
 * Features:
 * - Stopwatch with lap recording
 * - Countdown timer with custom duration
 * - Sound alerts on timer completion
 * - Smooth UI updates
 * - Input validation
 * 
 * Author: Digital Timer App
 * Version: 1.0.0
 */

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Formats milliseconds into time components
 * @param {number} ms - Time in milliseconds
 * @param {boolean} includeMs - Whether to include milliseconds
 * @returns {Object} Time components (hours, minutes, seconds, milliseconds)
 */
function formatTime(ms, includeMs = true) {
  // Ensure non-negative value
  const totalMs = Math.max(0, ms);
  const totalSeconds = Math.floor(totalMs / 1000);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((totalMs % 1000) / 10);

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    milliseconds: String(milliseconds).padStart(2, '0')
  };
}

/**
 * Creates a beep sound using Web Audio API
 * @param {number} frequency - Sound frequency in Hz
 * @param {number} duration - Sound duration in seconds
 */
function playBeep(frequency = 800, duration = 0.5) {
  try {
    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Create oscillator for the beep
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Set volume envelope
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.log('Audio not supported:', error);
  }
}


// ========================================
// STOPWATCH MODULE
// ========================================
const Stopwatch = (function() {
  // DOM Elements
  const display = document.getElementById('stopwatch-display');
  const startBtn = document.getElementById('stopwatch-start');
  const pauseBtn = document.getElementById('stopwatch-pause');
  const resetBtn = document.getElementById('stopwatch-reset');
  const lapBtn = document.getElementById('stopwatch-lap');
  const lapList = document.getElementById('lap-list');
  const lapCountEl = document.getElementById('lap-count');

  // State variables
  let isRunning = false;
  let startTime = 0;
  let elapsedTime = 0;
  let intervalId = null;
  let laps = [];

  /**
   * Updates the stopwatch display
   */
  function updateDisplay() {
    const time = formatTime(elapsedTime);
    
    // Update display HTML
    display.innerHTML = `
      <span class="time-hours">${time.hours}</span>
      <span class="time-separator">:</span>
      <span class="time-minutes">${time.minutes}</span>
      <span class="time-separator">:</span>
      <span class="time-seconds">${time.seconds}</span>
      <span class="time-separator">.</span>
      <span class="time-milliseconds">${time.milliseconds}</span>
    `;
  }

  /**
   * Updates button states based on stopwatch state
   */
  function updateButtons() {
    startBtn.disabled = isRunning;
    pauseBtn.disabled = !isRunning;
    resetBtn.disabled = !isRunning && elapsedTime === 0;
    lapBtn.disabled = !isRunning;
  }

  /**
   * Renders the lap list
   */
  function renderLaps() {
    // Update lap count
    const lapText = laps.length === 1 ? '1 lap' : `${laps.length} laps`;
    lapCountEl.textContent = lapText;
    
    // Show empty message if no laps
    if (laps.length === 0) {
      lapList.innerHTML = '<p class="lap-empty">No laps recorded yet</p>';
      return;
    }
    
    // Build lap list HTML (newest first)
    let html = '';
    for (let i = laps.length - 1; i >= 0; i--) {
      const lap = laps[i];
      const totalTime = formatTime(lap.total);
      const diffTime = formatTime(lap.diff);
      
      html += `
        <div class="lap-item">
          <span class="lap-number">Lap ${lap.number}</span>
          <span class="lap-diff">+${diffTime.minutes}:${diffTime.seconds}.${diffTime.milliseconds}</span>
          <span class="lap-time">${totalTime.hours}:${totalTime.minutes}:${totalTime.seconds}.${totalTime.milliseconds}</span>
        </div>
      `;
    }
    
    lapList.innerHTML = html;
  }

  /**
   * Starts the stopwatch
   */
  function start() {
    if (isRunning) return;
    
    isRunning = true;
    startTime = Date.now() - elapsedTime;
    
    // Update every 10ms for smooth display
    intervalId = setInterval(function() {
      elapsedTime = Date.now() - startTime;
      updateDisplay();
    }, 10);
    
    updateButtons();
  }

  /**
   * Pauses the stopwatch
   */
  function pause() {
    if (!isRunning) return;
    
    isRunning = false;
    clearInterval(intervalId);
    intervalId = null;
    
    updateButtons();
  }

  /**
   * Resets the stopwatch
   */
  function reset() {
    pause();
    elapsedTime = 0;
    laps = [];
    
    updateDisplay();
    updateButtons();
    renderLaps();
  }

  /**
   * Records a lap time
   */
  function recordLap() {
    if (!isRunning) return;
    
    const lapTime = elapsedTime;
    const prevLapTime = laps.length > 0 ? laps[laps.length - 1].total : 0;
    const diff = lapTime - prevLapTime;
    
    // Add new lap
    laps.push({
      number: laps.length + 1,
      total: lapTime,
      diff: diff
    });
    
    renderLaps();
  }

  /**
   * Initializes the stopwatch
   */
  function init() {
    // Attach event listeners
    startBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', pause);
    resetBtn.addEventListener('click', reset);
    lapBtn.addEventListener('click', recordLap);
    
    // Initial render
    updateDisplay();
    updateButtons();
    renderLaps();
  }

  // Public API
  return {
    init: init
  };
})();


// ========================================
// COUNTDOWN TIMER MODULE
// ========================================
const Timer = (function() {
  // DOM Elements
  const display = document.getElementById('timer-display');
  const hoursInput = document.getElementById('timer-hours');
  const minutesInput = document.getElementById('timer-minutes');
  const secondsInput = document.getElementById('timer-seconds');
  const startBtn = document.getElementById('timer-start');
  const pauseBtn = document.getElementById('timer-pause');
  const resetBtn = document.getElementById('timer-reset');
  const overlay = document.getElementById('timer-complete-overlay');
  const dismissBtn = document.getElementById('timer-dismiss');

  // State variables
  let isRunning = false;
  let remainingTime = 0;
  let totalTime = 0;
  let intervalId = null;
  let endTime = 0;

  /**
   * Gets time from input fields in milliseconds
   * @returns {number} Total time in milliseconds
   */
  function getInputTime() {
    const hours = Math.max(0, parseInt(hoursInput.value) || 0);
    const minutes = Math.max(0, Math.min(59, parseInt(minutesInput.value) || 0));
    const seconds = Math.max(0, Math.min(59, parseInt(secondsInput.value) || 0));
    
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  /**
   * Updates the timer display
   */
  function updateDisplay() {
    const time = formatTime(remainingTime, false);
    
    // Update display HTML
    display.innerHTML = `
      <span class="time-hours">${time.hours}</span>
      <span class="time-separator">:</span>
      <span class="time-minutes">${time.minutes}</span>
      <span class="time-separator">:</span>
      <span class="time-seconds">${time.seconds}</span>
    `;
    
    // Update display color based on remaining time
    display.classList.remove('warning', 'danger');
    
    if (remainingTime <= 10000 && remainingTime > 0) {
      display.classList.add('danger');
    } else if (remainingTime <= 30000 && remainingTime > 0) {
      display.classList.add('warning');
    }
  }

  /**
   * Updates display from input values
   */
  function updateDisplayFromInputs() {
    if (!isRunning) {
      remainingTime = getInputTime();
      totalTime = remainingTime;
      updateDisplay();
      updateButtons();
    }
  }

  /**
   * Updates button states based on timer state
   */
  function updateButtons() {
    const hasTime = remainingTime > 0 || getInputTime() > 0;
    
    startBtn.disabled = isRunning || !hasTime;
    pauseBtn.disabled = !isRunning;
    resetBtn.disabled = !isRunning && remainingTime === totalTime && totalTime === getInputTime();
    
    // Enable/disable inputs based on running state
    hoursInput.disabled = isRunning;
    minutesInput.disabled = isRunning;
    secondsInput.disabled = isRunning;
  }

  /**
   * Validates input field value
   * @param {HTMLInputElement} input - The input element
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   */
  function validateInput(input, min, max) {
    let value = parseInt(input.value) || 0;
    value = Math.max(min, Math.min(max, value));
    input.value = value;
  }

  /**
   * Shows the timer complete overlay
   */
  function showComplete() {
    overlay.classList.remove('hidden');
    
    // Play alert sound (3 beeps)
    playBeep(800, 0.5);
    setTimeout(function() { playBeep(800, 0.5); }, 300);
    setTimeout(function() { playBeep(800, 0.5); }, 600);
  }

  /**
   * Hides the timer complete overlay
   */
  function hideComplete() {
    overlay.classList.add('hidden');
  }

  /**
   * Starts the countdown timer
   */
  function start() {
    if (isRunning) return;
    
    // Get time from inputs if timer hasn't started yet
    if (remainingTime === 0) {
      remainingTime = getInputTime();
      totalTime = remainingTime;
    }
    
    // Validate that there's time to count down
    if (remainingTime <= 0) {
      return;
    }
    
    isRunning = true;
    endTime = Date.now() + remainingTime;
    
    // Update every 100ms
    intervalId = setInterval(function() {
      remainingTime = Math.max(0, endTime - Date.now());
      updateDisplay();
      
      // Check if timer is complete
      if (remainingTime <= 0) {
        complete();
      }
    }, 100);
    
    updateButtons();
  }

  /**
   * Pauses the countdown timer
   */
  function pause() {
    if (!isRunning) return;
    
    isRunning = false;
    clearInterval(intervalId);
    intervalId = null;
    
    updateButtons();
  }

  /**
   * Resets the countdown timer
   */
  function reset() {
    pause();
    remainingTime = getInputTime();
    totalTime = remainingTime;
    
    updateDisplay();
    updateButtons();
    hideComplete();
  }

  /**
   * Handles timer completion
   */
  function complete() {
    pause();
    remainingTime = 0;
    
    updateDisplay();
    updateButtons();
    showComplete();
  }

  /**
   * Initializes the timer
   */
  function init() {
    // Attach event listeners for buttons
    startBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', pause);
    resetBtn.addEventListener('click', reset);
    dismissBtn.addEventListener('click', function() {
      hideComplete();
      reset();
    });
    
    // Attach event listeners for inputs
    hoursInput.addEventListener('input', function() {
      validateInput(hoursInput, 0, 99);
      updateDisplayFromInputs();
    });
    
    minutesInput.addEventListener('input', function() {
      validateInput(minutesInput, 0, 59);
      updateDisplayFromInputs();
    });
    
    secondsInput.addEventListener('input', function() {
      validateInput(secondsInput, 0, 59);
      updateDisplayFromInputs();
    });
    
    // Handle focus events for better UX
    [hoursInput, minutesInput, secondsInput].forEach(function(input) {
      input.addEventListener('focus', function() {
        this.select();
      });
    });
    
    // Initial render
    updateDisplayFromInputs();
    updateButtons();
  }

  // Public API
  return {
    init: init
  };
})();


// ========================================
// APPLICATION INITIALIZATION
// ========================================

/**
 * Initializes the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize both modules
  Stopwatch.init();
  Timer.init();
  
  console.log('Digital Stopwatch & Timer App initialized successfully!');
});
