# CYPHER

A cipher-breaking browser game where using external decoder tools isn't cheating. It's the whole point.

[**Play it →**](https://your-url-here.vercel.app)

---

## What it is

You get 60 seconds. A cipher appears. You decode it and type the answer. Then another one appears. This continues until the clock hits zero.

No lives. No checkpoints. No pauses.

On Easy, you can crack everything just by staring at it long enough. On Hard, you'll have two browser tabs open and still feel rushed.

---

## Difficulties

**Easy** — visual puzzles only. Scrambled words, reversed phrases, leetspeak, partial flips. No tools needed, just patience.

**Normal** — real encodings. Binary, Morse, Base64, Caesar, ROT13, Atbash. One decoder pass per puzzle.

**Hard** — layered ciphers. Hex ASCII, Base32, Rail Fence, Binary then Caesar, Morse then Reverse. Two passes minimum. Good luck.

Scoring rewards speed. Solve fast and the multiplier stacks.

---

## The cipher text is unselectable on purpose

You have to type it manually into your decoder. This was a deliberate call. Recommended tools: [CyberChef](https://gchq.github.io/CyberChef/), [Cryptii](https://cryptii.com), [base64decode.org](https://www.base64decode.org).

---

## Stack

- **Next.js 14** — App Router, API routes handle cipher generation and answer validation server-side
- **TypeScript** — throughout
- **Tailwind CSS** — utility styling
- **Canvas API** — the matrix rain background, hardware-accelerated
- **Web Crypto API** — SHA-256 hashing server-side so plaintext answers never touch the client
- **Bun** — runtime and package manager
- **Vercel** — deployment

---

## A few things worth knowing

The rain color shifts with difficulty: blue tint on Easy, neutral on Normal, red on Hard. Subtle but you'll notice.

Occasionally a rare phrase appears as a white column in the rain. There are 14 of them with weighted rarity and suppression logic so repeats stay rare. Keep an eye out.

Answers are hashed server-side before anything reaches the client. You can open the network tab, but you won't find the answer there. Nice try though.

---

## Running locally

```bash
bun install
bun dev
```

---

## License

MIT
