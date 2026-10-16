(() => {
    const queryArrival = new URLSearchParams(window.location.search).get("arrival") === "vortex";
    const returnButton = document.getElementById("archivesReturnButton");
    const returnToStoryKey = "aluiArchivesReturnToStory";
    if (queryArrival) {
        try { sessionStorage.setItem(returnToStoryKey, "true"); } catch (_) { /* Storage may be unavailable in private browsing. */ }
    }
    returnButton?.addEventListener("click", () => {
        let cameFromStory = queryArrival;
        try { cameFromStory ||= sessionStorage.getItem(returnToStoryKey) === "true"; } catch (_) { /* Fall back to the landing page. */ }
        try { sessionStorage.removeItem(returnToStoryKey); } catch (_) { /* Navigation still works without storage. */ }
        if (cameFromStory) window.history.back();
        else window.location.assign(new URL("../index.html", document.baseURI).href);
    });
    if (!queryArrival) return;
    document.documentElement.classList.add("archives-vortex-arrival");
    requestAnimationFrame(() => {
        const animatedElements = [
            document.querySelector(".archives-environment"),
            document.querySelector(".archive-stage > .archive-paper"),
            document.querySelector(".archives-viewer-heading"),
            document.querySelector(".archive-controls")
        ].filter(Boolean);
        const arrivalAnimations = animatedElements.flatMap(element => element.getAnimations());
        Promise.all(arrivalAnimations.map(animation => animation.finished.catch(() => {}))).then(() => {
            document.documentElement.classList.remove("archives-vortex-arrival");
        });
    });
    const url = new URL(window.location.href);
    url.searchParams.delete("arrival");
    window.history.replaceState(null, "", url.href);
})();
