<div align="center">

# CYPHER

A cipher-breaking browser game where using external decoder tools isn't cheating. It's the whole point.

**[cyph3r.vercel.app](https://cyph3r.vercel.app)**

</div>

---

## What it is

You get 60 seconds. A cipher appears. You decode it and type the answer. Then another one appears. This continues until the clock hits zero.

No lives. No checkpoints. No pauses. Wrong answer and it ends immediately.

On Easy, you can crack everything just by staring at it long enough. On Hard, you'll have two browser tabs open and still feel rushed. Subtle sound effects play throughout without being jarring, they're an accent, not a distraction.

## Difficulties

**Easy** — visual puzzles only. Scrambled words, reversed phrases, leetspeak, partial flips. No tools needed, just patience.

**Normal** — real encodings. Binary, Morse, Base64, Caesar, ROT13, Atbash. One decoder pass per puzzle.

**Hard** — layered ciphers. Hex ASCII, Base32, Rail Fence, Binary then Caesar, Morse then Reverse. Two passes minimum. Good luck.

Scoring rewards speed. Solve within 20 seconds and you get a 2x multiplier. Crawl past 40 and you're getting base points.

## The cipher text is unselectable on purpose

You have to manually type it into your decoder. Recommended tools: [CyberChef](https://gchq.github.io/CyberChef/), [Cryptii](https://cryptii.com), [base64decode.org](https://www.base64decode.org).

## The experience

The matrix rain background shifts color with difficulty: blue on Easy, neutral on Normal, red on Hard. Every page transition, score popup, timer pulse, and feedback flash is animated to feel cohesive rather than bolted on. If motion isn't your thing, there's an accessibility toggle that cuts all animations globally.

Light mode exists too, though it's still a work in progress.

## Keybinds

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
| / | Open how to play |

## Stack

- **Next.js 14** — App Router, API routes for server-side cipher generation and validation
- **TypeScript** — throughout
- **Tailwind CSS** — utility styling
- **Canvas API** — the matrix rain background
- **Web Crypto API** — answers are SHA-256 hashed server-side. You can open the network tab, but you won't find the answer there. Nice try.
- **Bun** — runtime and package manager
- **Vercel** — deployment

## Known issues and planned work

Things that are broken, half-baked, or just need more attention:

- Light mode needs a full rework to actually look good and be readable
- The difficulty selector has a jittery slide animation that has resisted every fix attempt so far
- The BEGIN DECRYPTION button doesn't sit well with the rest of the UI and needs a rethink
- The mouse parallax on the rain feels cheap rather than satisfying, needs proper tuning
- The Connection Lost screen buttons blend into the stat cards and don't feel like buttons
- Sound design needs a pass, balancing levels and adding effects where the game currently feels silent
- Matrix rain still has room to be pushed further
- Game design pass needed across all difficulties, more playtesting, better pacing
- General code cleanup and optimization

## Running locally

```bash
bun install
bun dev
```
