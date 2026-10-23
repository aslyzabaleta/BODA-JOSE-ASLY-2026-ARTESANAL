/* Invitación 2 — interacciones originales y accesibles.
   Fecha del evento: 26 diciembre 2026, independiente de cualquier otra fecha.
   No promete RSVP ni fotografías que aún no han sido aprobadas. */
(() => {
  "use strict";
  const button = document.getElementById("openInvitation");
  const envelope = document.getElementById("envelope");
  const chapters = document.getElementById("chapters");
  const hint = document.getElementById("openHint");
  const audio = document.getElementById("weddingAudio");
  const musicButton = document.getElementById("musicToggle");
  const musicLabel = musicButton?.querySelector(".music-text");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const oldButtonContent = button?.innerHTML ?? "";

  const pad = n => String(n).padStart(2, "0");
  const daysNode = document.getElementById("dayCount");
  function updateDays() {
    const now = new Date();
    const localDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Bogota",
      year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(now);
    const map = Object.fromEntries(localDate.map(p => [p.type, p.value]));
    const currentCalendarDate = Date.UTC(Number(map.year), Number(map.month)-1, Number(map.day));
    const weddingCalendarDate = Date.UTC(2026, 11, 26);
    const daysLeft = Math.max(0, Math.round((weddingCalendarDate - currentCalendarDate) / 86400000));
    if (daysNode) daysNode.textContent = String(daysLeft);
  }
  updateDays();
  /* Recalculate on tab re-entry, but do not use aggressive timers. */
  document.addEventListener("visibilitychange", () => { if (!document.hidden) updateDays(); });

  let opened = false;
  async function startMusic() {
    if (!audio) return;
    if (audio.readyState === 0) audio.load();
    try {
      if (audio.currentTime < 1) audio.currentTime = 92;
      await audio.play();
      if (musicButton) musicButton.setAttribute("aria-pressed", "true");
      if (musicLabel) musicLabel.textContent = "Pausar música";
    } catch {
      if (musicLabel) musicLabel.textContent = "Activar música";
      if (musicButton) musicButton.setAttribute("aria-pressed", "false");
    }
  }

  if (button && envelope && chapters) {
    button.addEventListener("click", () => {
      if (opened) {
        document.getElementById("presentacion")?.scrollIntoView({behavior:reducedMotion ? "instant":"smooth",block:"start"});
        return;
      }
      opened = true;
      chapters.hidden = false;
      envelope.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      button.innerHTML = '<span>DESCUBRIR NUESTRA HISTORIA</span><span aria-hidden="true">↓</span>';
      if (hint) hint.textContent = "El comienzo de nuestro para siempre";
      startMusic();
      /* Transition ends before we scroll; no abrupt PDF-like page swap. */
      window.setTimeout(() => document.getElementById("presentacion")?.scrollIntoView({
        behavior: reducedMotion ? "instant" : "smooth", block: "start"
      }), reducedMotion ? 120 : 1450);
    });
  }

  musicButton?.addEventListener("click", async () => {
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      musicButton.setAttribute("aria-pressed", "false");
      if (musicLabel) musicLabel.textContent = "Activar música";
    } else {
      await startMusic();
    }
  });

  if (audio && musicButton) {
    audio.addEventListener("ended", () => {
      musicButton.setAttribute("aria-pressed", "false");
      if (musicLabel) musicLabel.textContent = "Volver a escuchar";
    });
    audio.addEventListener("error", () => {
      musicButton.setAttribute("aria-pressed", "false");
      if (musicLabel) musicLabel.textContent = "Música no disponible";
    });
  }

  /* Deep links into unpublished sections should not bypass the envelope:
     users open an invitation, rather than landing on a blank paragraph. */
  if (window.location.hash && window.location.hash !== "#portada") {
    history.replaceState(null,"",window.location.pathname+window.location.search);
  }
})();