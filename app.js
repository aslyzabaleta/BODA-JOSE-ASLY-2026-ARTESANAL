/* INVITACIÓN 2 — Jose & Asly. Fecha: 26-12-2026.
   El lector controla cuándo continúa tras contemplar la fotografía.
   Cuenta regresiva hasta el comienzo del día civil en Colombia:
   NO representa una hora de ceremonia todavía desconocida. */
(() => {
  "use strict";
  const openButton = document.getElementById("openInvitation");
  const envelope = document.getElementById("envelope");
  const chapters = document.getElementById("chapters");
  const hint = document.getElementById("openHint");
  const audio = document.getElementById("weddingAudio");
  const musicButton = document.getElementById("musicToggle");
  const musicLabel = musicButton?.querySelector(".music-text");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Time in Bogotá: 2026-12-26 at 00:00, not the ceremony time. */
  const weddingMidnight = Date.UTC(2026, 11, 26, 5, 0, 0);
  const counters = {
    days: document.getElementById("dayCount"),
    hours: document.getElementById("hourCount"),
    minutes: document.getElementById("minuteCount"),
    seconds: document.getElementById("secondCount")
  };
  const pad = value => String(value).padStart(2,"0");

  function updateCountdown() {
    const remainingSeconds = Math.max(0,Math.floor((weddingMidnight - Date.now())/1000));
    const vals = {
      days: Math.floor(remainingSeconds/86400),
      hours: Math.floor((remainingSeconds%86400)/3600),
      minutes: Math.floor((remainingSeconds%3600)/60),
      seconds: remainingSeconds%60
    };
    if(counters.days) counters.days.textContent = String(vals.days);
    if(counters.hours) counters.hours.textContent = pad(vals.hours);
    if(counters.minutes) counters.minutes.textContent = pad(vals.minutes);
    if(counters.seconds) counters.seconds.textContent = pad(vals.seconds);
  }
  updateCountdown();
  window.setInterval(updateCountdown,1000);

  async function startMusic() {
    if(!audio) return;
    if(audio.readyState===0) audio.load();
    try {
      if(audio.readyState>=1) {
        try {if(audio.currentTime<1 && audio.duration>93) audio.currentTime=92;}catch{}
      } else {
        audio.addEventListener("loadedmetadata",()=>{
          try {if(audio.currentTime<1 && audio.duration>93) audio.currentTime=92;}catch{}
        },{once:true});
      }
      await audio.play();
      musicButton?.setAttribute("aria-pressed","true");
      if(musicLabel) musicLabel.textContent="Pausar música";
    } catch {
      musicButton?.setAttribute("aria-pressed","false");
      if(musicLabel) musicLabel.textContent="Activar música";
    }
  }

  let coverOpened = false;
  function goToIntro(){
    if(!chapters) return;
    chapters.hidden=false;
    openButton?.setAttribute("aria-expanded","true");
    document.getElementById("presentacion")?.scrollIntoView({
      behavior:reducedMotion?"instant":"smooth",block:"start"
    });
  }
  if(openButton && envelope && chapters){
    openButton.addEventListener("click",()=>{
      if(coverOpened){
        goToIntro();
        return;
      }
      coverOpened=true;
      envelope.classList.add("is-open");
      openButton.disabled=true;
      openButton.classList.add("is-waiting");
      openButton.innerHTML='<span>UNA HISTORIA QUE CONTINÚA…</span><span aria-hidden="true">♡</span>';
      if(hint)hint.textContent="Tómate tu tiempo para disfrutar nuestra fotografía.";
      void startMusic();

      /* Crucial: NO automatic scrolling after 1.45 seconds.
         Instead wait for envelope motion, then invite a SECOND voluntary click.
         The photo stays visible for as long as the guest desires. */
      window.setTimeout(()=>{
        openButton.disabled=false;
        openButton.classList.remove("is-waiting");
        openButton.classList.add("is-ready");
        openButton.innerHTML='<span>CONTINUAR CON NUESTRA HISTORIA</span><span aria-hidden="true">↓</span>';
        if(hint)hint.textContent="Cuando quieras, desliza hacia nuestro siguiente capítulo.";
      }, reducedMotion?0:1400);
    });
  }

  musicButton?.addEventListener("click",async()=>{
    if(!audio) return;
    if(!audio.paused){
      audio.pause();
      musicButton.setAttribute("aria-pressed","false");
      if(musicLabel)musicLabel.textContent="Activar música";
    }else{
      await startMusic();
    }
  });
  if(audio && musicButton){
    audio.addEventListener("ended",()=>{
      musicButton.setAttribute("aria-pressed","false");
      if(musicLabel)musicLabel.textContent="Volver a escuchar";
    });
    audio.addEventListener("error",()=>{
      musicButton.setAttribute("aria-pressed","false");
      if(musicLabel)musicLabel.textContent="Música no disponible";
    });
  }
  /* Keep the opening intentional, even if a guest pastes a deep link. */
  if(location.hash && location.hash!=="#portada"){
    history.replaceState(null,"",location.pathname+location.search);
  }
})();