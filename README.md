# Endless Tool

**Endless Tool** is a tool-app specifically designed for the game **Endless Frontier 2** to help players **optimize their playtime**.

You can try it here : [https://ulgrude.github.io/endless-tool/](https://ulgrude.github.io/endless-tool/)

---

## Key Features

- **Simultaneous Multi-Timers**: Independent tracking for several countdowns (Recruitment, Dungeons, Ads, Challenge Tower, etc.).
- **Multipliers & Modifiers**: Adjust timer lengths on the fly (e.g., stacking entries from x1 to x5) and apply percentage-based time reductions (-%).
- **Visual & Audio Alerts**: Cards flash in red and a subtle synth audio chime triggers when a countdown reaches zero.
- **Persistent Local Storage**: Timer states (enabled/disabled), custom multipliers and language settings are automatically saved in your browser's localStorage. Your configurations are never lost when refreshing the page.
- **Bilingual Support** (EN / FR): Switch language instantly directly from the header buttons (EN / FR).
- **Smart Sorting**: Disabled timers are dynamically moved to the bottom of the grid to keep your workspace clean and clutter-free.

---

## How to Use It

### 1. Timer Card Anatomy
Each card represents an active or inactive tracker and provides the following tools:
- **Checkbox Button** (✅ / ❌): Enables or disables the timer. Disabling a timer pauses it, greys it out, and automatically pushes it to the bottom of the list.
- **Time Display**: Formatted as MM:SS (or HH:MM:SS if the remaining duration exceeds one hour).
- **Controls**: 
  - Start: Resumes or begins the countdown.
  - Pause: Freezes the timer at its current value.
  - Reset: Rewinds the counter back to its calculated maximum duration.

### 2. Advanced Configuration (Bottom of the Card)
- **"Base" Input**: Allows you to manually type or adjust the initial duration (in minutes or seconds depending on the timer's unit).
- **"-%" Modifier Input** : Applies a passive percentage reduction to the base duration (only on rage).
- **"x1, x2, x3..." Multiplier** (available on specific timers): Multiplies the base time to simulate accumulated tickets.

---

## Advanced Language Options

The application natively supports English and French. By default, it will load using your last selected language stored in the browser's memory.

### Forcing French via URL Parameters
If you want to bookmark or share a direct link that will always bypass the cache and load the French interface instantly, append the **?lang=fr** query parameter to the end of the URL:

[https://ulgrude.github.io/endless-tool/?lang=fr](https://ulgrude.github.io/endless-tool/?lang=fr)
