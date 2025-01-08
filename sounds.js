class GuitarSound {
    constructor() {
        this.audioContext = null;
        this.isMuted = true;  // Start muted
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const muteButton = document.getElementById('muteButton');
        muteButton.textContent = this.isMuted ? '🔇' : '🔊';
        muteButton.classList.toggle('muted', this.isMuted);
        console.log('Mute toggled:', this.isMuted);
    }

    async initAudio() {
        try {
            // Just create audio context, no mic permissions needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                // Resume audio context as it might start in suspended state
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
            }
            console.log('Audio initialized:', this.audioContext.state);
        } catch (error) {
            console.error('Audio initialization failed:', error);
            alert('Audio playback not supported in this browser.');
        }
    }

    async playNote(frequency, duration = 1) {
        if (!this.audioContext) {
            await this.initAudio();
        }
        
        try {
            // Create nodes
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const harmonicGain = this.audioContext.createGain();
            const harmonicOsc = this.audioContext.createOscillator();
            
            // Main note settings
            oscillator.type = 'triangle';  // Base tone
            oscillator.frequency.value = frequency;
            
            // Add harmonic for more guitar-like sound
            harmonicOsc.type = 'sine';
            harmonicOsc.frequency.value = frequency * 2;  // First harmonic
            harmonicGain.gain.value = 0.2;  // Harmonic volume
            
            // Guitar-like envelope
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.005);  // Quick attack
            gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.1);  // Initial decay
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);  // Long decay
            
            // Connect nodes
            oscillator.connect(gainNode);
            harmonicOsc.connect(harmonicGain);
            harmonicGain.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Start and stop
            oscillator.start(now);
            harmonicOsc.start(now);
            oscillator.stop(now + duration);
            harmonicOsc.stop(now + duration);
        } catch (error) {
            console.error('Error playing note:', error);
        }
    }

    // Convert note name to frequency
    noteToFrequency(note, string) {
        // Guitar string frequencies (standard tuning):
        const GUITAR_NOTES = {
            'e': { note: 'E', octave: 4, freq: 329.63 },  // 1st string (high E)
            'B': { note: 'B', octave: 3, freq: 246.94 },  // 2nd string
            'G': { note: 'G', octave: 3, freq: 196.00 },  // 3rd string
            'D': { note: 'D', octave: 3, freq: 146.83 },  // 4th string
            'A': { note: 'A', octave: 2, freq: 110.00 },  // 5th string
            'E': { note: 'E', octave: 2, freq: 82.41 }    // 6th string (low E)
        };

        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // Handle flats
        note = note.split('/')[0];  // Use sharp version if it's a flat
        const noteIndex = notes.indexOf(note);
        
        // Get the reference octave based on the string
        const stringOctave = string ? GUITAR_NOTES[string].octave : 3;
        
        // Calculate frequency: f = 440 * 2^((n-9)/12 + (octave-4))
        const frequency = 440 * Math.pow(2, (noteIndex - 9) / 12 + (stringOctave - 4));
        
        console.log(`Note: ${note} on string ${string || 'unknown'}, Frequency: ${frequency.toFixed(2)} Hz`);
        return frequency;
    }

    async playInterval(note1, note2, string1, string2) {
        if (this.isMuted) return;  // Don't play if muted
        const freq1 = this.noteToFrequency(note1, string1);
        const freq2 = this.noteToFrequency(note2, string2);
        
        this.playNote(freq1, 1);
        this.playNote(freq2, 1);
    }
} 