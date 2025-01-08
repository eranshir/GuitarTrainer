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
    const sixths = [];
    
    for (let i = 0; i < 8; i++) {
        const startNote = scaleNotes[i % 7];
        const sixthNote = findSixthInScale(startNote, scaleNotes);
        
        const allPositions = findIntervalPositions(startNote, sixthNote);
        
        if (allPositions.length > 0) {
            sixths.push({
                notes: `${startNote}-${sixthNote}`,
                positions: allPositions  // Store all possible positions
            });
        }
    }
    
    return sixths;
} 

// Function to find best positions for an interval
function findIntervalPositions(note1, note2, intervalType = 'sixths') {
    const stringPairs = intervalType === 'thirds' ? [
        ["e", "B"],    // strings 1 and 2 (high E to B)
        ["B", "G"]     // strings 2 and 3 (B to G)
    ] : [
        // Sixths pairs (both adjacent and separated by one string)
        ["e", "B"],    // strings 1 and 2
        ["B", "G"],    // strings 2 and 3
        ["e", "G"],    // strings 1 and 3
        ["B", "D"],    // strings 2 and 4
        ["G", "A"],    // strings 3 and 5
    ];
    
    console.log(`\nFinding positions for ${note1} to ${note2} (${intervalType})`);
    
    const positions = [];
    
    for (const [string1, string2] of stringPairs) {
        const fret1 = findFretForNote(string1, note1);
        const fret2 = findFretForNote(string2, note2);
        
        if (fret1 !== null && fret2 !== null && 
            fret1 <= 5 && fret2 <= 5 && 
            FRET_NOTES[string1][fret1] === note1 && 
            FRET_NOTES[string2][fret2] === note2 &&
            STRINGS.indexOf(string2) > STRINGS.indexOf(string1)) {
            
            console.log(`Found valid position: ${string1}(${fret1}):${note1} to ${string2}(${fret2}):${note2}`);
            positions.push({ string1, fret1, string2, fret2 });
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
    let intervals;
    switch(intervalType) {
        case 'sixths':
            intervals = generateSixths(scale);
            break;
        case 'thirds':
            intervals = generateThirds(scale);
            break;
        default:
            console.error('Unknown interval type:', intervalType);
            return;
    }

    // Get UI elements
    const playButton = document.getElementById('playButton');
    const tabDisplay = document.getElementById('tabDisplay');
    const noteDisplay = document.getElementById('noteDisplay');

    // Show first interval
    let currentIndex = 0;

    function showInterval() {
        const interval = intervals[currentIndex];
        const position = getRandomPosition(interval);
        
        // Display the tab
        const tab = createTabNotation(position.string1, position.fret1, position.string2, position.fret2);
        tabDisplay.innerHTML = tab.map(line => line + '<br>').join('');
        
        // Display the notes
        noteDisplay.textContent = interval.notes;
        
        // Move to next interval
        currentIndex = (currentIndex + 1) % intervals.length;
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

function startPlaying() {
    const scale = document.getElementById('scale').value;
    const intervalType = document.querySelector('input[name="interval"]:checked').value;
    playInterval(scale, intervalType);
}

// Add click handler to play button
document.getElementById('playButton').onclick = startPlaying; 

// Function to find the third note from a given note in a scale
function findThirdInScale(startNote, scaleNotes) {
    const startIndex = scaleNotes.indexOf(startNote);
    const thirdIndex = (startIndex + 2) % 7;  // +2 for third (array is 0-based)
    return scaleNotes[thirdIndex];
}

function generateThirds(root) {
    const scaleNotes = getScaleNotes(root);
    const thirds = [];
    
    for (let i = 0; i < 8; i++) {
        const startNote = scaleNotes[i % 7];
        const thirdNote = findThirdInScale(startNote, scaleNotes);
        
        const allPositions = findIntervalPositions(startNote, thirdNote, 'thirds');
        
        if (allPositions.length > 0) {
            thirds.push({
                notes: `${startNote}-${thirdNote}`,
                positions: allPositions
            });
        }
    }
    
    return thirds;
} 

function testScale(root) {
    console.log(`\nTesting ${root} major scale:`);
    const scaleNotes = getScaleNotes(root);
    console.log("Scale notes:", scaleNotes);
    
    // Test thirds
    console.log("\nTesting thirds:");
    const thirds = generateThirds(root);
    thirds.forEach((third, index) => {
        console.log(`\nThird ${index + 1}:`);
        console.log(`Notes: ${third.notes}`);
        console.log("Possible positions:");
        third.positions.forEach(pos => {
            const note1 = FRET_NOTES[pos.string1][pos.fret1];
            const note2 = FRET_NOTES[pos.string2][pos.fret2];
            console.log(`${pos.string1}(${pos.fret1}):${note1} to ${pos.string2}(${pos.fret2}):${note2}`);
        });
    });
    
    // Test sixths
    console.log("\nTesting sixths:");
    const sixths = generateSixths(root);
    sixths.forEach((sixth, index) => {
        console.log(`\nSixth ${index + 1}:`);
        console.log(`Notes: ${sixth.notes}`);
        console.log("Possible positions:");
        sixth.positions.forEach(pos => {
            const note1 = FRET_NOTES[pos.string1][pos.fret1];
            const note2 = FRET_NOTES[pos.string2][pos.fret2];
            console.log(`${pos.string1}(${pos.fret1}):${note1} to ${pos.string2}(${pos.fret2}):${note2}`);
        });
    });
}

// Test all scales
TEST_SCALES.forEach(scale => testScale(scale)); 