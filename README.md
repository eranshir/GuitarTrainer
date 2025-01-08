# Guitar Interval Trainer

A web-based tool to help guitarists practice playing intervals (thirds and sixths) in different major scales.

## Features

- Practice thirds and sixths in multiple major scales:
  - C major (no sharps/flats)
  - G major (F#)
  - D major (F#, C#)
  - A major (F#, C#, G#)
  - F major (Bb)
  - E major (F#, C#, G#, D#)

- Adjustable tempo from 15 to 120 BPM
- Shows guitar tab notation
- Displays note names for each interval
- Randomizes positions for each interval
- Uses positions within the first 5 frets

## How to Use

1. Select an interval type (thirds or sixths)
2. Choose a major scale
3. Set your desired tempo
4. Click "Play" to start the exercise
5. The trainer will show:
   - Guitar tab notation for each interval
   - Note names below the tab
   - A new position every beat at the selected tempo

## Technical Details

- Built with vanilla JavaScript
- Uses monospace fonts for precise tab alignment
- Handles both sharp and flat notations
- Validates positions against standard guitar fingerings

## File Structure

- `index.html` - Main HTML structure
- `styles.css` - CSS styling
- `intervals.js` - Core interval generation logic
- `app.js` - UI interaction handling

## Development

The project uses standard web technologies and requires no build process. Simply clone and open `index.html` in a browser. 