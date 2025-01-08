// Initialize audio
const guitarSound = new GuitarSound();

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
    const stringPairs = intervalType === 'thirds' ? [
        ["e", "B"],    // strings 1 and 2 (high E to B)
        ["B", "G"],    // strings 2 and 3 (B to G)
        ["G", "D"],    // strings 3 and 4 (G to D)
        ["D", "A"],    // strings 4 and 5 (D to A)
        ["A", "E"]     // strings 5 and 6 (A to E)
    ] : [
        // Adjacent strings
        ["e", "B"],    // strings 1-2
        ["B", "G"],    // strings 2-3
        ["G", "D"],    // strings 3-4
        ["D", "A"],    // strings 4-5
        ["A", "E"],    // strings 5-6
        
        // One string separation (all combinations)
        ["e", "G"],    // strings 1-3
        ["B", "D"],    // strings 2-4
        ["G", "A"],    // strings 3-5
        ["D", "E"],    // strings 4-6
        ["A", "G"],    // strings 5-3 (reverse)
        ["E", "D"],    // strings 6-4 (reverse)
        ["B", "e"],    // strings 2-1 (reverse)
        ["G", "B"],    // strings 3-2 (reverse)
        ["D", "G"],    // strings 4-3 (reverse)
        ["A", "D"],    // strings 5-4 (reverse)
        ["E", "A"],    // strings 6-5 (reverse)
        
        // Two strings separation (all combinations)
        ["e", "D"],    // strings 1-4
        ["B", "A"],    // strings 2-5
        ["G", "E"],    // strings 3-6
        ["D", "e"],    // strings 4-1 (reverse)
        ["A", "B"],    // strings 5-2 (reverse)
        ["E", "G"]     // strings 6-3 (reverse)
    ];
    
    console.log(`\nFinding positions for ${note1} to ${note2} (${intervalType})`);
    
    const positions = [];

    for (const [string1, string2] of stringPairs) {
        // Skip if same string
        if (string1 === string2) continue;
        
        // Try both note orders
        const combinations = [
            { str1: string1, str2: string2, n1: note1, n2: note2 }
            // Remove reverse order - we want specific note order for intervals
        ];
        
        for (const combo of combinations) {
            const fret1 = findFretForNote(combo.str1, combo.n1);
            const fret2 = findFretForNote(combo.str2, combo.n2);
            
            if (fret1 !== null && fret2 !== null && 
                fret1 <= 5 && fret2 <= 5) {
                
                const actualNote1 = FRET_NOTES[combo.str1][fret1];
                const actualNote2 = FRET_NOTES[combo.str2][fret2];
                
                // Strict note matching - no reversing order
                if ((actualNote1 === combo.n1 || (actualNote1.includes('/') && actualNote1.split('/').includes(combo.n1))) &&
                    (actualNote2 === combo.n2 || (actualNote2.includes('/') && actualNote2.split('/').includes(combo.n2)))) {
                    
                    console.log(`Found valid position: ${combo.str1}(${fret1}):${actualNote1} to ${combo.str2}(${fret2}):${actualNote2}`);
                    positions.push({ 
                        string1: combo.str1, 
                        fret1: fret1, 
                        string2: combo.str2, 
                        fret2: fret2,
                        note1: actualNote1,  // Store actual notes
                        note2: actualNote2
                    });
                }
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
    let currentIndex = 0;
    let currentPositionIndex = 0;
    const mode = document.getElementById('practiceMode').value;

    // Get UI elements
    const playButton = document.getElementById('playButton');
    const tabDisplay = document.getElementById('tabDisplay');
    const noteDisplay = document.getElementById('noteDisplay');

    function getNextPosition() {
        const interval = intervals[currentIndex];
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
        const { interval, position } = getNextPosition();
        
        // Display the tab
        const tab = createTabNotation(position.string1, position.fret1, position.string2, position.fret2);
        tabDisplay.innerHTML = tab.map(line => line + '<br>').join('');
        
        // Get actual notes from the fret positions
        const actualNote1 = FRET_NOTES[position.string1][position.fret1];
        const actualNote2 = FRET_NOTES[position.string2][position.fret2];
        
        // Display the actual notes instead of the interval notes
        noteDisplay.textContent = `${actualNote1}-${actualNote2}`;
        document.getElementById('intervalCount').textContent = 
            `Interval ${currentIndex + 1} of ${intervals.length}`;
        
        // Pass string information when playing notes
        guitarSound.playInterval(actualNote1, actualNote2, position.string1, position.string2);
    }

    // Start playing
    showInterval();
    const tempo = document.getElementById('tempo').value;
    const intervalId = setInterval(showInterval, (60 / tempo) * 1000);
    
    // Update play button to stop
    playButton.textContent = 'Stop';
    playButton.onclick = () => {
        clearInterval(intervalId);
        playButton.textContent = 'Play';
        playButton.onclick = startPlaying;
    };
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