(() => {
    "use strict";

    const archiveCases = [
        {
            number: "001",
            photo: "assets/memory-04.jpg",
            title: "THE BEGINNING",
            subtitle: "Lockdown. A random group chat. One very unexpected person.",
            content: "Lockdown ke woh din…\nsab kuch thoda ajeeb tha.\nAur unhi random dino mein,\nek random GC mein mujhe ek ladki mili.\nThodi si bauni, mastikhor, chulbuli…\naur attitude? Full gangster. 😂\nPehle bas random baatein hoti thi.\nAur haan… thoda flirt krlo..,\nTo madam ji ko kaafi gussa aajata tha. 😂\nPhir pata nahi kab woh gussa bhi masti ka part ban gaya.\nPhir woh baatein roz ki ho gayi.\nPata hi nahi chala kab random conversations\nfriendship mein badal gayi…\naur kab us friendship mein itni saari masti,\nbakchodi aur memories jud gayi. ❤️\nTab nahi pata tha…\nki woh random GC, hamari story ka first page banne wala tha.\nARCHIVED ✓"
        },
        {
            number: "002",
            photo: "assets/memory-03.jpg",
            title: "THE BAUNI EFFECT",
            subtitle: "Height: classified. Attitude: unnecessarily oversized.",
            content: "Baatein badi-badi karwa lo isse—\n‘Ye kar dungi, woh kar dungi…’ 😂\nPar ek hawa ka jhonka kya aaya,\nudte-udte dharti ke bahar chali jayegi. 😭\nTu mujhe chanta maarne aaye na,\ntoh pehle stool lekar aana —\nwarna meri shakal tak pahunchne ke liye \nteku 7 janam lagenge 😂\nAur agar mujhe maarne bhaagegi,\ntoh main dheere bhaagunga…\nphir bhi tu mujhe pakad nahi payegi. 😭\nMere kandhe tak bhi nahi aati,\npar attitude aisa jaise Chhota Don ho.\nHeight chhoti, attitude full size.\nAur sach kahu…\nisi bauni si gangster ke saath toh sabse zyada masti hui. ❤️\nARCHIVED ✓",
            metadata: [
                ["HEIGHT", "Pocket-sized"],
                ["ATTITUDE", "Full-sized"],
                ["THREAT LEVEL", "Mostly imaginary"]
            ]
        },
        {
            number: "003",
            photo: "assets/memory-02.jpg",
            title: "THE CONTRADICTION",
            subtitle: "Brains: occasionally unavailable.",
            content: "Main kehta toh hoon ki\ntujhme dimaag ki kami hai. 😂\nKabhi idhar girti hai, kabhi udhar kuch kar deti hai,\naur phir aise behave karti hai jaise kuch hua hi nahi. 😭\nPar sach bataun?\nTu jitni ‘dimagless’ hai,\nutni hi samajhdar bhi hai.\nTu meri baatein samajhti hai,\nmeri bakbak sunti hai,\naur isiliye tera saath itna accha lagta hai.\nMain tujhe badalna bhi nahi chahta…\ntu jaisi hai, mujhe waise hi bohot pyari lagti hai. ❤️\nARCHIVED ✓",
            metadata: [
                ["KAM AKAL", "Allegedly"],
                ["SAMJHDARI", "Underrated"],
                ["ALUI", "Exactly as she is ✓"]
            ]
        },
        {
            number: "004",
            photo: "assets/memory-01.jpg",
            title: "THE CLASSIFIED INCIDENT",
            subtitle: "Incident details: classified.",
            interactive: true,
            metadata: [
                ["DATE", "███████"],
                ["LOCATION", "███████"],
                ["WITNESS", "███████"],
                ["STATUS", "HIGHLY CLASSIFIED"]
            ]
        },
        {
            number: "005",
            title: "THE STORY CONTINUES",
            subtitle: "",
            finale: true,
            metadata: [["COLLECTION", "PERSONAL"], ["STATUS", "ONGOING"]]
        }
    ];

    const stage = document.getElementById("archiveStage");
    const template = document.getElementById("archivePageTemplate");
    const previousButton = document.getElementById("archivePrevious");
    const nextButton = document.getElementById("archiveNext");
    const pageStatus = document.getElementById("archivePageStatus");
    const starField = document.querySelector(".archive-star-field");

    if (!stage || !template || !previousButton || !nextButton || !pageStatus) return;

    let currentPage = 0;
    let case004Closed = false;
    let turnLocked = false;
    let pointerStart = null;
    let activeTurn = null;
    let finalTransitionRunning = false;
    let memoryPhotosPromise = null;
    let activeMemoryPhotos = [];
    const memoryPhotoSources = Array.from({ length: 12 }, (_, index) => `assets/memory-${String(index + 1).padStart(2, "0")}.jpg`);
    const casePhotoSources = {
        "001": "assets/memory-04.jpg",
        "002": "assets/memory-03.jpg",
        "003": "assets/memory-02.jpg",
        "004": "assets/memory-01.jpg"
    };
    function setText(root, field, value) {
        const element = root.querySelector(`[data-field="${field}"]`);
        if (element) element.textContent = value;
    }

    function makeElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function makeParrotButton() {
        const button = makeElement("button", "case-004-parrot");
        button.type = "button";
        button.setAttribute("aria-label", "Tap the witness to let it fly away");
        button.innerHTML = `<svg viewBox="0 0 120 92" aria-hidden="true" focusable="false">
            <path class="parrot-tail" d="M49 57 18 80l34-12 8 18 4-21"/>
            <path class="parrot-wing-back" d="M45 37C28 28 17 34 20 47c4 15 20 21 38 14"/>
            <path class="parrot-body" d="M42 22c13-12 34-9 42 5 7 12 2 31-10 40-10 7-25 4-32-6-8-12-8-29 0-39Z"/>
            <path class="parrot-wing" d="M44 36c12-8 26-4 31 6 5 10-2 20-12 23-10 2-21-6-23-16"/>
            <path class="parrot-feather" d="M46 45c9-4 17 2 18 10m-14-17c8-4 17 0 20 7"/>
            <path class="parrot-head" d="M54 14c5-10 18-12 27-5 8 6 9 19 2 26-8 8-21 7-28-1-5-6-6-14-1-20Z"/>
            <path class="parrot-beak" d="m79 20 19 4-15 10c-3-4-4-9-4-14Z"/>
            <path class="parrot-beak-lower" d="m83 34 11-2-9 8Z"/>
            <circle class="parrot-eye-ring" cx="72" cy="17" r="5.4"/><circle class="parrot-eye" cx="73" cy="17" r="2"/>
            <path class="parrot-leg" d="m59 65-2 9m14-9 2 9m-20 1 7 0m9 0 7 0"/>
        </svg>`;
        return button;
    }

    function buildInvestigation(page) {
        const content = page.querySelector(".archive-paper-content");
        if (!content) return;

        page.classList.add("case-004");
        const photoPlaceholder = page.querySelector(".archive-photo-placeholder");

            if (photoPlaceholder) {
                const photo = document.createElement("img");
                photo.src = "assets/memory-01.jpg";
                photo.alt = "Classified evidence photograph";
                photo.draggable = false;

                photo.style.width = "100%";
                photo.style.height = "100%";
                photo.style.objectFit = "cover";
                photo.style.display = "block";

                photoPlaceholder.replaceChildren(photo);
            }
        const investigation = makeElement("div", "case-004-investigation");
        const intro = makeElement("p", "case-004-intro", "“It started with a completely normal question…”");
        const counter = makeElement("p", "case-004-counter", "EVIDENCE FOUND: 03");
        const evidenceList = makeElement("div", "case-004-evidence-list");
        const prompt = makeElement("p", "case-004-prompt");
        const details = makeElement("div", "case-004-details");
        details.setAttribute("aria-live", "polite");
        details.setAttribute("aria-atomic", "true");
        investigation.append(intro, counter, evidenceList, prompt, details);
        content.replaceChildren(investigation);

        let step = 0;
        let flightInProgress = false;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        function drawEvidence() {
            evidenceList.replaceChildren();
            for (let number = 1; number <= 3; number++) {
                const unlocked = step >= number - 1 && step < 4;
                const completed = number === 1 ? step >= 1 : number === 2 ? step >= 2 : step >= 5;
                const current = !completed && step >= number - 1 && step < number + 1;
                const card = makeElement("button", `case-004-evidence${current ? " is-current" : ""}${completed ? " is-verified" : ""}`);
                card.type = "button";
                card.dataset.evidence = String(number);
                card.disabled = !unlocked || completed || flightInProgress || step >= 3;
                card.setAttribute("aria-expanded", step === number ? "true" : "false");
                card.append(makeElement("span", "evidence-label", `EVIDENCE 0${number}`));
                card.append(makeElement("span", "evidence-redaction", completed ? "VERIFIED ✓" : unlocked ? "TAP TO REVIEW" : "████████"));
                evidenceList.append(card);
            }
            prompt.textContent = step === 0 ? "CLICK ON THE EVIDENCES →" : step === 1 ? "SELECT EVIDENCE 02 TO CONTINUE →" : step === 2 ? "SELECT EVIDENCE 03 TO CONTINUE →" : step === 3 ? "THEN CLICK ON THE PARROT →" : "WITNESS REVIEW IN PROGRESS";
        }

        function detailBlock(label, heading, quote, verified) {
            const block = makeElement("section", "case-004-detail-card");
            block.append(makeElement("p", "detail-kicker", label), makeElement("h2", "detail-heading", heading));
            if (quote) block.append(makeElement("blockquote", "detail-quote", quote));
            if (verified) block.append(makeElement("p", "detail-verified", verified));
            return block;
        }

        function drawDetails() {
            details.replaceChildren();
            document.querySelector(".archives-environment")?.classList.toggle("is-classified-atmosphere", step >= 3);

            if (step === 1) details.append(detailBlock("EVIDENCE 01", "A QUESTION WAS ASKED.", "“Tu naha bhi liya kar kabhi.”", "EVIDENCE 01 VERIFIED ✓"));
            if (step === 2) details.append(detailBlock("EVIDENCE 02", "THE SUSPECT DEMANDED PROOF.", "“Koi proof hai? Main kaise maan lu?”", "EVIDENCE 02 VERIFIED ✓"));
            if (step === 3 || step === 4 || step === 5) {
                const witness = detailBlock("EVIDENCE 03", "A WITNESS WAS PRESENT.");
                const classification = makeElement("div", "witness-classification");
                classification.append(makeElement("p", "witness-species", "SPECIES: PARROT 🦜"), makeElement("p", "witness-reliability", "RELIABILITY: QUESTIONABLE"));
                witness.append(classification);
                if (step === 3) {
                    const row = makeElement("div", "witness-action-row");
                    row.append(makeElement("span", "parrot-instruction", "TAP TO QUESTION WITNESS"), makeParrotButton());
                    witness.append(row);
                } else if (step === 4) witness.append(makeElement("p", "detail-verified", "WITNESS DEPARTED"));
                else witness.append(makeElement("p", "detail-verified", "WITNESS VERIFIED ✓"));
                details.append(witness);
            }
            if (step === 6 || step === 7) {
                const closing = makeElement("section", `case-004-closing${step === 7 ? " is-case-closed" : ""}`);
                closing.append(makeElement("p", "closing-overline", "WITNESS VERIFIED ✓"), makeElement("h2", "closing-line", "AND THE REST…"), makeElement("h2", "closing-line", "WHO KNOWS? 👀"));
                if (step === 7) closing.append(makeElement("p", "case-closed-stamp", "CASE CLOSED ✓"));
                details.append(closing);
            }
        }

        function render() {
            drawEvidence();
            drawDetails();
        }

        function completeInvestigation() {
            step = 7;
            drawEvidence();
            const closing = details.querySelector(".case-004-closing");
            if (closing) {
                closing.append(makeElement("p", "case-closed-stamp", "CASE CLOSED ✓"));
            }
            case004Closed = true;
            preloadMemoryPhotos();
            nextButton.disabled = false;
        }

        function letWitnessFly(button) {
            if (flightInProgress || step !== 3) return;
            flightInProgress = true;
            step = 4;
            const bounds = button.getBoundingClientRect();
            const flight = makeElement("div", "case-004-parrot case-004-parrot-flight");
            flight.setAttribute("aria-hidden", "true");
            flight.innerHTML = button.innerHTML;
            flight.style.left = `${bounds.left}px`;
            flight.style.top = `${bounds.top}px`;
            flight.style.width = `${bounds.width}px`;
            flight.style.height = `${bounds.height}px`;
            document.querySelector(".archives-environment")?.append(flight);
            render();

            const quick = reducedMotion.matches;
            const flightDistance = window.innerWidth - bounds.left + bounds.width;
            const flightHeight = window.innerHeight;
            const animation = flight.animate([
                { transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)", opacity: 1, offset: 0 },
                { transform: `translate3d(${flightDistance * .14}px, ${-flightHeight * .11}px, 0) rotate(9deg) scale(1.04)`, opacity: 1, offset: .22 },
                { transform: `translate3d(${flightDistance * .43}px, ${-flightHeight * .2}px, 0) rotate(-5deg) scale(1.08)`, opacity: 1, offset: .5 },
                { transform: `translate3d(${flightDistance * .76}px, ${-flightHeight * .1}px, 0) rotate(8deg) scale(1)`, opacity: 1, offset: .78 },
                { transform: `translate3d(${flightDistance}px, ${-flightHeight * .18}px, 0) rotate(15deg) scale(.9)`, opacity: 0, offset: 1 }
            ], { duration: quick ? 360 : 3000, easing: "cubic-bezier(.36,.02,.64,1)", fill: "forwards" });

            animation.finished.catch(() => {}).then(() => {
                flight.remove();
                step = 4;
                flightInProgress = false;
                render();
                window.setTimeout(() => {
                    step = 5;
                    render();
                    window.setTimeout(() => {
                        step = 6;
                        render();
                        window.setTimeout(completeInvestigation, reducedMotion.matches ? 120 : 320);
                    }, reducedMotion.matches ? 150 : 480);
                }, reducedMotion.matches ? 120 : 350);
            });
        }

        investigation.addEventListener("click", event => {
            const evidenceButton = event.target.closest("[data-evidence]");
            if (evidenceButton && !evidenceButton.disabled) {
                const selected = Number(evidenceButton.dataset.evidence);
                if (selected === step + 1 && selected <= 3) {
                    step = selected;
                    render();
                }
                return;
            }
            const parrot = event.target.closest(".case-004-parrot:not(.case-004-parrot-flight)");
            if (parrot) letWitnessFly(parrot);
        });

        render();
    }

    function preloadMemoryPhotos() {
        if (memoryPhotosPromise) return memoryPhotosPromise;
        memoryPhotosPromise = Promise.all(memoryPhotoSources.map(source => new Promise(resolve => {
            const image = new Image();
            image.onload = () => resolve(source);
            image.onerror = () => resolve(null);
            image.src = source;
        }))).then(sources => sources.filter(Boolean));
        return memoryPhotosPromise;
    }

    function wait(milliseconds) {
        return new Promise(resolve => window.setTimeout(resolve, milliseconds));
    }

    const scrapbookLayout = [
        [0, 22, 18, -7], [11, 2, 17, 5], [22, 18, 17, -3], [34, 1, 16, 7],
        [45, 21, 18, -5], [57, 3, 17, 4], [68, 20, 18, -6], [80, 2, 16, 6],
        [88, 22, 12, -4], [7, 38, 14, 3], [39, 37, 15, -5], [73, 38, 14, 4]
    ];
    const separatedPlaceholderLayout = [
        [1, 14, 14, -4], [18, 5, 14, 3], [35, 14, 14, -3],
        [52, 5, 14, 3], [69, 14, 14, -3], [86, 5, 13, 4]
    ];

    function makeMemoryScrap(source, index) {
        const layout = !source && window.innerWidth > 600
            ? separatedPlaceholderLayout[index % separatedPlaceholderLayout.length]
            : scrapbookLayout[index % scrapbookLayout.length];
        const [x, y, width, rotation] = layout;
        const figure = makeElement("figure", "memory-photo");
        figure.dataset.photoIndex = String(index);
        figure.dataset.rotation = String(rotation);
        figure.style.setProperty("--scrap-x", `${x}%`);
        figure.style.setProperty("--scrap-y", `${y}%`);
        figure.style.setProperty("--scrap-width", `${width}%`);
        figure.style.setProperty("--scrap-rotation", `${rotation}deg`);
        figure.style.setProperty("--scrap-depth", String(index + 1));
        if (source) {
            const image = document.createElement("img");
            image.src = source;
            image.alt = "A memory photograph of Alui";
            image.draggable = false;
            figure.append(image);
        } else {
            const placeholder = makeElement("span", "memory-photo-placeholder", `MEMORY 0${index + 1}`);
            figure.append(placeholder);
        }
        return figure;
    }

    function buildFinalArchivePage(page) {
        const content = page.querySelector(".archive-paper-content");
        if (!content) return;
        page.querySelector(".archive-photo-placeholder")?.setAttribute("aria-hidden", "true");
        page.classList.add("final-archive-page");
        const finalContent = makeElement("div", "final-archive-content");
        finalContent.append(makeElement("p", "final-archive-status", "ARCHIVE STATUS: ONGOING"));
        const collage = makeElement("div", "final-memory-collage");
        const sources = activeMemoryPhotos.length ? activeMemoryPhotos : Array.from({ length: 6 }, () => null);
        sources.forEach((source, index) => collage.append(makeMemoryScrap(source, index)));

        const copy = makeElement("div", "final-archive-copy");
        const memories = makeElement("p", "final-copy-lead", "So… these were just a few of the memories\nwe've collected along the way. ❤️");
        const honestly = makeElement("p", "final-copy-pause", "But honestly…");
        const ahead = makeElement("p", "", "there are still so many memories left to make.");
        const hindi = makeElement("p", "", "Aur haan,\nabhi toh aur aage jaana hai.");
        const room = makeElement("p", "", "The archive isn't ending here.\nIt's just making space for the next memories.");
        const written = makeElement("p", "final-copy-written", "This story is still being written…");
        copy.append(memories, honestly, ahead, hindi, room, written);

        const continueButton = makeElement("button", "final-continue-button", "CONTINUE TO BIRTHDAY →");
        continueButton.type = "button";
        continueButton.addEventListener("click", () => {
            const birthdayUrl = new URL("../birthday/birthday.html?from=archives", document.baseURI);
            window.location.assign(birthdayUrl.href);
        });
        finalContent.append(collage, copy, continueButton);
        content.replaceChildren(finalContent);
    }

    async function startFinalArchiveTransition() {
        if (!case004Closed || finalTransitionRunning) return;
        finalTransitionRunning = true;
        turnLocked = true;
        previousButton.disabled = true;
        nextButton.disabled = true;
        stage.setAttribute("aria-busy", "true");
        stage.firstElementChild?.classList.add("archive-vortex-source");

        const environment = document.querySelector(".archives-environment");
        const overlay = makeElement("div", "memory-vortex-overlay");
        const shade = makeElement("div", "memory-vortex-shade");
        const orbit = makeElement("div", "memory-vortex-orbit");
        const outerRing = makeElement("i", "memory-vortex-ring memory-vortex-ring-outer");
        const innerRing = makeElement("i", "memory-vortex-ring memory-vortex-ring-inner");
        const glow = makeElement("div", "memory-vortex-glow");
        orbit.append(outerRing, innerRing);
        overlay.append(shade, orbit, glow);
        environment?.append(overlay);
        environment?.classList.add("is-memory-vortex");

        const photoLoad = preloadMemoryPhotos();
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        await wait(reducedMotion ? 120 : 280);
        activeMemoryPhotos = await photoLoad;

        const finaleIndex = archiveCases.findIndex(record => record.finale);
        const finalPage = buildPage(finaleIndex);
        finalPage.classList.add("archive-finale-underlay");
        finalPage.setAttribute("aria-hidden", "true");
        finalPage.inert = true;
        stage.append(finalPage);

        const photoSources = activeMemoryPhotos.length ? activeMemoryPhotos : Array.from({ length: 6 }, () => null);
        const cardWidth = Math.max(56, Math.min(114, window.innerWidth * .14));
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const centerX = viewportWidth * .5;
        const centerY = viewportHeight * .5;
        const orbitX = Math.min(viewportWidth * .43, 280);
        const orbitY = Math.min(viewportHeight * .39, 340);
        const cards = [];
        const peakTransforms = [];
        const gatherAnimations = [];

        photoSources.forEach((source, index) => {
            const card = makeMemoryScrap(source, index);
            card.classList.add("memory-vortex-card");
            card.style.width = `${cardWidth}px`;
            card.style.zIndex = String(20 + index);
            overlay.append(card);
            cards.push(card);

            const angle = -Math.PI / 2 + (Math.PI * 2 * index / photoSources.length);
            const depthScale = .68 + ((index * 3) % 5) * .095;
            const rotation = (index % 2 ? -1 : 1) * (8 + (index % 6) * 4);
            const point = (radius, turn, verticalBias = 0) => {
                const a = angle + turn;
                const x = Math.max(cardWidth / 2 + 5, Math.min(viewportWidth - cardWidth / 2 - 5, centerX + Math.cos(a) * orbitX * radius));
                const y = Math.max(cardWidth * .42 + 5, Math.min(viewportHeight - cardWidth * .42 - 5, centerY + Math.sin(a) * orbitY * radius + verticalBias));
                return [x, y];
            };
            const transformAt = (x, y, turn, scale) => `translate3d(${x}px,${y}px,0) rotate(${rotation + turn * 30}deg) scale(${scale}) translate(-50%,-50%)`;
            const start = point(1, 0);
            const orbitA = point(.82, 1.4);
            const orbitB = point(.59, 2.9);
            const orbitC = point(.36, 4.4, (index % 3 - 1) * 16);
            const orbitD = point(.17, 5.9, (index % 4 - 1.5) * 13);
            const peak = [centerX + Math.cos(angle * 2) * 24, centerY + Math.sin(angle * 2) * 46];
            const peakTransform = transformAt(peak[0], peak[1], 7.1, depthScale);
            peakTransforms.push(peakTransform);
            const animation = card.animate([
                { transform: transformAt(start[0], start[1], 0, depthScale * .72), opacity: 0, offset: 0 },
                { transform: transformAt(start[0], start[1], .6, depthScale), opacity: .9, offset: .12 },
                { transform: transformAt(orbitA[0], orbitA[1], 1.4, depthScale * .92), opacity: .95, offset: .3 },
                { transform: transformAt(orbitB[0], orbitB[1], 2.9, depthScale * 1.02), opacity: 1, offset: .49 },
                { transform: transformAt(orbitC[0], orbitC[1], 4.4, depthScale * 1.08), opacity: 1, offset: .68 },
                { transform: transformAt(orbitD[0], orbitD[1], 5.9, depthScale * .96), opacity: 1, offset: .85 },
                { transform: peakTransform, opacity: 1, offset: 1 }
            ], { duration: reducedMotion ? 680 : 2060, delay: reducedMotion ? 0 : index * 18, easing: "cubic-bezier(.48,.02,.52,.98)", fill: "forwards" });
            gatherAnimations.push(animation);
        });

        await Promise.all(gatherAnimations.map(animation => animation.finished.catch(() => {})));
        glow.classList.add("is-peak");
        await wait(reducedMotion ? 120 : 300);

        finalPage.classList.remove("archive-finale-underlay");
        finalPage.classList.add("is-revealing-memory");
        finalPage.removeAttribute("aria-hidden");
        finalPage.inert = false;
        stage.replaceChildren(finalPage);
        currentPage = finaleIndex;
        pageStatus.textContent = `CASE 005 / ${String(archiveCases.length).padStart(3, "0")}`;

        const revealDuration = reducedMotion ? 180 : 1280;
        const pageReveal = finalPage.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: revealDuration, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }
        );
        const shadeFade = shade.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: revealDuration, easing: "cubic-bezier(.4,0,.2,1)", fill: "both" }
        );

        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const settleAnimations = cards.map((card, index) => {
            const target = finalPage.querySelector(`.memory-photo[data-photo-index="${index}"]`);
            if (!target) return Promise.resolve();
            const bounds = target.getBoundingClientRect();
            const targetCenterX = bounds.left + bounds.width / 2;
            const targetCenterY = bounds.top + bounds.height / 2;
            const scale = target.offsetWidth / cardWidth;
            const rotation = Number(target.dataset.rotation || 0);
            const targetTransform = `translate3d(${targetCenterX}px,${targetCenterY}px,0) rotate(${rotation}deg) scale(${scale}) translate(-50%,-50%)`;
            card.style.transform = peakTransforms[index];
            card.getAnimations().forEach(animation => animation.cancel());
            const animation = card.animate([
                { transform: peakTransforms[index], opacity: 1 },
                { transform: targetTransform, opacity: 1 }
            ], { duration: reducedMotion ? 360 : 780, delay: reducedMotion ? 0 : index * 14, easing: "cubic-bezier(.2,.72,.2,1)", fill: "forwards" });
            return animation.finished.catch(() => {});
        });
        await Promise.all([
            ...settleAnimations,
            pageReveal.finished.catch(() => {}),
            shadeFade.finished.catch(() => {})
        ]);

        finalPage.classList.remove("is-revealing-memory");
        overlay.remove();
        environment?.classList.remove("is-memory-vortex");
        stage.removeAttribute("aria-busy");
        previousButton.disabled = false;
        nextButton.disabled = true;
        turnLocked = false;
        finalTransitionRunning = false;
    }

    function buildPage(index) {
        const record = archiveCases[index];
        const page = template.content.firstElementChild.cloneNode(true);

        setText(page, "case-number", record.number);
        setText(page, "case-title", record.title);
        if (!record.interactive && record.content !== undefined) setText(page, "case-content", record.content);
        if (record.subtitle !== undefined) setText(page, "case-subtitle", record.subtitle);
        if (["001", "002", "003"].includes(record.number)) page.querySelector('[data-field="case-content"]')?.classList.add("case-001-story");
        if (record.metadata) {
            const metadata = page.querySelector(".archive-metadata");
            const rowTemplate = metadata?.querySelector("p");
            if (metadata && rowTemplate) {
                metadata.replaceChildren(...record.metadata.map(([label, value]) => {
                    const row = rowTemplate.cloneNode(true);
                    row.querySelector(".metadata-label").textContent = label;
                    row.querySelector(".metadata-value").textContent = value;
                    return row;
                }));
            }
        }
        if (casePhotoSources[record.number] && !record.interactive) {
            const photo = page.querySelector(".archive-photo-placeholder");

            if (photo) {
                photo.style.backgroundImage = `url("${casePhotoSources[record.number]}")`;
                photo.style.backgroundSize = "cover";
                photo.style.backgroundPosition = "center";
                photo.querySelector(".photo-placeholder-inner")?.remove();
            }
        }
        if (record.interactive) {
            case004Closed = false;
            buildInvestigation(page);
        }
        if (record.finale) buildFinalArchivePage(page);
        setText(page, "page-number", String(index + 1).padStart(2, "0"));
        page.setAttribute("aria-label", `Archive case ${record.number}: ${record.title}`);
        return page;
    }

    function renderPage(index) {
        currentPage = Math.max(0, Math.min(archiveCases.length - 1, index));
        document.querySelector(".archives-environment")?.classList.remove("is-classified-atmosphere");
        const record = archiveCases[currentPage];
        const page = buildPage(currentPage);

        stage.replaceChildren(page);
        previousButton.disabled = currentPage === 0;
        nextButton.disabled = (record.interactive && !case004Closed) || currentPage === archiveCases.length - 1;
        pageStatus.textContent = `CASE ${record.number} / ${String(archiveCases.length).padStart(3, "0")}`;
    }

    function setTurnPose(turn, progress) {
        const p = Math.max(0, Math.min(1, progress));
        const angle = turn.direction > 0 ? 180 * p : -180 * p;
        const lateralCurl = (turn.direction > 0 ? -1 : 1) * Math.sin(p * Math.PI) * 2.2;
        turn.layer.style.setProperty("--turn-progress", p);
        turn.layer.style.setProperty("--turn-depth", Math.sin(p * Math.PI).toFixed(3));
        turn.sheet.style.setProperty("--curl-lift", `${Math.sin(p * Math.PI) * 1.8}deg`);
        turn.sheet.style.transform = `perspective(1800px) rotateX(${angle}deg) rotateY(${lateralCurl}deg) translateY(${(p * 8).toFixed(1)}px) scaleX(calc(1 - var(--turn-depth, 0) * .018))`;
    }

    function beginTurn(direction, interactive = false) {
        if (turnLocked || (direction > 0 && archiveCases[currentPage]?.interactive && !case004Closed) || (direction > 0 && currentPage >= archiveCases.length - 1) || (direction < 0 && currentPage <= 0)) return null;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const nextIndex = currentPage + direction;
        const under = buildPage(nextIndex);
        under.classList.add("archive-page-underneath");
        under.setAttribute("aria-hidden", "true");
        under.inert = true;
        const currentRect = stage.firstElementChild.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        const layer = document.createElement("div");
        layer.className = `archive-page-turn-layer ${direction > 0 ? "is-next" : "is-previous"}${interactive ? " is-interactive" : " is-programmatic"}`;
        layer.style.setProperty("--sheet-width", `${currentRect.width}px`);
        layer.style.setProperty("--sheet-height", `${currentRect.height}px`);
        layer.style.setProperty("--sheet-left", `${currentRect.left - stageRect.left}px`);
        layer.style.setProperty("--sheet-top", `${currentRect.top - stageRect.top}px`);
        const sheet = document.createElement("div");
        sheet.className = "archive-turning-sheet";
        sheet.style.width = `${currentRect.width}px`;
        sheet.style.height = `${currentRect.height}px`;
        sheet.style.left = `${currentRect.left - stageRect.left}px`;
        sheet.style.top = `${currentRect.top - stageRect.top}px`;
        sheet.setAttribute("aria-hidden", "true");
        sheet.inert = true;
        const front = document.createElement("div");
        front.className = "archive-turn-front";
        const frontPage = stage.firstElementChild.cloneNode(true);
        frontPage.classList.add("archive-turning-page");
        frontPage.removeAttribute("aria-labelledby");
        front.append(frontPage);
        const back = document.createElement("div");
        back.className = "archive-paper-back";
        back.setAttribute("aria-hidden", "true");
        sheet.append(front, back);
        layer.append(sheet);
        stage.replaceChildren(under, layer);
        turnLocked = true;
        previousButton.disabled = true;
        nextButton.disabled = true;
        stage.classList.toggle("is-page-turning", true);
        activeTurn = { direction, nextIndex, layer, sheet, under, interactive, reducedMotion, settled: false };
        return activeTurn;
    }

    function settleTurn(commit) {
        const turn = activeTurn;
        if (!turn || turn.settled) return;
        turn.settled = true;
        turn.layer.classList.add("is-settling");
        turn.layer.classList.toggle("is-committing", commit);
        setTurnPose(turn, commit ? 1 : 0);
        const finish = () => {
            if (activeTurn !== turn) return;
            if (commit) currentPage = turn.nextIndex;
            activeTurn = null;
            turnLocked = false;
            renderPage(currentPage);
            stage.classList.remove("is-page-turning");
        };
        turn.sheet.style.transition = turn.reducedMotion
            ? "transform 360ms ease-out"
            : turn.layer.classList.contains("is-programmatic") && commit
                ? "transform 760ms cubic-bezier(.64, 0, .28, 1)"
                : "transform 480ms cubic-bezier(.2, .78, .25, 1)";
        let done = false;
        const once = () => { if (done) return; done = true; finish(); };
        turn.sheet.addEventListener("transitionend", event => { if (event.propertyName === "transform") once(); }, { once: true });
        window.setTimeout(once, 900);
    }

    function turnByButton(direction) {
        if (direction > 0 && archiveCases[currentPage]?.interactive && !case004Closed) return;
        if (direction > 0 && archiveCases[currentPage]?.interactive && case004Closed) {
            startFinalArchiveTransition();
            return;
        }
        const turn = beginTurn(direction, false);
        if (!turn) return;
        turn.sheet.style.transition = "none";
        setTurnPose(turn, 0);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (activeTurn !== turn) return;
            settleTurn(true);
        }));
    }

    function cancelGesture() {
        if (activeTurn?.interactive && !activeTurn.settled) settleTurn(false);
        pointerStart = null;
    }

    stage.addEventListener("pointerdown", event => {
        if (turnLocked || event.button > 0 || event.target.closest("button, a, input, textarea, select")) return;
        pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY, at: performance.now(), direction: 0, width: stage.clientWidth, moved: false, finalPage: Boolean(archiveCases[currentPage]?.interactive && case004Closed) };
        try { stage.setPointerCapture(event.pointerId); } catch (_) { /* Pointer capture is optional on older browsers. */ }
    });
    stage.addEventListener("pointermove", event => {
        if (!pointerStart || pointerStart.id !== event.pointerId) return;
        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;
        if (pointerStart.finalPage && !pointerStart.direction) {
            if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
            if (Math.abs(dy) > Math.abs(dx)) { pointerStart = null; return; }
            if (dx < 0) {
                pointerStart.finalForward = true;
                pointerStart.direction = 1;
                event.preventDefault();
                return;
            }
        }
        if (pointerStart.finalForward) { event.preventDefault(); pointerStart.moved = true; return; }
        if (!pointerStart.direction) {
            if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
            if (Math.abs(dy) > Math.abs(dx)) { pointerStart = null; return; }
            const direction = dx < 0 ? 1 : -1;
            if ((direction > 0 && currentPage >= archiveCases.length - 1) || (direction < 0 && currentPage <= 0)) { pointerStart = null; return; }
            pointerStart.direction = direction;
            activeTurn = beginTurn(direction, true);
            if (!activeTurn) { pointerStart = null; return; }
            activeTurn.sheet.style.transition = "none";
        }
        if (Math.abs(dy) > Math.abs(dx) * 1.15) return;
        event.preventDefault();
        pointerStart.moved = true;
        const signedProgress = (pointerStart.x - event.clientX) * pointerStart.direction / Math.max(1, pointerStart.width);
        setTurnPose(activeTurn, signedProgress);
    }, { passive: false });
    stage.addEventListener("pointerup", event => {
        if (!pointerStart || pointerStart.id !== event.pointerId) return;
        const turn = activeTurn;
        const start = pointerStart;
        pointerStart = null;
        if (start.finalForward) {
            const dx = start.x - event.clientX;
            const elapsed = Math.max(1, performance.now() - start.at);
            const velocity = Math.abs(dx) / elapsed;
            const progress = Math.abs(dx) / Math.max(1, start.width);
            if (progress >= .27 || (progress >= .12 && velocity > .55)) startFinalArchiveTransition();
            return;
        }
        if (!turn?.interactive) return;
        const dx = start.x - event.clientX;
        const elapsed = Math.max(1, performance.now() - (start.at || performance.now()));
        const velocity = Math.abs(dx) / elapsed;
        const progress = Math.abs(dx) / Math.max(1, start.width);
        settleTurn(progress >= .27 || (progress >= .12 && velocity > .55));
    });
    stage.addEventListener("pointercancel", cancelGesture);
    stage.addEventListener("lostpointercapture", () => { if (pointerStart) cancelGesture(); });

    function addStars(count = 64) {
        if (!starField) return;
        let seed = 18371;
        const random = () => {
            seed = seed * 16807 % 2147483647;
            return (seed - 1) / 2147483646;
        };

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const star = document.createElement("i");
            star.className = "archive-star";
            star.style.setProperty("--star-x", `${(random() * 100).toFixed(2)}%`);
            star.style.setProperty("--star-y", `${(random() * 100).toFixed(2)}%`);
            star.style.setProperty("--star-size", `${random() > .91 ? 2.5 : 1 + random()}px`);
            star.style.setProperty("--star-opacity", `${(.28 + random() * .55).toFixed(2)}`);
            star.style.setProperty("--star-duration", `${(4 + random() * 8).toFixed(2)}s`);
            star.style.setProperty("--star-delay", `${(-random() * 9).toFixed(2)}s`);
            fragment.append(star);
        }
        starField.append(fragment);
    }

    previousButton.addEventListener("click", () => turnByButton(-1));
    nextButton.addEventListener("click", () => turnByButton(1));
    document.addEventListener("keydown", event => {
        if (document.documentElement.classList.contains("archives-vortex-arrival")) return;
        if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest("button, input, textarea, select, [contenteditable='true']")) return;
        if (event.key === "ArrowLeft" && currentPage > 0) turnByButton(-1);
        if (event.key === "ArrowRight" && currentPage < archiveCases.length - 1) turnByButton(1);
    });

    addStars();
    renderPage(0);
})();
