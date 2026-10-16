const enterBtn = document.getElementById("enterBtn");
const yearsSection = document.getElementById("yearsSection");
const storyBtn = document.getElementById("storyBtn");
const storySection = document.getElementById("storySection");
const oldLabel = storySection?.querySelector(".story-label");
const chapters = storySection ? [...storySection.querySelectorAll(".story-chapter")] : [];
let activeChapter = 0;
let pointerX = null, pointerY = null;
let returnTimers = [], settleTimer;
let swipeHintTimer;

const nightChangesMusic = document.getElementById("nightChangesMusic");

enterBtn?.addEventListener("click", async () => {
    yearsSection?.classList.add("show");
    console.log("Music element:", nightChangesMusic);
    if (nightChangesMusic && nightChangesMusic.paused) {
        try {
            await nightChangesMusic.play();
        } catch (error) {
            console.log("Night Changes playback failed:", error);
        }
    }
});
const storyContent = storySection?.querySelector(".story-content");
if (storySection && storyContent && chapters.length) {
    const stage = document.createElement("div");
    stage.className = "story-stage";
    stage.setAttribute("aria-label", "Our story chapters. Swipe or use the arrow controls to move between scenes.");
    const topbar = document.createElement("div");
    topbar.className = "story-topbar";
    const label = document.createElement("p");
    label.className = "story-label";
    label.textContent = oldLabel?.textContent.trim() || "OUR STORY";
    const counter = document.createElement("p");
    counter.className = "story-counter";
    counter.setAttribute("aria-live", "polite");
    const progress = document.createElement("div");
    progress.className = "story-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", "Story progress");
    progress.setAttribute("aria-valuemin", "1");
    progress.setAttribute("aria-valuemax", String(chapters.length));
    const progressFill = document.createElement("span");
    progressFill.className = "story-progress-fill";
    progress.append(progressFill);
    topbar.append(label, counter, progress);

    const nav = document.createElement("nav");
    nav.className = "story-navigation";
    nav.setAttribute("aria-label", "Story chapter navigation");
    const previous = document.createElement("button");
    previous.className = "story-arrow story-previous";
    previous.type = "button"; previous.setAttribute("aria-label", "Previous chapter"); previous.textContent = "←";
    const dots = document.createElement("div"); dots.className = "story-dots";
    const next = document.createElement("button");
    next.className = "story-arrow story-next";
    next.type = "button"; next.setAttribute("aria-label", "Next chapter"); next.textContent = "→";
    nav.append(previous, dots, next);

    const swipeHint = document.createElement("div");
    swipeHint.className = "story-swipe-hint";
    swipeHint.setAttribute("aria-hidden", "true");
    swipeHint.innerHTML = '<span class="swipe-hint-arrows">↔</span><span>SWIPE TO EXPLORE</span>';

    const transitionLayer = document.createElement("div");
    transitionLayer.className = "chapter-transition-overlay";
    transitionLayer.setAttribute("aria-hidden", "true");
    const transitionShade = document.createElement("div"); transitionShade.className = "chapter-transition-shade";
    const transitionClouds = document.createElement("img");
    transitionClouds.className = "chapter-transition-clouds";
    transitionClouds.src = "story-entry-clouds.png";
    transitionClouds.alt = "";
    transitionClouds.decoding = "async";
    const transitionRipple = document.createElement("div"); transitionRipple.className = "chapter-transition-ripple";
    const transitionLink = document.createElement("div"); transitionLink.className = "chapter-transition-link";
    const memoryLights = [0, 1].map(() => {
        const light = document.createElement("i");
        light.className = "chapter-memory-spark";
        return light;
    });
    const memoryField = document.createElement("div"); memoryField.className = "chapter-memory-field";
    let particleSeed = 7927;
    const particleRandom = () => { particleSeed = particleSeed * 16807 % 2147483647; return (particleSeed - 1) / 2147483646; };
    for (let i = 0; i < 38; i++) {
        const particle = document.createElement("i");
        particle.className = "chapter-memory-particle";
        particle.style.setProperty("--orbit-radius", `${40 + particleRandom() * 100}px`);
        particle.style.setProperty("--orbit-angle", `${(particleRandom() * 360).toFixed(1)}deg`);
        particle.style.setProperty("--orbit-duration", `${4.5 + particleRandom() * 4.5}s`);
        particle.style.setProperty("--orbit-delay", `${-particleRandom() * 6}s`);
        particle.style.setProperty("--appear-delay", `${(particleRandom() * 780).toFixed(0)}ms`);
        memoryField.append(particle);
    }
    const shootingStars = [0, 1].map((_, i) => {
        const streak = document.createElement("i");
        streak.className = `chapter-shooting-star chapter-shooting-star-${i + 1}`;
        return streak;
    });
    transitionLayer.append(transitionShade, transitionClouds, transitionRipple, transitionLink, ...memoryLights, memoryField, ...shootingStars);

    const envs = [];
    chapters.forEach((chapter, index) => {
        chapter.dataset.chapter = String(index + 1);
        chapter.classList.add("story-scene");
        chapter.setAttribute("role", "group");
        chapter.setAttribute("aria-roledescription", "slide");
        chapter.setAttribute("aria-label", `Chapter ${index + 1} of ${chapters.length}`);
        const environment = document.createElement("div");
        environment.className = `scene-environment scene-environment-${index + 1}`;
        environment.dataset.phase = index === 3 ? "dark" : "ready";
        environment.setAttribute("aria-hidden", "true");
        const base = document.createElement("div"); base.className = "scene-sky-base";
        const nebula = document.createElement("div"); nebula.className = "scene-nebula";
        const clouds = document.createElement("div"); clouds.className = "scene-clouds";
        const stars = document.createElement("div"); stars.className = "scene-stars";
                const particles = document.createElement("div"); particles.className = "scene-particles";
        const artPaths = ["story-scene-01.png", "story-scene-02.png", null, "story-return-nebula.png", "story-scene-05.png"];
        const art = artPaths[index] ? document.createElement("img") : null;
        if (art) {
            art.className = index === 3 ? "scene-nebula-art" : "scene-background-art";
            art.alt = ""; art.decoding = "async"; art.loading = "eager";
            art.dataset.src = artPaths[index];
            art.addEventListener("load", () => art.classList.add("is-loaded"), { once: true });
        }
        if (![0, 2].includes(index)) {
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("class", "cloud-texture"); svg.setAttribute("viewBox", "0 0 1000 1500"); svg.setAttribute("preserveAspectRatio", "none");
            const defs = document.createElementNS(svgNS, "defs");
            const filter = document.createElementNS(svgNS, "filter"); filter.id = `cloud-noise-${index}`;
            filter.setAttribute("x", "-10%"); filter.setAttribute("y", "-10%"); filter.setAttribute("width", "120%"); filter.setAttribute("height", "120%");
            const noise = document.createElementNS(svgNS, "feTurbulence"); noise.setAttribute("type", "fractalNoise"); noise.setAttribute("baseFrequency", index === 4 ? ".009 .016" : ".012 .021"); noise.setAttribute("numOctaves", "4"); noise.setAttribute("seed", String(11 + index * 17)); noise.setAttribute("stitchTiles", "stitch");
            const tint = document.createElementNS(svgNS, "feColorMatrix"); tint.setAttribute("values", "0 0 0 0 .42 0 0 0 0 .25 0 0 0 0 .72 2.7 0 0 0 -1.43");
            filter.append(noise, tint); defs.append(filter);
            const rect = document.createElementNS(svgNS, "rect"); rect.setAttribute("width", "100%"); rect.setAttribute("height", "100%"); rect.setAttribute("filter", `url(#${filter.id})`);
            svg.append(defs, rect); clouds.append(svg);
        }
        let seed = 4729 + index * 903;
        const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
        const starCount = [22, 104, 7, 108, 164][index];
        for (let n = 0; n < starCount; n++) {
            const star = document.createElement("i");
            const roll = random();
            star.className = `scene-star ${roll > (index === 4 ? .90 : .96) ? "star-large" : roll > .34 ? "star-small" : "star-tiny"}`;
            star.style.setProperty("--x", `${(2 + random() * 96).toFixed(2)}%`); star.style.setProperty("--y", `${(2 + random() * 96).toFixed(2)}%`);
            star.style.setProperty("--twinkle", `${5 + random() * 11}s`); star.style.setProperty("--twinkle-delay", `${-random() * 12}s`); stars.append(star);
        }
        const particleCount = [0, 9, 0, 5, 16][index];
        for (let n = 0; n < particleCount; n++) {
            const p = document.createElement("i"); p.className = "scene-particle";
            p.style.setProperty("--x", `${5 + random() * 90}%`); p.style.setProperty("--y", `${9 + random() * 82}%`);
            p.style.setProperty("--float-duration", `${18 + random() * 24}s`); p.style.setProperty("--float-delay", `${-random() * 20}s`); particles.append(p);
        }
        if (index === 3 && art) nebula.append(art);
        if (index === 0 || index === 1 || index === 4) environment.append(base, art, nebula, clouds, stars, particles);
        else environment.append(base, nebula, clouds, stars, particles);
        chapter.prepend(environment); envs.push(environment); stage.append(chapter);
        const dot = document.createElement("button"); dot.type = "button"; dot.className = "story-dot";
        const chapterTitle = chapter.querySelector("h2")?.textContent.trim() || `Chapter ${index + 1}`;
        dot.dataset.label = chapterTitle;
        dot.title = chapterTitle;
        dot.setAttribute("aria-label", `Go to chapter ${index + 1}: ${chapterTitle}`);
        dot.addEventListener("click", () => showChapter(index)); dots.append(dot);
    });
    stage.append(swipeHint);
    storyContent.replaceChildren(topbar, stage, nav, transitionLayer);
    oldLabel?.remove();
    const returnLine = chapters[3]?.querySelector(".story-highlight"); returnLine?.classList.add("story-returning-line");

    const hideSwipeHint = () => {
        document.body.classList.remove("show-story-swipe-hint");
        clearTimeout(swipeHintTimer);
    };
    stage.addEventListener("pointerdown", hideSwipeHint, { once: true });
    nav.addEventListener("pointerdown", hideSwipeHint, { once: true });

    let transitionLocked = false;
    function clearTimers() { returnTimers.forEach(clearTimeout); returnTimers = []; clearTimeout(settleTimer); }
    function updateChapterNavigation() {
        previous.disabled = transitionLocked || activeChapter === 0;
        next.disabled = transitionLocked;
        const archiveAction = activeChapter === chapters.length - 1;
        next.textContent = archiveAction ? "ARCHIVES →" : "→";
        next.setAttribute("aria-label", archiveAction ? "Open Alui Archives" : "Next chapter");
        next.classList.toggle("is-archives-action", archiveAction);
        [...dots.children].forEach(dot => { dot.disabled = transitionLocked; });
    }
    function renderChapter(index, options = {}) {
        const previousChapter = Number(stage.dataset.previousIndex || 0);
        activeChapter = Math.max(0, Math.min(chapters.length - 1, index)); clearTimers();
        stage.dataset.direction = activeChapter >= previousChapter ? "next" : "previous";
        stage.dataset.previousIndex = String(activeChapter);
        chapters.forEach((chapter, i) => {
            const active = i === activeChapter;
            chapter.classList.toggle("is-active", active);
            chapter.classList.toggle("is-exiting", i === previousChapter && !active);
            chapter.setAttribute("aria-hidden", String(!active));
            chapter.inert = !active;
        });
        envs.forEach((env, i) => { env.classList.remove("is-settling"); env.dataset.phase = i === activeChapter ? (i === 3 ? (options.reunionReveal ? "clouds-return" : "dark") : "ready") : "idle"; });
        const activeArt = envs[activeChapter]?.querySelector("img[data-src]");
        if (activeArt && !activeArt.hasAttribute("src")) activeArt.src = activeArt.dataset.src;
        [...dots.children].forEach((dot, i) => { dot.classList.toggle("is-active", i === activeChapter); i === activeChapter ? dot.setAttribute("aria-current", "step") : dot.removeAttribute("aria-current"); });
        counter.textContent = `${String(activeChapter + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
        progress.setAttribute("aria-valuenow", String(activeChapter + 1));
        progressFill.style.transform = `scaleX(${(activeChapter + 1) / chapters.length})`;
        updateChapterNavigation();
        returnLine?.classList.remove("is-revealed");
        if (activeChapter === 3 && options.reunionReveal) {
            returnTimers.push(setTimeout(() => returnLine?.classList.add("is-revealed"), 1250));
        } else if (activeChapter === 3) {
            const env = envs[3];
            [[900, "first-light"], [1900, "stars-return"], [3200, "haze-return"], [4700, "nebula-return"], [6200, "clouds-return"]].forEach(([delay, phase]) => returnTimers.push(setTimeout(() => { env.dataset.phase = phase; }, delay)));
            returnTimers.push(setTimeout(() => returnLine?.classList.add("is-revealed"), 6900));
        }
        if (activeChapter === 4) settleTimer = setTimeout(() => envs[4].classList.add("is-settling"), 9000);
    }
    function showChapter(index) {
        if (transitionLocked) return;
        if (activeChapter === chapters.length - 1 && index > activeChapter) {
            transitionLocked = true;
            updateChapterNavigation();
            document.dispatchEvent(new Event("story:open-archives"));
            const fallback = new URL("archives/archives.html?arrival=vortex", document.baseURI);
            setTimeout(() => window.location.assign(fallback.href), 3200);
            return;
        }
        const target = Math.max(0, Math.min(chapters.length - 1, index));
        if (target === activeChapter) return;
        transitionLocked = true;
        pointerX = pointerY = null;
        updateChapterNavigation();

        const from = activeChapter;
        const edge = Math.min(from, target);
        const kinds = ["spark-pair", "quiet-distance", "reunion", "memory-orbit"];
        const kind = kinds[Math.max(0, Math.min(kinds.length - 1, edge))];
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const speed = reducedMotion ? .3 : 1;
        const at = (ms, callback) => setTimeout(callback, ms * speed);
        const setLights = (first, second) => {
            memoryLights[0].style.setProperty("--spark-x", `${first}%`);
            memoryLights[1].style.setProperty("--spark-x", `${second}%`);
        };
        const commit = () => {
            renderChapter(target, { reunionReveal: kind === "reunion" && target === 3 });
            transitionLayer.dataset.phase = "release";
            at(580, () => {
                transitionLayer.classList.remove("is-active");
                transitionLayer.removeAttribute("data-kind");
                transitionLayer.removeAttribute("data-phase");
                transitionLocked = false;
                updateChapterNavigation();
            });
        };

        setLights(kind === "reunion" ? 31 : kind === "quiet-distance" ? 48 : kind === "memory-orbit" ? 48.5 : 44,
            kind === "reunion" ? 69 : kind === "quiet-distance" ? 52 : kind === "memory-orbit" ? 51.5 : 56);
        transitionLayer.dataset.kind = kind;
        transitionLayer.dataset.direction = target > from ? "forward" : "backward";
        transitionLayer.dataset.phase = "prepare";
        transitionLayer.classList.add("is-active");
        requestAnimationFrame(() => { transitionLayer.dataset.phase = "start"; });

        if (kind === "spark-pair") {
            at(200, () => { transitionLayer.dataset.phase = "second"; setLights(37, 63); });
            at(470, () => { transitionLayer.dataset.phase = "connect"; setLights(40, 60); });
            at(790, () => { transitionLayer.dataset.phase = "gather"; setLights(48, 52); });
            at(1080, () => { transitionLayer.dataset.phase = "bloom"; });
            at(1260, commit);
        } else if (kind === "quiet-distance") {
            at(220, () => { transitionLayer.dataset.phase = "separate"; setLights(26, 74); });
            at(760, () => { transitionLayer.dataset.phase = "fade-trail"; });
            at(1080, () => { transitionLayer.dataset.phase = "quiet"; });
            at(1280, commit);
        } else if (kind === "reunion") {
            at(240, () => { transitionLayer.dataset.phase = "clouds"; });
            at(620, () => { transitionLayer.dataset.phase = "approach"; setLights(44, 56); });
            at(1040, () => { transitionLayer.dataset.phase = "impact"; setLights(50, 50); });
            at(1320, () => { transitionLayer.dataset.phase = "reignite"; });
            at(1530, commit);
        } else {
            at(180, () => { transitionLayer.dataset.phase = "particles"; });
            at(520, () => { transitionLayer.dataset.phase = "streak-one"; });
            at(790, () => { transitionLayer.dataset.phase = "streak-two"; });
            at(1110, () => { transitionLayer.dataset.phase = "bloom"; });
            at(1300, commit);
        }
    }
    previous.addEventListener("click", () => showChapter(activeChapter - 1)); next.addEventListener("click", () => showChapter(activeChapter + 1));
    stage.addEventListener("pointerdown", e => { if (transitionLocked || e.target.closest("button, a")) return; pointerX = e.clientX; pointerY = e.clientY; if (e.pointerType === "mouse") stage.setPointerCapture(e.pointerId); });
    stage.addEventListener("pointerup", e => { if (transitionLocked || pointerX === null) return; const dx = e.clientX - pointerX, dy = e.clientY - pointerY; pointerX = pointerY = null; if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.2) return; showChapter(activeChapter + (dx < 0 ? 1 : -1)); });
    stage.addEventListener("pointercancel", () => { pointerX = pointerY = null; });
    document.addEventListener("keydown", e => { if (!document.body.classList.contains("story-mode") || transitionLocked) return; if (e.key === "ArrowRight") showChapter(activeChapter + 1); if (e.key === "ArrowLeft") showChapter(activeChapter - 1); });
    renderChapter(0);
}

storyBtn?.addEventListener("click", () => {
    if (!storySection || storyBtn.disabled) return;
    storyBtn.disabled = true;
    yearsSection?.classList.add("is-transitioning");

    const transition = document.createElement("div");
    transition.className = "story-entry-transition is-starting";
    transition.setAttribute("aria-hidden", "true");
    const stars = document.createElement("div"); stars.className = "entry-stars";
    const clouds = document.createElement("div"); clouds.className = "entry-clouds";
    ["entry-cloud-photo entry-cloud-photo-back", "entry-cloud-photo entry-cloud-photo-front"].forEach(className => {
        const cloudPhoto = document.createElement("img");
        cloudPhoto.className = className;
        cloudPhoto.src = "story-entry-clouds.png";
        cloudPhoto.alt = "";
        cloudPhoto.decoding = "async";
        clouds.append(cloudPhoto);
    });
    const quiet = document.createElement("div"); quiet.className = "entry-quiet";
    const spark = document.createElement("i"); spark.className = "entry-spark";

    let seed = Math.floor(Math.random() * 2147483646) + 1;
    const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
    transition.style.setProperty("--spark-x", `${42 + random() * 16}%`);
    transition.style.setProperty("--spark-y", `${38 + random() * 24}%`);
    for (let i = 0; i < 42; i++) {
        const star = document.createElement("i");
        star.className = `entry-star ${i % 9 === 0 ? "entry-star-bright" : ""}`;
        star.style.setProperty("--x", `${(3 + random() * 94).toFixed(2)}%`);
        star.style.setProperty("--y", `${(4 + random() * 92).toFixed(2)}%`);
        star.style.setProperty("--twinkle", `${1.2 + random() * 1.9}s`);
        star.style.setProperty("--delay", `${(random() * 1.1).toFixed(2)}s`);
        stars.append(star);
    }
    transition.append(stars, clouds, quiet, spark);
    document.body.append(transition);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeline = reducedMotion
        ? [[30, "stars-out"], [80, "clouds"], [180, "quiet"], [240, "spark"], [380, "return"], [410, "reveal"], [1250, "finish"]]
        : [[850, "stars-out"], [1100, "clouds"], [2550, "quiet"], [3250, "spark"], [3850, "return"], [4100, "reveal"], [6500, "finish"]];

    timeline.forEach(([delay, phase]) => setTimeout(() => {
        if (phase === "reveal") {
            storySection.hidden = false;
            document.body.classList.add("story-mode", "story-entry-revealing");
            let hasSeenSwipeHint = false;
            try { hasSeenSwipeHint = sessionStorage.getItem("alui-story-swipe-hint-seen") === "1"; } catch (_) { /* Storage may be unavailable in private contexts. */ }
            if (!hasSeenSwipeHint) {
                document.body.classList.add("show-story-swipe-hint");
                try { sessionStorage.setItem("alui-story-swipe-hint-seen", "1"); } catch (_) { /* The hint still dismisses automatically. */ }
                swipeHintTimer = window.setTimeout(hideSwipeHint, 4600);
            }
            yearsSection?.classList.remove("show");
            transition.dataset.phase = "reveal";
            requestAnimationFrame(() => transition.classList.add("is-revealing"));
            setTimeout(() => document.querySelector(".story-next")?.focus({ preventScroll: true }), reducedMotion ? 120 : 1500);
        } else {
            transition.dataset.phase = phase;
        }
        if (phase === "finish") {
            transition.remove();
            document.body.classList.remove("story-entry-revealing");
            yearsSection?.classList.remove("is-transitioning");
        }
    }, delay));
});








