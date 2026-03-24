'use client';

import { useEffect, useRef } from 'react';

interface MatrixRainProps {
    speed?: number;
    reducedMotion?: boolean;
    difficulty?: 'easy' | 'normal' | 'hard';
    pageIndex?: number;
    transitionMs?: number;
    htpOpen?: boolean;
}

interface Column {
    y: number;
    speed: number;
    chars: number[];
    depth: number;
}

interface ActiveEgg {
    text: string;
    col: number;
    startRow: number;
    createdAt: number;
}

export default function MatrixRain({
    speed = 1,
    reducedMotion = false,
    difficulty = 'normal',
    pageIndex = 0,
    transitionMs = 850,
    htpOpen = false,
}: MatrixRainProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const difficultyRef    = useRef(difficulty);
    const speedRef         = useRef(speed);
    const reducedMotionRef = useRef(reducedMotion);
    const pageIndexRef     = useRef(pageIndex);
    const transitionMsRef  = useRef(transitionMs);
    const htpOpenRef       = useRef(htpOpen);
    const mouseRef         = useRef({ x: 0, y: 0 });

    useEffect(() => { difficultyRef.current    = difficulty;    }, [difficulty]);
    useEffect(() => { speedRef.current         = speed;         }, [speed]);
    useEffect(() => { reducedMotionRef.current = reducedMotion; }, [reducedMotion]);
    useEffect(() => { pageIndexRef.current     = pageIndex;     }, [pageIndex]);
    useEffect(() => { transitionMsRef.current  = transitionMs;  }, [transitionMs]);
    useEffect(() => { htpOpenRef.current       = htpOpen;       }, [htpOpen]);

    // Single mount-only effect. Columns are allocated once and reused across
    // live and static modes so toggling never resets visual state
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const FONT_SIZE    = 22;
        const CHARS        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
        const TRAIL_LENGTH = 12;

        const EGGS: { text: string; weight: number }[] = [
            { text: 'CYPHER',            weight: 0.18 },
            { text: 'HELLO WORLD',       weight: 0.10 },
            { text: 'LOREM',             weight: 0.10 },
            { text: 'NULL',              weight: 0.10 },
            { text: 'DEJA VU',           weight: 0.09 },
            { text: 'ARE YOU REAL',      weight: 0.06 },
            { text: 'NOT A DREAM',       weight: 0.06 },
            { text: 'DECRYPTING YOU',    weight: 0.05 },
            { text: 'YOU SAW NOTHING',   weight: 0.05 },
            { text: 'SKILL ISSUE',       weight: 0.05 },
            { text: 'SAMI',              weight: 0.03 },
            { text: 'THERE IS NO SPOON', weight: 0.03 },
            { text: 'ZION',              weight: 0.03 },
            { text: 'IYKYK',             weight: 0.03 },
        ];

        const recentlyShown: string[] = [];
        let lastEggCol = -1;

        const pickEgg = (): string => {
            const weights = EGGS.map(e => {
                const idx = recentlyShown.indexOf(e.text);
                if (idx === -1) return e.weight;
                return idx >= recentlyShown.length - 3 ? e.weight * 0.02 : e.weight * 0.10;
            });
            const total = weights.reduce((a, b) => a + b, 0);
            let roll = Math.random() * total;
            for (let i = 0; i < EGGS.length; i++) {
                roll -= weights[i];
                if (roll <= 0) return EGGS[i].text;
            }
            return EGGS[0].text;
        };

        const columns: Column[]      = [];
        let colCount                  = 0;
        let activeEggs: ActiveEgg[]  = [];
        let lastEggSpawn              = 0;
        let hueR = 1.0, hueG = 1.0, hueB = 1.0;
        let lerpedMouseX              = window.innerWidth / 2;
        let lerpedScrollOffset        = 0;
        let lerpedHorizontalOffset    = 0;

        const getTargetHue = () => {
            const d = difficultyRef.current;
            if (d === 'easy') return { r: 0.7, g: 0.85, b: 1.1 };
            if (d === 'hard') return { r: 1.15, g: 0.75, b: 0.7 };
            return { r: 1.0, g: 1.0, b: 1.0 };
        };
        const getSpeedMul = () => {
            const d = difficultyRef.current;
            return d === 'easy' ? 0.6 : d === 'hard' ? 1.1 : 0.85;
        };
        const getTotalH = () => window.innerHeight * 3;

        const makeColumn = (): Column => {
            const trail: number[] = [];
            for (let i = 0; i < TRAIL_LENGTH + 2; i++) trail.push(Math.floor(Math.random() * CHARS.length));
            // Distribute y across the full cycle: above-screen queue + full virtual space
            // Original (0..totalH) put 33% visible at load but ~29% at steady state
            // that 4% mismatch was the burst. Including the avg queue depth (4 rows for
            // the random*-8 reset) in the init range makes load density match steady state
            const cycleRows = TRAIL_LENGTH + 4 + Math.ceil(getTotalH() / FONT_SIZE);
            return {
                y:     -(TRAIL_LENGTH + 4) + Math.random() * cycleRows,
                speed: 0.05 + Math.random() * 0.035,
                chars: trail,
                depth: Math.random(),
            };
        };

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const w   = window.innerWidth;
            const h   = window.innerHeight;
            canvas.width        = w * dpr;
            canvas.height       = h * dpr;
            canvas.style.width  = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const oneScreen = Math.ceil(w / (FONT_SIZE * 0.85));
            const target    = oneScreen * 2;
            while (colCount < target) { columns.push(makeColumn()); colCount++; }
            if (colCount > target)    { columns.splice(target); colCount = target; }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const onMouseMove = (e: MouseEvent) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY; };
        window.addEventListener('mousemove', onMouseMove);

        // Core draw
        // dt=0 freezes positions; dt>0 advances them. targetCtx lets static mode
        // draw to an off-screen context without touching the main canvas mid-crossfade
        const drawFrame = (
            targetCtx: CanvasRenderingContext2D,
            dt: number,
            scrollOff: number,
            hOff: number,
        ) => {
            const w          = window.innerWidth;
            const viewH      = window.innerHeight;
            const totalH     = getTotalH();
            const spdMul     = getSpeedMul() * speedRef.current;
            const oneScreen  = Math.ceil(w / (FONT_SIZE * 0.85));
            const colSpacing = oneScreen > 0 ? w / oneScreen : FONT_SIZE;

            if (dt > 0) {
                const hueTarget = getTargetHue();
                const blend     = 0.02 * dt;
                hueR += (hueTarget.r - hueR) * blend;
                hueG += (hueTarget.g - hueG) * blend;
                hueB += (hueTarget.b - hueB) * blend;
            }

            targetCtx.fillStyle = '#0a0a0a';
            targetCtx.fillRect(0, 0, w, viewH);
            targetCtx.textBaseline = 'top';
            targetCtx.font = '500 ' + FONT_SIZE + "px 'Courier New', monospace";

            const eggByCol = new Map<number, ActiveEgg>();
            for (const egg of activeEggs) eggByCol.set(egg.col, egg);

            for (let i = 0; i < colCount; i++) {
                const col      = columns[i];
                const virtualX = i >= oneScreen ? (i - 2 * oneScreen) * colSpacing : i * colSpacing;
                const x        = virtualX + hOff;

                if (dt > 0) {
                    col.y += col.speed * spdMul * dt;
                    if (col.y * FONT_SIZE > totalH + FONT_SIZE * TRAIL_LENGTH) {
                        col.y     = Math.random() * -8;
                        col.speed = 0.05 + Math.random() * 0.035;
                        for (let c = 0; c < col.chars.length; c++) col.chars[c] = Math.floor(Math.random() * CHARS.length);
                    }
                }

                if (x + FONT_SIZE < 0 || x - FONT_SIZE > w) continue;

                const headPx     = col.y * FONT_SIZE;
                const depthAlpha = 0.55 + col.depth * 0.45;

                for (let t = 0; t < TRAIL_LENGTH; t++) {
                    const virtualPy = headPx - t * FONT_SIZE;
                    const screenPy  = virtualPy - scrollOff;
                    if (screenPy < -FONT_SIZE || screenPy >= viewH) continue;

                    const egg = eggByCol.get(i);
                    if (egg) {
                        const eggTop = egg.startRow * FONT_SIZE;
                        const eggBot = eggTop + egg.text.length * FONT_SIZE;
                        if (virtualPy >= eggTop && virtualPy < eggBot) {
                            // Limit visible egg characters to a short trail window so the
                            // message reveals letter by letter rather than all at once
                            if (t >= 4) continue;
                            const ci = Math.floor((virtualPy - eggTop) / FONT_SIZE);
                            if (ci >= 0 && ci < egg.text.length) {
                                const a = (t === 0 ? 1.0 : Math.max(0.3, 1.0 - t * 0.3)) * depthAlpha;
                                targetCtx.fillStyle = 'rgba(255,255,255,' + a + ')';
                                targetCtx.fillText(egg.text[ci], x, screenPy);
                            }
                            continue;
                        }
                    }

                    const bright = t === 0 ? 185 : Math.max(30, 150 - t * 25);
                    const alpha  = (t === 0 ? 0.95 : Math.max(0.08, 0.75 - t * 0.12)) * depthAlpha;
                    const r      = Math.min(255, Math.floor(bright * hueR));
                    const g      = Math.min(255, Math.floor(bright * hueG));
                    const b      = Math.min(255, Math.floor(bright * hueB));
                    targetCtx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';

                    const ci = dt === 0
                        ? col.chars[t % col.chars.length]
                        : t === 0 ? Math.floor(Math.random() * CHARS.length) : col.chars[t % col.chars.length];
                    targetCtx.fillText(CHARS[ci], x, screenPy);
                }
            }

            if (dt > 0) {
                const ms = Date.now();
                if (ms - lastEggSpawn > 20000 && Math.random() < 0.002 && colCount > 10 && activeEggs.length === 0) {
                    const text     = pickEgg();
                    const isHTP    = htpOpenRef.current;
                    const halfCols = Math.floor(colCount / 2);
                    const colMin   = isHTP ? halfCols : 0;
                    const margin   = Math.floor(halfCols * 0.1);
                    const minDist  = Math.floor(halfCols * 0.3);
                    let eggCol     = colMin + margin + Math.floor(Math.random() * (halfCols - margin * 2));
                    let attempts   = 0;
                    while (lastEggCol >= 0 && Math.abs(eggCol - lastEggCol) < minDist && attempts < 10) {
                        eggCol = colMin + margin + Math.floor(Math.random() * (halfCols - margin * 2));
                        attempts++;
                    }
                    const viewRows   = Math.ceil(window.innerHeight / FONT_SIZE);
                    const scrollRows = Math.floor(scrollOff / FONT_SIZE);
                    const startRow   = scrollRows + Math.floor(Math.random() * Math.max(1, viewRows - text.length));
                    activeEggs.push({ text, col: eggCol, startRow, createdAt: ms });
                    lastEggSpawn = ms;
                    lastEggCol   = eggCol;
                    recentlyShown.push(text);
                    if (recentlyShown.length > 6) recentlyShown.shift();
                }
                activeEggs = activeEggs.filter(e => Date.now() - e.createdAt < 18000);
            }
        };

        // Mode management
        let animId: number | null                              = null;
        let snapshotTimer: ReturnType<typeof setTimeout> | null = null;
        let lastFrame                                          = performance.now();

        const stopAll = () => {
            if (animId !== null)        { cancelAnimationFrame(animId); animId = null; }
            if (snapshotTimer !== null) { clearTimeout(snapshotTimer); snapshotTimer = null; }
        };

        const startLive = () => {
            stopAll();
            lastFrame = performance.now();
            const loop = (now: number) => {
                let dt = (now - lastFrame) / 16.67;
                lastFrame = now;
                if (dt > 3) dt = 3;

                const viewH  = window.innerHeight;
                const w      = window.innerWidth;
                const frames = transitionMsRef.current / 16.67;
                const lerpK  = 1 - Math.pow(0.01, 1 / frames);

                lerpedScrollOffset     += (pageIndexRef.current * viewH      - lerpedScrollOffset)     * Math.min(lerpK * dt, 0.98);
                lerpedHorizontalOffset += ((htpOpenRef.current ? w : 0)       - lerpedHorizontalOffset) * Math.min(lerpK * dt, 0.98);
                lerpedMouseX           += (mouseRef.current.x - lerpedMouseX) * Math.min(0.07 * dt, 0.25);

                drawFrame(ctx, dt, lerpedScrollOffset, lerpedHorizontalOffset);
                animId = requestAnimationFrame(loop);
            };
            animId = requestAnimationFrame(loop);
        };

        // Simulate the live rain loop step by step for 60-120 frames.
        // Step-by-step simulation (not a big y-jump) is what produces genuine
        // visual continuity: positions advance at natural speed, columns that
        // wrap get fresh chars exactly as the live loop does, so the snapshot
        // looks like the same rain caught a moment later
        const simulateForward = () => {
            const totalH  = getTotalH();
            const spdMul  = getSpeedMul() * speedRef.current;
            const steps   = Math.round(120 + Math.random() * 60); // 2-3 seconds
            for (let s = 0; s < steps; s++) {
                for (const col of columns) {
                    col.y += col.speed * spdMul; // dt = 1 (one frame)
                    if (col.y * FONT_SIZE > totalH + FONT_SIZE * TRAIL_LENGTH) {
                        col.y     = Math.random() * -8;
                        col.speed = 0.05 + Math.random() * 0.035;
                        for (let ci = 0; ci < col.chars.length; ci++) col.chars[ci] = Math.floor(Math.random() * CHARS.length);
                    }
                }
            }
        };

        const startStatic = () => {
            stopAll();

            const dpr = window.devicePixelRatio || 1;

            // Two offscreen canvases swap roles each cycle
            // offCur: the frame currently shown on screen (outgoing)
            // offNxt: the next frame being faded in (incoming)
            // Both use alpha:false (opaque) matching the main canvas
            const makeOff = () => {
                const el  = document.createElement('canvas');
                el.width  = canvas.width;
                el.height = canvas.height;
                const x   = el.getContext('2d', { alpha: false })!;
                x.setTransform(dpr, 0, 0, dpr, 0, 0);
                return { el, x };
            };

            let { el: offCur, x: ctxCur } = makeOff();
            let { el: offNxt, x: ctxNxt } = makeOff();

            // Resize offscreens if the viewport changed between snapshots
            const syncOffs = () => {
                for (const { el, x } of [{ el: offCur, x: ctxCur }, { el: offNxt, x: ctxNxt }]) {
                    if (el.width !== canvas.width || el.height !== canvas.height) {
                        el.width  = canvas.width;
                        el.height = canvas.height;
                        x.setTransform(dpr, 0, 0, dpr, 0, 0);
                    }
                }
            };

            // drawImage must use identity transform: offscreens are already in
            // physical pixels, so keeping the DPR transform would double-scale them.
            const blit = (src: HTMLCanvasElement, alpha: number) => {
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalAlpha = alpha;
                ctx.drawImage(src, 0, 0);
                ctx.restore();
            };

            // Snap offsets to the current page before drawing.
            // In static mode the live lerp isn't running, so we read the refs directly.
            const snapOffsets = () => {
                lerpedScrollOffset     = pageIndexRef.current * window.innerHeight;
                lerpedHorizontalOffset = htpOpenRef.current   ? window.innerWidth : 0;
            };

            // Draw initial frame to offCur and paint it to screen
            snapOffsets();
            drawFrame(ctxCur, 0, lerpedScrollOffset, lerpedHorizontalOffset);
            blit(offCur, 1);

            // Ease-in-out: slow start and end, fast middle
            const ease = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const FADE_FRAMES = 54; // ~900ms at 60fps

            // doCrossfade: simulate forward, draw into offNxt, run the rAF dissolve.
            // Called both on the 3-5s timer and immediately on navigation.
            const doCrossfade = () => {
                // Cancel any in-flight fade, a nav event takes priority
                if (animId !== null) { cancelAnimationFrame(animId); animId = null; }
                syncOffs();
                snapOffsets();

                simulateForward();
                drawFrame(ctxNxt, 0, lerpedScrollOffset, lerpedHorizontalOffset);

                let frame = 0;
                const fade = () => {
                    frame++;
                    const newAlpha = ease(frame / FADE_FRAMES);
                    blit(offCur, 1);
                    blit(offNxt, newAlpha);
                    if (frame < FADE_FRAMES) {
                        animId = requestAnimationFrame(fade);
                    } else {
                        const tmp = { el: offCur, x: ctxCur };
                        ({ el: offCur, x: ctxCur } = { el: offNxt, x: ctxNxt });
                        ({ el: offNxt, x: ctxNxt } = { el: tmp.el, x: tmp.x });
                        animId = null;
                        scheduleNext();
                    }
                };
                animId = requestAnimationFrame(fade);
            };

            const scheduleNext = () => {
                snapshotTimer = setTimeout(doCrossfade, 3000 + Math.random() * 2000);
            };

            // Expose doCrossfade so the mode watcher can trigger it on navigation
            navCrossfadeRef = doCrossfade;

            scheduleNext();
        };

        // navCrossfadeRef is written by startStatic so the watcher below can
        // trigger an immediate crossfade when the page changes during static mode.
        let navCrossfadeRef: (() => void) | null = null;

        // Poll refs for mode and navigation changes.
        // Navigation checks run every 100ms — imperceptible lag vs a setInterval.
        let prevRM   = reducedMotionRef.current;
        let prevPage = pageIndexRef.current;
        let prevHtp  = htpOpenRef.current;
        const modeWatchId = setInterval(() => {
            const curRM   = reducedMotionRef.current;
            const curPage = pageIndexRef.current;
            const curHtp  = htpOpenRef.current;

            // Mode toggle
            if (curRM !== prevRM) {
                prevRM   = curRM;
                prevPage = curPage;
                prevHtp  = curHtp;
                ctx.globalAlpha = 1;
                navCrossfadeRef = null;
                if (curRM) startStatic();
                else       startLive();
                return;
            }

            // Navigation while in static mode: cancel pending timer and crossfade now
            if (curRM && (curPage !== prevPage || curHtp !== prevHtp)) {
                prevPage = curPage;
                prevHtp  = curHtp;
                if (navCrossfadeRef) {
                    if (snapshotTimer !== null) { clearTimeout(snapshotTimer); snapshotTimer = null; }
                    navCrossfadeRef();
                }
            }
        }, 100);

        if (reducedMotionRef.current) startStatic();
        else                          startLive();

        return () => {
            stopAll();
            clearInterval(modeWatchId);
            ctx.globalAlpha = 1;
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', onMouseMove);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // mount-only, all props consumed via refs

    // CSS 3D tilt - rotates the canvas plane in 3D space based on mouse position.
    // Lerps back to zero when reduced motion is on rather than snapping, so the
    // toggle itself doesn't jolt. Runs its own rAF loop, never touches draw logic.
    // scale(1.08) keeps edges filled when the plane rotates.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Set to screen center before first frame so targetX/Y = 0 on load.
        // Without this, mouseRef starts at {0,0} (top-left), causing an immediate
        // unwanted tilt that only corrects when the user moves the mouse.
        mouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let rotX = 0, rotY = 0;
        let rafId: number;
        const MAX_DEG = 8;
        const loop = () => {
            const reduced  = reducedMotionRef.current;
            const targetY  = reduced ? 0 : ((mouseRef.current.x / window.innerWidth)  - 0.5) * 2 * MAX_DEG;
            const targetX  = reduced ? 0 : -((mouseRef.current.y / window.innerHeight) - 0.5) * 2 * MAX_DEG;
            // Slower lerp when returning to zero so toggling motion off unwinds gradually.
            const lerpK = (rotX === 0 && rotY === 0) ? 0.06 : reduced ? 0.025 : 0.06;
            rotX += (targetX - rotX) * lerpK;
            rotY += (targetY - rotY) * lerpK;
            canvas.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.08)`;
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="matrix-canvas fixed inset-0 z-0"
            style={{ opacity: 0.65 }}
        />
    );
}
