# Guitar Interval Trainer - Progress Log

## v1.0.13 (Current)
- Fixed iOS audio playback with improved initialization
- Added silent buffer playback for iOS audio unlock
- Improved audio initialization on user interaction

## v1.0.12 (Current)
- Fixed audio playback on iOS devices
- Added better audio initialization for mobile browsers

## v1.0.11 (Current)
- Added guitar neck diagram visualization
- Added fret numbers (1-6) and string labels
- Improved layout with tab, notes, and neck diagram

## v1.0.10 (Current)
- Fixed third intervals to show proper ascending thirds (C-E, not E-C)
- Fixed sixth intervals to show proper ascending sixths (C-A, not A-C)
- Restricted thirds to adjacent strings only for better playability
- Fixed note display to match actual intervals

## v1.0.9 (Current)
- Added pause/resume functionality
- Fixed playback controls layout on mobile
- Fixed stop button after pause/resume

## v1.0.8
- Fixed sound frequencies to match actual guitar string tunings
- Each note now plays at the correct octave based on its string
- Added proper string-based frequency calculations

## v1.0.7
- Fixed note display to show actual notes being played
- Fixed depth-first practice mode
- Fixed mute button functionality
- Lowered sound octave for more guitar-like tone
- Fixed tempo slider display

## v1.0.6
- Fixed tempo slider functionality

## v1.0.5
- Added sound support using Web Audio API
- Added mute button with keyboard shortcut (M)
- Starts muted by default
- Basic guitar-like sound using triangle waveform
- Added envelope for more natural sound decay

## v1.0.4
- Added three practice modes:
  - Breadth-first: runs through all intervals once, then repeats with different positions
  - Depth-first: completes all positions for each interval before moving to next
  - Random: randomly selects intervals and positions
- Improved mobile display with larger fonts
- Added iOS Safari-specific optimizations
- Removed position count from interval display for cleaner UI

## v1.0.3
- Added more string combinations for sixths intervals
- Now includes positions using:
  - Adjacent strings
  - One string separation (both directions)
  - Two strings separation (both directions)
- Added interval counter display
- Added position counter

## v1.0.2
- Increased font sizes for better mobile readability
- Added iOS Safari-specific styles
- Fixed mobile layout issues
- Added touch feedback for buttons

## v1.0.1
- Added mobile-friendly improvements
- Increased tab and note font sizes
- Added touch-friendly slider
- Prevented unwanted zooming on mobile

## v1.0.0
- Initial release
- Basic interval trainer functionality
- Support for thirds and sixths
- Multiple major scales (C, G, D, A, E, F)
- Tempo control
- Tab notation display 