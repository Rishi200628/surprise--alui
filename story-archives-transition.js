(() => {
    "use strict";

    const ARCHIVES_URL = new URL("archives/archives.html?arrival=vortex", document.baseURI).href;
    const PRELUDE = 480;
    const DURATION = 2380;
    let overlay = null;
    let frame = 0;
    
    let navigated = false;

    const navigateToArchives = () => {
        if (navigated) return;
        navigated = true;
        if (frame) cancelAnimationFrame(frame);
        window.location.assign(ARCHIVES_URL);
    };

    const makeComets = (count) => {
        let seed = 49381;
        const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
        return Array.from({ length: count }, (_, index) => ({
            angle: random() * Math.PI * 2,
            turns: 1.45 + random() * 1.25,
            radius: .84 + random() * .34,
            delay: index < count * .68 ? random() * .12 : .1 + random() * .22,
            travel: .7 + random() * .27,
            size: .65 + random() * (index % 9 === 0 ? 1.9 : 1.05),
            hue: random(),
            phase: random() * Math.PI * 2
        }));
    };

    function startVortex() {
        if (overlay || navigated) return;
        document.getElementById("storySection")?.classList.add("is-leaving-for-archives");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        overlay = document.createElement("div");
        overlay.className = "archives-vortex-transition";
        overlay.dataset.phase = "spiral";
        overlay.setAttribute("role", "group");
        overlay.setAttribute("aria-label", "Entering Alui Archives");
        const canvas = document.createElement("canvas");
        canvas.className = "archives-vortex-canvas";
        canvas.setAttribute("aria-hidden", "true");
        const veil = document.createElement("div"); veil.className = "archives-vortex-veil";
        const bloom = document.createElement("div"); bloom.className = "archives-vortex-bloom";
        const skip = document.createElement("button");
        skip.className = "archives-vortex-skip"; skip.type = "button"; skip.textContent = "SKIP →";
        skip.setAttribute("aria-label", "Skip transition and open Alui Archives");
        skip.setAttribute("aria-hidden", "false");
        skip.addEventListener("click", navigateToArchives, { once: true });
        overlay.append(canvas, veil, bloom, skip);
        document.body.append(overlay);
        const ctx = canvas.getContext("2d", { alpha: true });
        const comets = makeComets(reducedMotion ? 0 : 210);
        const start = performance.now();
        let width = 0, height = 0, dpr = 1;
        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth; height = window.innerHeight;
            canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
            ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize, { passive: true });

        const point = (comet, q) => {
            const cx = width * .5, cy = height * .49;
            const angle = comet.angle + comet.turns * Math.PI * 2 * q + Math.sin(q * 8 + comet.phase) * .12 * (1 - q);
            const edgeX = width * (.66 + .1 * Math.sin(comet.phase));
            const edgeY = height * (.42 + .07 * Math.cos(comet.phase));
            const maxRadius = 1 / Math.sqrt((Math.cos(comet.angle) ** 2) / (edgeX ** 2) + (Math.sin(comet.angle) ** 2) / (edgeY ** 2));
            const radius = maxRadius * comet.radius * Math.pow(1 - q, .82);
            const taper = .72 + .28 * (1 - q);
            return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * taper];
        };

        const draw = (now) => {
            if (navigated || !ctx) return;
            const elapsed = now - start;
            const progress = Math.max(0, Math.min(1, (elapsed - PRELUDE) / DURATION));
            overlay.dataset.phase = progress < .22 ? "spiral" : progress < .59 ? "forming" : progress < .84 ? "converging" : "bloom";
            ctx.clearRect(0, 0, width, height);
            ctx.save(); ctx.globalCompositeOperation = "lighter";
            for (const comet of comets) {
                const q = Math.max(0, Math.min(1, (progress - comet.delay) / comet.travel));
                if (progress < comet.delay) continue;
                const tailStart = Math.max(0, q - (.045 + comet.size * .012));
                const [x0, y0] = point(comet, tailStart);
                const [x1, y1] = point(comet, q);
                const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
                const tint = comet.hue > .78 ? "255,194,241" : "205,184,255";
                gradient.addColorStop(0, `rgba(${tint},0)`);
                gradient.addColorStop(.72, `rgba(${tint},${.24 + progress * .26})`);
                gradient.addColorStop(1, `rgba(255,248,255,${.72 + progress * .25})`);
                ctx.beginPath(); ctx.moveTo(x0, y0);
                for (let step = 1; step <= 5; step++) {
                    const sample = tailStart + (q - tailStart) * step / 5;
                    const [x, y] = point(comet, sample); ctx.lineTo(x, y);
                }
                ctx.strokeStyle = gradient; ctx.lineWidth = comet.size * (.48 + progress * .38); ctx.lineCap = "round";
                ctx.shadowColor = comet.hue > .78 ? "#ffb6eb" : "#c7a9ff"; ctx.shadowBlur = 4 + comet.size * 3;
                ctx.stroke();
                const [x, y] = point(comet, q);
                ctx.beginPath(); ctx.arc(x, y, comet.size * (.52 + progress * .18), 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255,247,255,.98)"; ctx.shadowBlur = 7 + comet.size * 4; ctx.fill();
            }
            ctx.restore();
            if (progress < 1) frame = requestAnimationFrame(draw);
            else navigateToArchives();
        };

        overlay.classList.add("is-visible");
        if (!reducedMotion && ctx) frame = requestAnimationFrame(draw);
        else overlay.dataset.phase = "bloom";
        window.setTimeout(navigateToArchives, reducedMotion ? 700 : PRELUDE + DURATION + 120);
        document.addEventListener("keydown", (event) => { if (event.key === "Escape" && overlay && !navigated) navigateToArchives(); });
        document.addEventListener("visibilitychange", () => { if (document.hidden && overlay && !navigated) navigateToArchives(); });
    }

    document.addEventListener("story:open-archives", startVortex);
})();




