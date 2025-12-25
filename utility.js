// UTILITY FUNCTIONS

/**
 * @param {number} ms - 
 * @param {boolean} includeMs - 
 * @returns {Object} 
 */

function formatTime(ms, includeMs = true) {

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
 * @param {number} frequency -
 * @param {number} duration - 
 */
function playBeep(frequency = 800, duration = 0.5) {
    try {

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();

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
