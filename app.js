let isPlaying = false;
let currentInterval;
let tempo;
let intervalType;
let scale;

function init() {
    const playButton = document.getElementById('playButton');
    const tempoSlider = document.getElementById('tempo');
    const tempoValue = document.getElementById('tempoValue');

    playButton.addEventListener('click', togglePlay);
    tempoSlider.addEventListener('input', (e) => {
        tempo = e.target.value;
        tempoValue.textContent = tempo;
    });

    // Initialize values
    tempo = tempoSlider.value;
    intervalType = document.querySelector('input[name="interval"]:checked').value;
    scale = document.getElementById('scale').value;

    // Add listeners for interval and scale changes
    document.querySelectorAll('input[name="interval"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            intervalType = e.target.value;
            if (isPlaying) showRandomInterval();
        });
    });

    document.getElementById('scale').addEventListener('change', (e) => {
        scale = e.target.value;
        if (isPlaying) showRandomInterval();
    });
}

function togglePlay() {
    isPlaying = !isPlaying;
    const playButton = document.getElementById('playButton');
    playButton.textContent = isPlaying ? 'Stop' : 'Play';
    
    if (isPlaying) {
        showRandomInterval();
        startIntervalLoop();
    }
}

function showRandomInterval() {
    const intervals = INTERVALS[intervalType][scale];
    const randomInterval = intervals[Math.floor(Math.random() * intervals.length)];
    
    const tabDisplay = document.getElementById('tabDisplay');
    const noteDisplay = document.getElementById('noteDisplay');
    
    tabDisplay.textContent = randomInterval.tab.join('\n');
    noteDisplay.textContent = randomInterval.notes;
    
    currentInterval = randomInterval;
}

function startIntervalLoop() {
    if (!isPlaying) return;
    
    showRandomInterval();
    setTimeout(() => {
        if (isPlaying) startIntervalLoop();
    }, (60 / tempo) * 1000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init); 