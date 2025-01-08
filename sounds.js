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
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.value = frequency;
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.error('Error playing note:', error);
        }
    }

    // Convert note name to frequency
    noteToFrequency(note) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = 4; // Middle octave
        
        // Handle flats
        note = note.replace('Db', 'C#')
                  .replace('Eb', 'D#')
                  .replace('Gb', 'F#')
                  .replace('Ab', 'G#')
                  .replace('Bb', 'A#');
                  
        const noteIndex = notes.indexOf(note.split('/')[0]);
        const frequency = 440 * Math.pow(2, (noteIndex - 9) / 12 + (octave - 4));
        
        return frequency;
    }

    async playInterval(note1, note2) {
        if (this.isMuted) return;  // Don't play if muted
        const freq1 = this.noteToFrequency(note1);
        const freq2 = this.noteToFrequency(note2);
        
        this.playNote(freq1, 1);
        this.playNote(freq2, 1);
    }
} 