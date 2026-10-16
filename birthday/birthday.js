(() => {
  "use strict";
  const app = document.getElementById("experience");
  const canvas = document.getElementById("effectsCanvas");
  const birthdaySong = document.getElementById("birthdaySong");
  const musicButton = document.getElementById("birthdayMusicButton");
  const ctx = canvas.getContext("2d", { alpha: true });
  const scenes = [...document.querySelectorAll(".scene")];
  const announcement = document.getElementById("announcement");
  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  let locked = false;
  let particles = [];
  let frame = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let dpr = 1;
  let seed = 87231;
  const pandaMessages = {
    archives: "Psst… one last file!",
    void: "I think there’s one more thing…",
    promise: "That sounds a little suspicious…",
    countdown: "Ready? Deep breath!",
    reveal: "Told you there was more! 🐼",
    gifts: "I wrapped these myself. Mostly. 🎁",
    ending: "Mission complete. Happy birthday, Alui. 🐼"
  };
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };

  function fitCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", fitCanvas, { passive: true });
  fitCanvas();

  function makeStars(count = 105) {
    const field = document.getElementById("starField");
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement("i");
      star.className = "star";
      star.style.setProperty("--x", `${random() * 100}%`);
      star.style.setProperty("--y", `${random() * 100}%`);
      star.style.setProperty("--size", `${random() > .93 ? 2 : .7 + random() * .9}px`);
      star.style.setProperty("--alpha", `${(.2 + random() * .65).toFixed(2)}`);
      star.style.setProperty("--alpha-low", `${(.07 + random() * .2).toFixed(2)}`);
      star.style.setProperty("--duration", `${(3 + random() * 7).toFixed(2)}s`);
      star.style.setProperty("--delay", `${(-random() * 8).toFixed(2)}s`);
      fragment.append(star);
    }
    field.append(fragment);
  }

  function setScene(name) {
    app.dataset.scene = name;
    app.classList.remove("is-wishing", "is-wish-made");
    document.getElementById("scene-cake").classList.toggle("is-celebrating", name === "cake");
    const guide = document.getElementById("pandaGuide");
    const guideMessage = pandaMessages[name];
    guide.hidden = !guideMessage;
    guide.classList.remove("is-reacting");
    if (guideMessage) {
      document.getElementById("pandaGuideLine").textContent = guideMessage;
      requestAnimationFrame(() => guide.classList.add("is-reacting"));
    }
    scenes.forEach(scene => {
      const active = scene.id === `scene-${name}`;
      scene.classList.toggle("is-active", active);
      scene.inert = !active;
      if (active) scene.removeAttribute("aria-hidden"); else scene.setAttribute("aria-hidden", "true");
    });
  }

  function makeParticle(type, bounds) {
    let x = random() * canvasWidth;
    let y = random() * canvasHeight;
    let color;
    if (type === "shatter") {
      if (random() < .78) {
        x = bounds.left + random() * bounds.width;
        y = bounds.top + random() * bounds.height;
        const colorRoll = random();
        color = colorRoll < .79 ? ["#eee5cf", "#e2d5bc", "#f4ead5"][Math.floor(random() * 3)] : colorRoll < .91 ? "#65533e" : "#c8a36c";
      } else color = ["#8e70ca", "#d9b9ff", "#b98de4", "#f2d49f"][Math.floor(random() * 4)];
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height / 2;
      let vx = (x - cx) / Math.max(1, bounds.width) * (110 + random() * 270) + (random() - .5) * 140;
      let vy = (y - cy) / Math.max(1, bounds.height) * (90 + random() * 250) + (random() - .5) * 180;
      if (random() < .22) vy -= 100 + random() * 160;
      if (random() < .14) vy += 90 + random() * 120;
      return { type, x, y, vx, vy, size: 3 + random() * 11, rotation: random() * 6.28, spin: (random() - .5) * 9, color, life: 1.15 + random() * 1.2, age: 0, shape: random() };
    }
    const cx = canvasWidth * (.5 + (random() - .5) * .16);
    const cy = canvasHeight * .48;
    const angle = random() * Math.PI * 2;
    const speed = 70 + random() * (type === "boom" ? 390 : 190);
    const palette = ["#f7d78e", "#f4a8d7", "#d2b7ff", "#fff4dc", "#a999ff"];
    return { type, x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 2 + random() * (type === "boom" ? 8 : 5), rotation: random() * 6.28, spin: (random() - .5) * 11, color: palette[Math.floor(random() * palette.length)], life: .9 + random() * 1.5, age: 0, shape: random() };
  }

  function drawParticle(p) {
    const fadeIn = Math.min(1, p.age * 9);
    const fadeOut = Math.min(1, (p.life - p.age) * 2.2);
    ctx.globalAlpha = Math.max(0, Math.min(fadeIn, fadeOut));
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    if (p.type === "shatter") {
      const w = p.size * (p.shape > .7 ? 1.7 : .9);
      const h = p.size * (.45 + p.shape * .9);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.size > 8 ? 7 : 0;
      ctx.beginPath();
      ctx.moveTo(-w * .58, -h * .4);
      ctx.lineTo(w * .5, -h * .54);
      ctx.lineTo(w * (.35 + p.shape * .4), h * .45);
      ctx.lineTo(-w * .3, h * .55);
      ctx.closePath();
      ctx.fill();
      if (p.color === "#eee5cf" || p.color === "#f4ead5") {
        ctx.globalAlpha *= .38;
        ctx.strokeStyle = "#927d5d";
        ctx.lineWidth = .55;
        ctx.beginPath(); ctx.moveTo(-w * .34, 0); ctx.lineTo(w * .27, 0); ctx.stroke();
      }
    } else {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.type === "boom" ? 9 : 4;
      if (p.shape < .28) {
        ctx.beginPath(); ctx.arc(0, 0, p.size * .48, 0, Math.PI * 2); ctx.fill();
      } else if (p.shape < .6) {
        ctx.fillRect(-p.size * .4, -p.size * .95, p.size * .8, p.size * 1.9);
      } else if (p.shape < .85) {
        ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * .25, -p.size * .2); ctx.lineTo(p.size, 0); ctx.lineTo(p.size * .25, p.size * .2); ctx.lineTo(0, p.size); ctx.lineTo(-p.size * .25, p.size * .2); ctx.lineTo(-p.size, 0); ctx.lineTo(-p.size * .25, -p.size * .2); ctx.closePath(); ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(-p.size * .17, -p.size * .1, p.size * .24, 0, Math.PI * 2); ctx.arc(p.size * .17, -p.size * .1, p.size * .24, 0, Math.PI * 2); ctx.moveTo(-p.size * .4, 0); ctx.quadraticCurveTo(0, p.size * .65, p.size * .4, 0); ctx.quadraticCurveTo(0, p.size * .48, -p.size * .4, 0); ctx.fill();
      }
    }
    ctx.restore();
  }

  function burst(type, count = 520) {
    const bounds = type === "shatter" ? document.querySelector(".file-paper").getBoundingClientRect() : null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    particles = Array.from({ length: reducedMotion ? Math.min(count, 90) : count }, () => {
      const particle = makeParticle(type, bounds);
      if (reducedMotion) { particle.vx *= .24; particle.vy *= .24; particle.life = .55; }
      return particle;
    });
    if (frame) cancelAnimationFrame(frame);
    let previous = performance.now();
    return new Promise(resolve => {
      const tick = now => {
        const dt = Math.min(.035, (now - previous) / 1000);
        previous = now;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        let live = 0;
        for (const p of particles) {
          if (p.age >= p.life) continue;
          live++;
          p.age += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rotation += p.spin * dt;
          p.vx *= p.type === "shatter" ? .997 : .992;
          p.vy += (p.type === "shatter" ? 62 : 22) * dt;
          drawParticle(p);
        }
        if (live) frame = requestAnimationFrame(tick);
        else { frame = 0; ctx.clearRect(0, 0, canvasWidth, canvasHeight); resolve(); }
      };
      frame = requestAnimationFrame(tick);
    });
  }

  function playBirthdayTune() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      const audio = new Audio();
      audio.resume().catch(() => {});
      const notes = [523.25, 523.25, 587.33, 523.25, 698.46, 659.25, 523.25, 523.25, 587.33, 523.25, 783.99, 698.46];
      const start = audio.currentTime + .04;
      notes.forEach((frequency, i) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        const at = start + i * .22;
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(.0001, at);
        gain.gain.exponentialRampToValueAtTime(.085, at + .025);
        gain.gain.exponentialRampToValueAtTime(.0001, at + .19);
        oscillator.connect(gain).connect(audio.destination);
        oscillator.start(at);
        oscillator.stop(at + .2);
      });
      window.setTimeout(() => audio.close().catch(() => {}), 3400);
    } catch (_) { /* Audio is an enhancement; the visual interaction remains complete. */ }
  }

  function show(id) { document.getElementById(id).classList.remove("hidden"); }
  function announce(message) { announcement.textContent = message; }

  document.getElementById("continueButton").addEventListener("click", async event => {
    if (locked) return;
    locked = true;
    event.currentTarget.disabled = true;
    app.classList.add("is-breaking");
    announce("The archive is breaking apart.");
    await burst("shatter", 690);
    app.classList.remove("is-breaking");
    setScene("void");
    await sleep(920);
    document.getElementById("scene-void").classList.add("show-wait");
    announce("Wait...");
    await sleep(1450);
    document.getElementById("scene-void").classList.add("show-one-more");
    announce("I have one more thing for you.");
    await sleep(800);
    document.getElementById("scene-void").classList.add("show-open");
    show("openButton");
    locked = false;
  });

  document.getElementById("openButton").addEventListener("click", async event => {
    if (locked) return;
    locked = true;
    event.currentTarget.disabled = true;
    setScene("promise");
    await sleep(420);
    document.querySelector(".promise-copy").classList.add("is-ready");
    announce("Remember what I promised you? I said I'd phodunga a bomb.");
    await sleep(1050);
    show("countdownButton");
    locked = false;
  });

  document.getElementById("countdownButton").addEventListener("click", async event => {
    if (locked) return;
    locked = true;
    event.currentTarget.disabled = true;
    setScene("countdown");
    const number = document.getElementById("countNumber");
    for (let n = 5; n >= 1; n--) {
      number.textContent = String(n);
      number.classList.remove("pulse");
      void number.offsetWidth;
      number.classList.add("pulse");
      if (n <= 3) { app.classList.remove("is-shaking"); void app.offsetWidth; app.classList.add("is-shaking"); }
      announce(String(n));
      await sleep(n <= 2 ? 650 : 760);
    }
    document.getElementById("blackout").classList.add("is-dark");
    await sleep(420);
    setScene("reveal");
        birthdaySong.currentTime = 0;
        birthdaySong.play().catch(() => {
            console.log("Birthday song playback was blocked.");
        });
    announce("Happy 18th Alui!");
    burst("boom", 430);
    window.setTimeout(() => {
      document.getElementById("scene-reveal").classList.add("is-settling");
      show("cakeButton");
    }, 4100);
    locked = false;
  });

  document.getElementById("cakeButton").addEventListener("click", () => {
    const avatarDuo = document.querySelector(".birthday-duo").cloneNode(true);
    avatarDuo.setAttribute("aria-hidden", "true");
    avatarDuo.querySelectorAll("[aria-label]").forEach(avatar => avatar.removeAttribute("aria-label"));
    document.getElementById("cakeDuo").replaceChildren(avatarDuo);
    setScene("cake");
    announce("Make a wish first.");
  });

  document.getElementById("flameButton").addEventListener("click", event => {
    const cake = document.getElementById("cakeVisual");
    if (cake.classList.contains("is-out")) return;
    cake.classList.add("is-blowing");
    app.classList.add("is-wishing");
    event.currentTarget.disabled = true;
    window.setTimeout(() => {
      cake.classList.add("is-out");
      app.classList.add("is-wish-made");
      playBirthdayTune();
      document.getElementById("cakeInstruction").textContent = "Wish made. Now swipe across the cake to cut it. 🎂";
      show("envelopeButton");
      announce("The candle is out. Swipe across the cake to cut it.");
    }, 430);
  });

  const cake = document.getElementById("cakeVisual");
  const cakeBody = cake.querySelector(".cake-body");
  const cutLine = document.getElementById("cakeCutLine");
  let cutStart = null;
  function cutCake() {
    if (!cake.classList.contains("is-out") || cake.classList.contains("is-cut")) return;
    cake.classList.add("is-cut");
    document.getElementById("envelopeButton").classList.add("hidden");
    document.getElementById("cakeInstruction").textContent = "A little birthday secret was tucked inside…";
    window.setTimeout(() => {
      const note = document.getElementById("cakeNote");
      note.classList.remove("hidden");
      requestAnimationFrame(() => note.classList.add("is-revealed"));
      announce("A little birthday note appeared inside the cake.");
    }, 650);
    window.setTimeout(() => {
      const note = document.getElementById("cakeNote");
      note.classList.remove("is-revealed");
      note.classList.add("is-leaving");
      window.setTimeout(() => {
        note.classList.add("hidden");
        note.classList.remove("is-leaving");
        document.getElementById("envelope").classList.remove("hidden");
        announce("An envelope for Alui appeared inside the cake.");
      }, 420);
    }, 5200);
  }
  document.getElementById("envelopeButton").addEventListener("click", cutCake);
  cake.addEventListener("pointerdown", event => {
    if (!cake.classList.contains("is-out") || cake.classList.contains("is-cut") || event.target.closest("button")) return;
    const rect = cakeBody.getBoundingClientRect();
    if (event.clientX < rect.left - 12 || event.clientX > rect.right + 12 || event.clientY < rect.top || event.clientY > rect.bottom) return;
    cutStart = { id:event.pointerId, x:event.clientX, y:event.clientY };
    try { cake.setPointerCapture(event.pointerId); } catch (_) {}
  });
  cake.addEventListener("pointermove", event => {
    if (!cutStart || cutStart.id !== event.pointerId) return;
    const dx = event.clientX - cutStart.x;
    const cakeRect = cake.getBoundingClientRect();
    cutLine.style.left = `${Math.max(8, Math.min(88, (Math.min(cutStart.x, event.clientX) - cakeRect.left) / cake.clientWidth * 100))}%`;
    cutLine.style.top = `${Math.max(34, Math.min(82, (event.clientY - cake.getBoundingClientRect().top) / cake.clientHeight * 100))}%`;
    cutLine.style.width = `${Math.min(75, Math.abs(dx) / cake.clientWidth * 100)}%`;
    cutLine.style.opacity = ".85";
  });
  cake.addEventListener("pointerup", event => {
    if (!cutStart || cutStart.id !== event.pointerId) return;
    const dx = event.clientX - cutStart.x;
    const dy = Math.abs(event.clientY - cutStart.y);
    cutLine.style.opacity = "0";
    cutStart = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > dy * 1.1) cutCake();
  });
  cake.addEventListener("pointercancel", () => { cutStart = null; cutLine.style.opacity = "0"; });

  let envelopeTeases = 0;
  const envelopeDodge = [
    { x:"-34px", y:"-18px" },
    { x:"32px", y:"14px" },
    { x:"-10px", y:"-30px" }
  ];
  document.getElementById("envelope").addEventListener("click", event => {
    const target = event.currentTarget;
    if (locked || target.classList.contains("is-teasing")) return;
    if (envelopeTeases < envelopeDodge.length) {
      const move = envelopeDodge[envelopeTeases];
      envelopeTeases += 1;
      target.style.setProperty("--dodge-x", move.x);
      target.style.setProperty("--dodge-y", move.y);
      target.classList.remove("is-teasing");
      void target.offsetWidth;
      target.classList.add("is-teasing");
      target.querySelector("small").textContent = envelopeTeases < 3 ? "Hehe—almost! Try again." : "Okay… one last tap!";
      const tapsLeft = envelopeDodge.length + 1 - envelopeTeases;
      target.setAttribute("aria-label", `The envelope dodged. ${tapsLeft} more ${tapsLeft === 1 ? "tap" : "taps"} to open it.`);
      target.addEventListener("animationend", () => target.classList.remove("is-teasing"), { once:true });
      announce(envelopeTeases < 3 ? "The envelope scooted away. Try again." : "One last try to catch the envelope.");
      return;
    }
    locked = true;
    target.classList.remove("is-teasing");
    target.setAttribute("aria-label", "Opening the letter for Alui");
    target.querySelector("small").textContent = "You caught it! ❤️";
    target.classList.add("is-opening");
    announce("Opening the letter.");
    window.setTimeout(() => {
      setScene("letter");
      document.querySelector(".letter-scene").scrollTop = 0;
      announce("A letter for Alui.");
      locked = false;
    }, 720);
  });

  const pandaForLetter = document.querySelector(".panda-avatar").cloneNode(true);
  pandaForLetter.setAttribute("aria-hidden", "true");
  pandaForLetter.querySelectorAll("[aria-label]").forEach(element => element.removeAttribute("aria-label"));
  document.getElementById("letterPanda").append(pandaForLetter);

  const pandaForGuide = document.querySelector(".panda-avatar").cloneNode(true);
  pandaForGuide.setAttribute("aria-hidden", "true");
  pandaForGuide.querySelectorAll("[aria-label]").forEach(element => element.removeAttribute("aria-label"));
  document.getElementById("pandaGuideArt").append(pandaForGuide);

  document.getElementById("openGiftsButton").addEventListener("click", () => {
    setScene("gifts");
    announce("A few birthday gifts for Alui. Choose a box to open it.");
  });

  const pandaForGift = document.querySelector(".panda-avatar").cloneNode(true);
  pandaForGift.setAttribute("aria-hidden", "true");
  pandaForGift.querySelectorAll("[aria-label]").forEach(element => element.removeAttribute("aria-label"));
  document.getElementById("giftPandaPop").append(pandaForGift);

  const duoForEnding = document.querySelector(".birthday-duo").cloneNode(true);
  duoForEnding.setAttribute("aria-hidden", "true");
  duoForEnding.querySelectorAll("[aria-label]").forEach(element => element.removeAttribute("aria-label"));
  document.getElementById("endingDuo").append(duoForEnding);

  document.getElementById("finishBirthdayButton").addEventListener("click", () => {
    setScene("ending");
    announce("Happy 18th, Alui. Always cheering for you.");
  });

  const gifts = {
    snacks: { icon:"♥", kicker:"A SNACK BREAK, OBVIOUSLY", title:"Uncle Chips + chocolates", text:"Your favourite crunchy-and-sweet combo. A tiny treat for the birthday girl." },
    makeup: { icon:"✧", kicker:"A LITTLE GLAM FOR ALUI", title:"Makeup, picked for you", text:"A little compact, lipstick and brush—because you deserve to feel extra lovely." },
    panda: { icon:"🐼", kicker:"PANDA HAS BEEN HIDING…", title:"PANDA POP! Gotcha!", text:"Okay, tiny surprise attack! Your panda wanted to jump out and wish you the happiest birthday. ❤️", panda:true }
  };
  document.querySelectorAll(".gift-box").forEach(box => {
    box.addEventListener("click", () => {
      if (box.classList.contains("is-open")) return;
      box.classList.add("is-open");
      box.setAttribute("aria-expanded", "true");
      const gift = gifts[box.dataset.gift];
      const reveal = document.getElementById("giftReveal");
      reveal.classList.remove("has-panda", "is-surprising");
      reveal.dataset.gift = box.dataset.gift;
      document.getElementById("giftRevealIcon").textContent = gift.icon;
      document.getElementById("giftRevealKicker").textContent = gift.kicker;
      document.getElementById("giftRevealTitle").textContent = gift.title;
      document.getElementById("giftRevealText").textContent = gift.text;
      if (gift.panda) {
        reveal.classList.add("has-panda", "is-surprising");
        announce("Surprise! Panda jumped out with a birthday wish.");
      } else announce(`${gift.title}. ${gift.text}`);
      const openedCount = document.querySelectorAll(".gift-box.is-open").length;
      if (openedCount === Object.keys(gifts).length) document.getElementById("giftFinale").classList.remove("hidden");
    });
  });

  function revealLetterLines() {
    let lineIndex = 0;
    document.querySelectorAll(".letter-paper section p").forEach(paragraph => {
      const fragment = document.createDocumentFragment();
      let line = document.createElement("span");
      line.className = "letter-line";
      const appendLine = force => {
        if (line.textContent.trim() || force) {
          line.style.setProperty("--line-delay", `${Math.min(lineIndex++, 6) * 55}ms`);
          fragment.append(line);
        }
        line = document.createElement("span");
        line.className = "letter-line";
      };
      [...paragraph.childNodes].forEach(node => {
        if (node.nodeName === "BR") {
          appendLine(false);
          fragment.append(document.createElement("br"));
        } else line.append(node.cloneNode(true));
      });
      appendLine(false);
      paragraph.replaceChildren(fragment);
    });

    const letterScene = document.getElementById("scene-letter");
    const revealTargets = [document.querySelector(".letter-paper header"), ...document.querySelectorAll(".letter-paper section")];
    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach(target => target.classList.add("has-appeared"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("has-appeared");
          observer.unobserve(entry.target);
        }
      });
    }, { root:letterScene, threshold:.08, rootMargin:"0px 0px -6% 0px" });
    revealTargets.forEach(target => observer.observe(target));
  }
  revealLetterLines();

  document.getElementById("aluiPhotoInput").addEventListener("change", event => {
    const file = event.currentTarget.files && event.currentTarget.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const preview = document.getElementById("aluiPhotoPreview");
      preview.src = String(reader.result);
      preview.hidden = false;
      document.getElementById("photoPlaceholder").hidden = true;
      document.getElementById("announcement").textContent = "Alui's photo added to the letter.";
    });
    reader.readAsDataURL(file);
  });

  document.getElementById("memoryDate").addEventListener("change", event => {
    const value = event.currentTarget.value;
    document.getElementById("photoCaption").textContent = value
      ? new Intl.DateTimeFormat(undefined, { month:"short", day:"numeric", year:"numeric", timeZone:"UTC" }).format(new Date(`${value}T12:00:00Z`))
      : "A little memory";
  });

  makeStars();
  const enteredFromArchives = new URLSearchParams(window.location.search).get("from") === "archives";
  if (enteredFromArchives) {
    setScene("void");
    const quietScene = document.getElementById("scene-void");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      quietScene.classList.add("show-wait");
      announce("Wait...");
    }, reducedMotion ? 0 : 650);
    window.setTimeout(() => {
      quietScene.classList.add("show-one-more");
      announce("I have one more thing for you.");
    }, reducedMotion ? 260 : 2050);
    window.setTimeout(() => {
      quietScene.classList.add("show-open");
      show("openButton");
      announce("One more birthday surprise is waiting.");
    }, reducedMotion ? 520 : 2850);
  } else {
    setScene("archives");
  }
  musicButton.addEventListener("click", async () => {
        try {
            if (birthdaySong.paused) {
                await birthdaySong.play();
                musicButton.textContent = "♫ Pause Music";
            } else {
                birthdaySong.pause();
                musicButton.textContent = "♫ Play Birthday Music";
            }
        } catch (error) {
            console.log("Could not play birthday music:", error);
        }
    });

    birthdaySong.addEventListener("ended", () => {
        musicButton.textContent = "♫ Play Birthday Music";
    });
})();
