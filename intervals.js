// Initialize audio
const guitarSound = new GuitarSound();

let metronomeOn = false;
let metronomeInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize mute button state
    const muteButton = document.getElementById('muteButton');
    muteButton.textContent = guitarSound.isMuted ? '🔇' : '🔊';
    muteButton.classList.toggle('muted', guitarSound.isMuted);
    
    // Add click handler
    muteButton.onclick = () => guitarSound.toggleMute();
    
    // Add keyboard shortcut
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'm') {
            guitarSound.toggleMute();
        }
    });

    const metroButton = document.getElementById('metroButton');
    metroButton.onclick = () => {
        metronomeOn = !metronomeOn;
        metroButton.textContent = metronomeOn ? 'Metronome On' : 'Metronome Off';
        const tempo = document.getElementById('tempo').value;
        if (metronomeOn) {
            // Set the interval for the metronome tick, matching the BPM
            metronomeInterval = setInterval(playMetronomeTick, (60 / tempo) * 1000);
        } else {
            clearInterval(metronomeInterval);
            metronomeInterval = null;
        }
    };

    // (Optional) Update metronome timing if the tempo slider changes:
    const tempoSlider = document.getElementById('tempo');
    const tempoValue   = document.getElementById('tempoValue');
    tempoSlider.oninput = function() {
        // Update tempo indicator element
        tempoValue.textContent = this.value;

        // Update metronome interval if active
        if (metronomeOn) {
            clearInterval(metronomeInterval);
            metronomeInterval = setInterval(playMetronomeTick, (60 / this.value) * 1000);
        }
    };
});

const FRET_NOTES = {
    e: {  // high E string
        0: "E",
        1: "F",
        2: "F#/Gb",
        3: "G",
        4: "G#/Ab",
        5: "A"
    },
    B: {
        0: "B",
        1: "C",
        2: "C#/Db",
        3: "D",
        4: "D#/Eb",
        5: "E"
    },
    G: {
        0: "G",
        1: "G#/Ab",
        2: "A",
        3: "A#/Bb",
        4: "B",
        5: "C"
    },
    D: {
        0: "D",
        1: "D#/Eb",
        2: "E",
        3: "F",
        4: "F#/Gb",
        5: "G"
    },
    A: {
        0: "A",
        1: "A#/Bb",
        2: "B",
        3: "C",
        4: "C#/Db",
        5: "D"
    },
    E: {  // low E string
        0: "E",
        1: "F",
        2: "F#/Gb",
        3: "G",
        4: "G#/Ab",
        5: "A"
    }
}; 

// All possible notes in order
const ALL_NOTES = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"];

// Scale patterns (steps between notes)
const SCALE_PATTERNS = {
    major: [2, 2, 1, 2, 2, 2, 1] // Whole, Whole, Half, Whole, Whole, Whole, Half
};

// Add more scales to test
const TEST_SCALES = [
    "C",  // C major (no sharps/flats)
    "G",  // G major (F#)
    "D",  // D major (F#, C#)
    "A",  // A major (F#, C#, G#)
    "E",  // E major (F#, C#, G#, D#)
    "F"   // F major (Bb)
];

// Add a validation map for known good positions
const VALID_POSITIONS = {
    thirds: {
        'E-G': [
            { string1: 'e', fret1: 0, string2: 'G', fret2: 0 },  // Open E to open G
            { string1: 'B', fret1: 5, string2: 'G', fret2: 0 }   // 5th fret B to open G
            // Add more valid positions from guitar_tab.txt
        ],
        'E-C': [
            { string1: 'e', fret1: 0, string2: 'B', fret2: 1 },  // Open E to 1st fret B (C)
            { string1: 'B', fret1: 5, string2: 'G', fret2: 5 }   // 5th fret B (E) to 5th fret G (C)
        ]
        // Add more third intervals
    }
};

function logPositions(interval) {
    console.log(`\nInterval ${interval.notes}:`);
    interval.positions.forEach((pos, idx) => {
        console.log(`Position ${idx + 1}: ${pos.string1}(${pos.fret1}) to ${pos.string2}(${pos.fret2})`);
    });
}

function getScaleNotes(root) {
    // Handle root notes with flats (e.g., "Bb")
    if (root.includes("/")) {
        root = root.split("/")[0];  // Use the sharp version
    }
    
    const rootIndex = ALL_NOTES.indexOf(root);
    const notes = [];
    let currentIndex = rootIndex;
    
    notes.push(ALL_NOTES[currentIndex]);
    for (let i = 0; i < 6; i++) {
        currentIndex = (currentIndex + SCALE_PATTERNS.major[i]) % 12;
        notes.push(ALL_NOTES[currentIndex]);
    }
    
    return notes;
}

function findFretForNote(string, targetNote) {
    const stringNotes = FRET_NOTES[string];
    for (let fret = 0; fret <= 5; fret++) {
        const note = stringNotes[fret];
        if (note === targetNote || (note.includes('/') && note.split('/').includes(targetNote))) {
            return fret;
        }
    }
    return null;
} 

// Function to find the sixth note from a given note in a scale
function findSixthInScale(startNote, scaleNotes) {
    const startIndex = scaleNotes.indexOf(startNote);
    const sixthIndex = (startIndex + 5) % 7;  // +5 because array is 0-based
    return scaleNotes[sixthIndex];
}

// Function to create tab notation
function createTabNotation(string1, fret1, string2, fret2) {
    const tab = [
        "e|-------|",
        "B|-------|",
        "G|-------|",
        "D|-------|",
        "A|-------|",
        "E|-------|"
    ];
    
    // Replace the dashes with fret numbers
    if (fret1 !== null) {
        tab[STRINGS.indexOf(string1)] = `${string1}|---${fret1}---|`;
    }
    if (fret2 !== null) {
        tab[STRINGS.indexOf(string2)] = `${string2}|---${fret2}---|`;
    }
    
    return tab;
}

// Define strings in order
const STRINGS = ["e", "B", "G", "D", "A", "E"];

// Function to generate all sixths for a scale
function generateSixths(root) {
    const scaleNotes = getScaleNotes(root);
    console.log("\nGenerating sixths for", root, "major scale:", scaleNotes);
    const sixths = [];
    
    for (let i = 0; i < 7; i++) {
        const startNote = scaleNotes[i];
        const sixthNote = findSixthInScale(startNote, scaleNotes);
        console.log(`\nFinding positions for ${startNote}-${sixthNote}`);
        
        const allPositions = findIntervalPositions(startNote, sixthNote);
        console.log(`Found ${allPositions.length} positions`);
        
        if (allPositions.length > 0) {
            sixths.push({
                notes: `${startNote}-${sixthNote}`,
                positions: allPositions
            });
            logPositions(sixths[sixths.length - 1]);
        }
    }
    
    return sixths;
}

// Function to find best positions for an interval
function findIntervalPositions(note1, note2, intervalType = 'sixths') {
    // For both thirds and sixths: first note should be lower than second note
    const stringPairs = intervalType === 'sixths' ? [
        // For sixths: lower string to higher string (ascending)
        ["G", "e"],    // 3 to 1
        ["D", "B"],    // 4 to 2
        ["A", "G"],    // 5 to 3
        ["E", "D"]     // 6 to 4
    ] : [
        // For thirds: only adjacent strings (ascending)
        ["B", "e"],    // 2 to 1
        ["G", "B"],    // 3 to 2
        ["D", "G"],    // 4 to 3
        ["A", "D"],    // 5 to 4
        ["E", "A"]     // 6 to 5
    ];

    const positions = [];

    function notesMatch(actual, expected) {
        return actual === expected || 
               (actual.includes('/') && actual.split('/').includes(expected)) ||
               (expected.includes('/') && expected.split('/').includes(actual));
    }

    for (const [string1, string2] of stringPairs) {
        if (string1 === string2) continue;
        
        const fret1 = findFretForNote(string1, note1);
        const fret2 = findFretForNote(string2, note2);
        
        if (fret1 !== null && fret2 !== null && fret1 <= 5 && fret2 <= 5) {
            const actualNote1 = FRET_NOTES[string1][fret1];
            const actualNote2 = FRET_NOTES[string2][fret2];
            
            if (notesMatch(actualNote1, note1) && notesMatch(actualNote2, note2)) {
                positions.push({ 
                    string1, 
                    fret1, 
                    string2, 
                    fret2,
                    note1: actualNote1,
                    note2: actualNote2
                });
            }
        }
    }
    
    return positions;
}

// Helper function to get a random position for playing
function getRandomPosition(interval) {
    const positions = interval.positions;
    const randomIndex = Math.floor(Math.random() * positions.length);
    return positions[randomIndex];
} 

function playInterval(scale, intervalType) {
    let intervals = intervalType === 'sixths' ? generateSixths(scale) : generateThirds(scale);
    
    // Check if we have any valid intervals
    if (!intervals || intervals.length === 0) {
        console.error('No valid intervals found');
        return;
    }
    
    let currentIndex = 0;
    let currentPositionIndex = 0;
    let isPaused = false;
    let intervalId = null;
    const mode = document.getElementById('practiceMode').value;

    // Get UI elements
    const playButton = document.getElementById('playButton');
    const pauseButton = document.getElementById('pauseButton');
    const tabDisplay = document.getElementById('tabDisplay');
    const noteDisplay = document.getElementById('noteDisplay');

    function togglePause() {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
        
        if (isPaused) {
            clearInterval(intervalId);
            intervalId = null;
        } else {
            const tempo = document.getElementById('tempo').value;
            intervalId = setInterval(showInterval, (60 / tempo) * 1000);
        }
    }

    function getNextPosition() {
        const interval = intervals[currentIndex];
        // Add safety check
        if (!interval || !interval.positions || interval.positions.length === 0) {
            console.error('Invalid interval or no positions available');
            if (intervalId) clearInterval(intervalId);
            playButton.textContent = 'Play';
            playButton.onclick = startPlaying;
            return null;
        }

        let position;

        switch(mode) {
            case 'breadth':
                // Complete one position for all intervals before moving to next position
                position = interval.positions[currentPositionIndex % interval.positions.length];
                if (currentIndex === intervals.length - 1) {
                    currentPositionIndex++; // Move to next position set after completing all intervals
                }
                currentIndex = (currentIndex + 1) % intervals.length;
                break;

            case 'depth':
                // If we've shown all positions for this interval
                if (currentPositionIndex >= interval.positions.length) {
                    currentPositionIndex = 0;  // Reset position index
                    currentIndex = (currentIndex + 1) % intervals.length;  // Move to next interval
                }
                position = intervals[currentIndex].positions[currentPositionIndex];
                currentPositionIndex++;
                break;

            case 'random':
                // Random interval and random position
                currentIndex = Math.floor(Math.random() * intervals.length);
                const randomInterval = intervals[currentIndex];
                position = randomInterval.positions[Math.floor(Math.random() * randomInterval.positions.length)];
                break;
        }

        return { interval: intervals[currentIndex], position };
    }

    function showInterval() {
        const next = getNextPosition();
        if (!next) return;  // Exit if no valid position
        
        const { interval, position } = next;
        
        // Display the tab
        const tab = createTabNotation(position.string1, position.fret1, position.string2, position.fret2);
        tabDisplay.innerHTML = tab.map(line => line + '<br>').join('');
        
        // Display the neck diagram
        const neckDiagram = createNeckDiagram(position.string1, position.fret1, position.string2, position.fret2);
        document.getElementById('neckDisplay').innerHTML = neckDiagram;
        
        // Get actual notes from the fret positions
        const actualNote1 = FRET_NOTES[position.string1][position.fret1];
        const actualNote2 = FRET_NOTES[position.string2][position.fret2];
        
        // Display the notes in order (low to high for both thirds and sixths)
        noteDisplay.textContent = `${actualNote1}-${actualNote2}`;
        document.getElementById('intervalCount').textContent = 
            `Interval ${currentIndex + 1} of ${intervals.length}`;
        
        // Pass string information when playing notes
        guitarSound.playInterval(actualNote1, actualNote2, position.string1, position.string2);
    }

    // Start playing
    showInterval();
    const tempo = document.getElementById('tempo').value;
    intervalId = setInterval(showInterval, (60 / tempo) * 1000);
    
    // Update play button to stop
    playButton.textContent = 'Stop';
    pauseButton.disabled = false;
    
    playButton.onclick = () => {
        if (intervalId) clearInterval(intervalId);
        playButton.textContent = 'Play';
        pauseButton.disabled = true;
        pauseButton.textContent = 'Pause';
        isPaused = false;
        playButton.onclick = startPlaying;
    };
    
    pauseButton.onclick = togglePause;
}

// Update startPlaying to be async
async function startPlaying() {
    try {
        // Try to initialize audio but don't block if it fails
        try {
            await guitarSound.initAudio();
        } catch (audioError) {
            console.warn('Audio not available:', audioError);
            // Continue without audio
        }
        
        const scale = document.getElementById('scale').value;
        const intervalType = document.querySelector('input[name="interval"]:checked').value;
        playInterval(scale, intervalType);
    } catch (error) {
        console.error('Error starting playback:', error);
        // Reset button state if something goes wrong
        const playButton = document.getElementById('playButton');
        playButton.textContent = 'Play';
        playButton.onclick = () => {
            startPlaying().catch(console.error);
        };
    }
}

// Update the click handler to handle the async function
document.getElementById('playButton').onclick = () => {
    startPlaying().catch(error => {
        console.error('Error in startPlaying:', error);
    });
};

// Function to find the third note from a given note in a scale
function findThirdInScale(startNote, scaleNotes) {
    const startIndex = scaleNotes.indexOf(startNote);
    const thirdIndex = (startIndex + 2) % 7;  // +2 for third (array is 0-based)
    return scaleNotes[thirdIndex];
}

function generateThirds(root) {
    const scaleNotes = getScaleNotes(root);
    console.log("Scale notes:", scaleNotes);
    const thirds = [];
    
    for (let i = 0; i < 7; i++) {
        const startNote = scaleNotes[i];
        const thirdNote = findThirdInScale(startNote, scaleNotes);
        console.log(`Checking third ${i + 1}: ${startNote}-${thirdNote}`);
        
        const allPositions = findIntervalPositions(startNote, thirdNote, 'thirds');
        console.log(`Found ${allPositions.length} positions`);
        
        if (allPositions.length > 0) {
            thirds.push({
                notes: `${startNote}-${thirdNote}`,
                positions: allPositions
            });
        } else {
            console.log(`No positions found for ${startNote}-${thirdNote}`);
        }
    }
    
    console.log("Total thirds generated:", thirds.length);
    return thirds;
} 

function testScale(root) {
    console.log(`\nTesting ${root} major scale:`);
    const scaleNotes = getScaleNotes(root);
    
    console.log("\nValidating Thirds:");
    const thirds = generateThirds(root);
    thirds.forEach(third => {
        console.log(`\nThird ${third.notes}:`);
        third.positions.forEach(pos => {
            const note1 = FRET_NOTES[pos.string1][pos.fret1];
            const note2 = FRET_NOTES[pos.string2][pos.fret2];
            const isValid = validatePosition(pos, third.notes.split('-')[0], third.notes.split('-')[1]);
            console.log(`${pos.string1}(${pos.fret1}):${note1} to ${pos.string2}(${pos.fret2}):${note2} - ${isValid ? '✓' : '✗'}`);
        });
    });

    console.log("\nValidating Sixths:");
    const sixths = generateSixths(root);
    sixths.forEach(sixth => {
        console.log(`\nSixth ${sixth.notes}:`);
        sixth.positions.forEach(pos => {
            const note1 = FRET_NOTES[pos.string1][pos.fret1];
            const note2 = FRET_NOTES[pos.string2][pos.fret2];
            const isValid = validatePosition(pos, sixth.notes.split('-')[0], sixth.notes.split('-')[1]);
            console.log(`${pos.string1}(${pos.fret1}):${note1} to ${pos.string2}(${pos.fret2}):${note2} - ${isValid ? '✓' : '✗'}`);
        });
    });
}

function validatePosition(pos, expectedNote1, expectedNote2) {
    // First check: different strings
    if (pos.string1 === pos.string2) {
        console.log(`Invalid: same string ${pos.string1}`);
        return false;
    }

    const actualNote1 = FRET_NOTES[pos.string1][pos.fret1];
    const actualNote2 = FRET_NOTES[pos.string2][pos.fret2];
    
    // Check if notes match (including enharmonic equivalents)
    const note1Valid = actualNote1 === expectedNote1 || 
                      (actualNote1.includes('/') && actualNote1.split('/').includes(expectedNote1));
    const note2Valid = actualNote2 === expectedNote2 || 
                      (actualNote2.includes('/') && actualNote2.split('/').includes(expectedNote2));
    
    return note1Valid && note2Valid;
}

function validateAllPositions() {
    console.log("\nValidating All Positions:");
    
    // Test all scales
    TEST_SCALES.forEach(scale => {
        console.log(`\n=== ${scale} Major Scale ===`);
        const scaleNotes = getScaleNotes(scale);
        
        console.log("\nValidating Thirds:");
        const thirds = generateThirds(scale);
        thirds.forEach(third => {
            console.log(`\nThird ${third.notes}:`);
            third.positions.forEach(pos => {
                const note1 = FRET_NOTES[pos.string1][pos.fret1];
                const note2 = FRET_NOTES[pos.string2][pos.fret2];
                const isValid = validatePosition(pos, third.notes.split('-')[0], third.notes.split('-')[1]);
                console.log(`${pos.string1}(${pos.fret1}):${note1} to ${pos.string2}(${pos.fret2}):${note2} - ${isValid ? '✓' : '✗'}`);
            });
        });

        console.log("\nValidating Sixths:");
        const sixths = generateSixths(scale);
        sixths.forEach(sixth => {
            console.log(`\nSixth ${sixth.notes}:`);
            sixth.positions.forEach(pos => {
                const note1 = FRET_NOTES[pos.string1][pos.fret1];
                const note2 = FRET_NOTES[pos.string2][pos.fret2];
                const isValid = validatePosition(pos, sixth.notes.split('-')[0], sixth.notes.split('-')[1]);
                console.log(`${pos.string1}(${pos.fret1}):${note1} to ${pos.string2}(${pos.fret2}):${note2} - ${isValid ? '✓' : '✗'}`);
            });
        });
    });
}

// Run validation after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    validateAllPositions();
});

// Add after the other event listeners
const tempoSlider = document.getElementById('tempo');
const tempoValue = document.getElementById('tempoValue');

// Update tempo display and restart if playing
tempoSlider.oninput = function() {
    // Update the display value
    tempoValue.textContent = this.value;
    
    // If currently playing, restart with new tempo
    const playButton = document.getElementById('playButton');
    if (playButton.textContent === 'Stop') {
        playButton.click();  // Stop
        playButton.click();  // Start again with new tempo
    }
};

// Initialize tempo display with default value
tempoValue.textContent = tempoSlider.value;

function createNeckDiagram(string1, fret1, string2, fret2) {
    const svg = `
    <svg viewBox="0 0 220 150">
        <!-- Neck -->
        <rect x="30" y="10" width="180" height="130" fill="#f4d03f"/>
        
        <!-- Fret lines and numbers -->
        ${[0,1,2,3,4,5].map(i => `
            <line x1="${30 + (i * 30)}" y1="10" x2="${30 + (i * 30)}" y2="140" 
                  stroke="black" stroke-width="2"/>
            <text x="${45 + (i * 30)}" y="145" 
                  font-size="12" text-anchor="middle">${i + 1}</text>
        `).join('')}
        
        <!-- String names -->
        ${STRINGS.map((s, i) => `
            <text x="20" y="${25 + (i * 22)}" 
                  font-size="12" text-anchor="middle">${s}</text>
        `).join('')}
        
        <!-- Strings -->
        ${[0,1,2,3,4,5].map(i => 
            `<line x1="30" y1="${20 + (i * 22)}" x2="210" y2="${20 + (i * 22)}" 
                   stroke="black" stroke-width="1"/>`
        ).join('')}
        
        <!-- Finger positions -->
        <circle cx="${30 + (fret1 * 30) - 15}" cy="${20 + (STRINGS.indexOf(string1) * 22)}" 
                r="8" fill="red"/>
        <circle cx="${30 + (fret2 * 30) - 15}" cy="${20 + (STRINGS.indexOf(string2) * 22)}" 
                r="8" fill="blue"/>
    </svg>`;
    
    return svg;
}

// Function to play a metronome tick using an mp3 file
function playMetronomeTick() {
    const audio = new Audio('metronome.mp3');
    audio.play().catch(e => console.error('Metronome tick failed to play:', e));
}

// NEW: Mapping of scale formulas (all in semitones)
const SCALE_INTERVALS = {
  "Major": [2,2,1,2,2,2,1],
  "Minor": [2,1,2,2,1,2,2],
  "Pentatonic": [3,2,2,3,2], // Minor pentatonic
  "Blues": [3,2,1,1,3,2],
  "Dorian": [2,1,2,2,2,1,2],
  "Phrygian": [1,2,2,2,1,2,2],
  "Lydian": [2,2,2,1,2,2,1],
  "Mixolydian": [2,2,1,2,2,1,2],
  "Locrian": [1,2,2,1,2,2,2],
  "Harmonic Minor": [2,1,2,2,1,3,1],
  "Melodic Minor": [2,1,2,2,2,2,1]
};

// NEW: Generate array of scale notes based on key and scale type.
function generateScaleNotes(key, scaleType) {
    const formula = SCALE_INTERVALS[scaleType];
    if (!formula) return [];
    const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    let scale = [key];
    let currentIndex = notes.indexOf(key);
    if (currentIndex === -1) return [];
    for (let i = 0; i < formula.length; i++) {
       currentIndex = (currentIndex + formula[i]) % 12;
       scale.push(notes[currentIndex]);
    }
    return scale;
}

// NEW: Given a note, return a practical position on the fretboard.
// Try strings in order from high to low.
function getScalePosition(note) {
    const stringsOrder = ["e", "B", "G", "D", "A", "E"];
    for (const s of stringsOrder) {
        const fret = findFretForNote(s, note);
        if (fret !== null && fret <= 5) {
            return { string: s, fret: fret };
        }
    }
    return null;
}

// NEW: Create a guitar neck diagram for scale mode (highlight one note).
function createNeckDiagramForScale(pos) {
    if (!pos) return "";
    const svg = `
    <svg viewBox="0 0 220 150">
        <!-- Neck background -->
        <rect x="30" y="10" width="180" height="130" fill="#f4d03f"/>
        
        <!-- Fret lines with numbers (1-6) -->
        ${[0,1,2,3,4,5].map(i => `
            <line x1="${30 + (i * 30)}" y1="10" x2="${30 + (i * 30)}" y2="140" stroke="black" stroke-width="2"/>
            <text x="${45 + (i * 30)}" y="145" font-size="12" text-anchor="middle">${i+1}</text>
        `).join('')}
        
        <!-- String labels -->
        ${STRINGS.map((s, i) => `
            <text x="20" y="${25 + (i * 22)}" font-size="12" text-anchor="middle">${s}</text>
        `).join('')}
        
        <!-- Strings -->
        ${[0,1,2,3,4,5].map(i => 
            `<line x1="30" y1="${20 + (i * 22)}" x2="210" y2="${20 + (i * 22)}" stroke="black" stroke-width="1"/>`
        ).join('')}
        
        <!-- Highlighted note position -->
        <circle cx="${30 + (pos.fret * 30) - 15}" cy="${20 + (STRINGS.indexOf(pos.string) * 22)}" r="8" fill="red"/>
    </svg>
    `;
    return svg;
}

// NEW: Create a simple guitar tab representation for a single note using its position.
function createScaleTab(note) {
    const pos = getScalePosition(note);
    let tab = "";
    // STRINGS is assumed to be defined globally as: ["e", "B", "G", "D", "A", "E"]
    STRINGS.forEach(s => {
        let line = s + "|";
        if (pos && pos.string === s) {
            // Place fret number at center (adjust spacing as needed)
            line += "---" + pos.fret + "---";
        } else {
            line += "-------";
        }
        tab += line + "\n";
    });
    return tab;
}

// NEW: Create a full scale tab showing the entire scale, with the current note highlighted.
function createFullScaleTab(scaleNotes, currentIndex) {
    let tab = "";
    // STRINGS is assumed to be defined globally as: ["e", "B", "G", "D", "A", "E"]
    STRINGS.forEach(s => {
        let line = s + "|";
        scaleNotes.forEach((note, idx) => {
            const pos = getLowScalePosition(note);
            let cell = "-------";
            if (pos && pos.string === s) {
                let fretStr = String(pos.fret);
                if (idx === currentIndex) {
                    fretStr = "[" + fretStr + "]"; // highlight current note
                }
                // Force a fixed width cell of 7 characters.
                cell = fretStr.padStart(3, "-").padEnd(7, "-");
            }
            line += cell;
        });
        tab += line + "\n";
    });
    return tab;
}

// NEW: Play scale mode.
// Modified to update UI: switch play button to "Stop", enable pause button,
// show both a text (letters) representation and a tab representation.
function playScaleMode(scaleType, key) {
    const scaleNotes = generateScaleNotes(key, scaleType);
    if (!scaleNotes || scaleNotes.length === 0) {
        console.error("No scale notes generated.");
        return;
    }
    let currentIndex = 0;
    const tabDisplay = document.getElementById('tabDisplay');      // Letters representation
    const scaleTabDisplay = document.getElementById('scaleTabDisplay');  // Tab representation
    const neckDisplay = document.getElementById('neckDisplay');
    const playButton = document.getElementById('playButton');
    const pauseButton = document.getElementById('pauseButton');
    let scaleIntervalId = null;
  
    function updateScaleDisplay() {
        // Compute ascending positions for the entire scale.
        const positions = getAscendingScalePositions(scaleNotes);
        // Show the full scale tab with current note highlighted using the computed positions.
        scaleTabDisplay.textContent = createFullScaleTabFromPositions(scaleNotes, positions, currentIndex);
        
        // Update neck diagram for current note using the ascending (continuous) position.
        const pos = positions[currentIndex];
        neckDisplay.innerHTML = createNeckDiagramForScale(pos);
        
        // Play the note. Use the string from the position (fallback to "e").
        const stringUsed = pos ? pos.string : "e";
        guitarSound.playNote(guitarSound.noteToFrequency(scaleNotes[currentIndex], stringUsed));
    }
  
    updateScaleDisplay();
    // Use tempo from the BPM slider
    const tempo = document.getElementById('tempo').value;
    scaleIntervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % scaleNotes.length;
        updateScaleDisplay();
    }, (60 / tempo) * 1000);
  
    // Update UI: change Play button to Stop and enable Pause.
    playButton.textContent = "Stop";
    pauseButton.disabled = false;
  
    // Override playButton click to function as Stop in scale mode.
    playButton.onclick = () => {
        clearInterval(scaleIntervalId);
        playButton.textContent = "Play";
        pauseButton.disabled = true;
        // Reassign playButton's onclick to resume scale mode using the current selections.
        playButton.onclick = () => {
            const newScaleType = document.getElementById('scaleType').value;
            const newScaleKey  = document.getElementById('scaleKey').value;
            playScaleMode(newScaleType, newScaleKey);
        };
    };
}

// NEW: Get lowest possible position for a given note (using low-to-high string order).
function getLowScalePosition(note) {
    const lowToHighStrings = ["E", "A", "D", "G", "B", "e"];
    for (const s of lowToHighStrings) {
        const fret = findFretForNote(s, note);
        if (fret !== null && fret <= 5) {
            return { string: s, fret: fret };
        }
    }
    return null;
}

// NEW: Compute ascending scale positions ensuring a continuous fingering.
// We want the scale notes to be played on positions that follow the ascending (low-to-high strings) order.
function getAscendingScalePositions(scaleNotes) {
    let positions = [];
    // Define string order from lowest pitched (6th E) to highest (1st e)
    const orderedStrings = ["E", "A", "D", "G", "B", "e"];
    // Define offset: E = 0, A = 10, D = 20, G = 30, B = 40, e = 50.
    const offset = { 'E': 0, 'A': 10, 'D': 20, 'G': 30, 'B': 40, 'e': 50 };
    scaleNotes.forEach((note, i) => {
        let candidates = [];
        orderedStrings.forEach(s => {
            const fret = findFretForNote(s, note);
            if (fret !== null) {
                candidates.push({ string: s, fret: fret, order: offset[s] + fret });
            }
        });
        candidates.sort((a, b) => a.order - b.order);
        if (i === 0) {
            positions.push(candidates[0] || null);
        } else {
            const prevOrder = positions[i - 1] ? positions[i - 1].order : -1;
            // Only allow candidates with an order greater than the previous note.
            let validCandidates = candidates.filter(c => c.order > prevOrder);
            let candidate = validCandidates.length > 0 ? validCandidates[0]
                              : (candidates.length > 0 ? candidates[candidates.length - 1] : null);
            positions.push(candidate);
        }
    });
    return positions;
}

// NEW: Create a full scale tab using an array of positions, with the current note highlighted.
function createFullScaleTabFromPositions(scaleNotes, positions, currentIndex) {
    let tab = "";
    // STRINGS is assumed to be defined globally as: ["e", "B", "G", "D", "A", "E"]
    STRINGS.forEach(s => {
        let line = s + "|";
        scaleNotes.forEach((note, idx) => {
            let cell = "-------";
            const pos = positions[idx];
            if (pos && pos.string === s) {
                let fretStr = String(pos.fret);
                if (idx === currentIndex) {
                    fretStr = "[" + fretStr + "]"; // highlight current note
                }
                // Force a fixed-width cell of 7 characters.
                cell = fretStr.padStart(3, "-").padEnd(7, "-");
            }
            line += cell;
        });
        tab += line + "\n";
    });
    return tab;
}