<div align="center">

# CYPHER

A cipher-breaking browser game where using external decoder tools isn't cheating. It's the whole point.

**[cyph3r.vercel.app](https://cyph3r.vercel.app)**

</div>

> I had this idea sitting in my head for a while, and a CS uni course with an open-ended "build any website" assessment was a good enough reason to just do it.

## 🎮 What it is

You get 60 seconds. A cipher appears. You decode it and type the answer. Then another one appears. This continues until the clock hits zero. Wrong answer and it ends immediately.

No lives. No checkpoints. No pauses.

On Easy, you can crack everything just by staring at it long enough. On Normal, you'll need a decoder tab open. On Hard, you'll need two passes and fast hands and you'll still feel rushed. Subtle sound effects accent the experience without getting in the way.

## ⚡ Difficulties

**Easy:** visual puzzles only. Scrambled words, reversed phrases, leetspeak, partial flips. No tools needed, just patience.

**Normal:** real encodings. Binary, Morse, Base64, Caesar, ROT13, Atbash. One decoder pass per puzzle.

**Hard:** layered ciphers. Hex ASCII, Base32, Rail Fence, Binary then Caesar, Morse then Reverse. Two passes minimum.

Scoring rewards speed. Solve within 20 seconds for a 2x multiplier, between 20 and 40 for 1.5x, anything after that and you're on base points.

## 🔒 The cipher text is unselectable on purpose

You have to manually type it into your decoder. Recommended tools: [CyberChef](https://gchq.github.io/CyberChef/), [Cryptii](https://cryptii.com), [base64decode.org](https://www.base64decode.org).

## 🔮 The experience

The matrix rain background shifts color with difficulty: blue on Easy, neutral on Normal, red on Hard. Every page transition, score popup, timer pulse, and feedback flash is animated to feel cohesive rather than bolted on. If motion isn't your thing, there's an accessibility toggle that cuts all animations globally.

Light mode exists too (who even uses light mode though).

## ⌨️ Keybinds

| Key | Action |
|---|---|
| Space | Begin decryption |
| Enter | Submit answer |
| R | Try again |
| ESC | Change difficulty |
| A / Left | Previous difficulty |
| D / Right | Next difficulty |
| T | Toggle theme |
| M | Toggle motion |
| / | Open how to play panel |

## 🛠 Stack

- **Next.js 14:** app router with server-side cipher generation and answer validation
- **TypeScript:** makes the codebase easier to navigate and harder to accidentally break
- **Tailwind CSS:** styling stays in the component without writing a single custom CSS class
- **Canvas API:** hardware-accelerated matrix rain background
- **Web Crypto API:** answers are SHA-256 hashed server-side and the plaintext never leaves the server
- **Bun:** runtime and package manager
- **Vercel:** deployment

## 🚧 Known issues and planned work

Things that are half-baked or just need more attention:

- Light mode needs a full rework to actually look good and be readable
- The difficulty selector has a jittery slide animation that has resisted every fix attempt so far
- The BEGIN DECRYPTION button doesn't sit well with the rest of the UI and needs a rework
- The Connection Lost screen buttons blend into the stat cards and don't feel like actual buttons
- Sound design needs a balancing pass and a few more effects in the right places
- Matrix rain needs improvement and polishing
- Game design pass needed across all difficulties, more playtesting and better pacing
- General code cleanup and optimization