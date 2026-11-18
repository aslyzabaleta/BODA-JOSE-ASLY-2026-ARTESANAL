/* INVITACIÓN 2 · Jose & Asly · 26/12/2026
   Papelería viva, transiciones discretas y portada que avanza sola.
   La cuenta regresiva toma el inicio del 26/12 en Bogotá como referencia,
   NO anuncia una hora de ceremonia que todavía no se ha comunicado. */
(() => {
  "use strict";
  const cover=document.getElementById("portada");
  const envelope=document.getElementById("envelope");
  const letter=envelope?.querySelector(".env-letter");
  const button=document.getElementById("openInvitation");
  const chapters=document.getElementById("chapters");
  const hint=document.getElementById("openHint");
  const audio=document.getElementById("weddingAudio");
  const musicButton=document.getElementById("musicToggle");
  const musicLabel=musicButton?.querySelector(".music-text");
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* El evento es 26 de diciembre de 2026, calendario de Colombia. */
  const target=Date.UTC(2026,11,26,5,0,0);
  const digits=n=>String(n).padStart(2,"0");
  const count={
    d:document.getElementById("dayCount"),
    h:document.getElementById("hourCount"),
    m:document.getElementById("minuteCount"),
    s:document.getElementById("secondCount")
  };
  function refreshCountdown(){
    const total=Math.max(0,Math.floor((target-Date.now())/1000));
    if(count.d)count.d.textContent=String(Math.floor(total/86400));
    if(count.h)count.h.textContent=digits(Math.floor(total%86400/3600));
    if(count.m)count.m.textContent=digits(Math.floor(total%3600/60));
    if(count.s)count.s.textContent=digits(total%60);
  }
  refreshCountdown();
  window.setInterval(refreshCountdown,1000);

  /* Mismo comportamiento musical que la Invitación 1:
     Amor y Sentimiento desde 1:32 al abrir, con pausa/reanudación y repetición. */
  const musicStart=92;
  function seekMusicStart(){
    if(!audio || audio.readyState<1)return;
    const target=Number.isFinite(audio.duration)
      ? Math.min(musicStart,Math.max(0,audio.duration-.25)) : musicStart;
    if(Math.abs(audio.currentTime-target)<.15)return;
    try{audio.currentTime=target;}catch(err){
      console.warn("No se pudo establecer el inicio musical:",err);
    }
  }
  if(audio){
    audio.preload="metadata";
    audio.addEventListener("loadedmetadata",seekMusicStart);
    audio.load();
  }
  function setMusicButton(){
    if(!audio)return;
    const playing=!audio.paused;
    musicButton?.setAttribute("aria-pressed",String(playing));
    musicButton?.setAttribute("aria-label",playing?"Pausar música":"Reproducir música");
    if(musicLabel)musicLabel.textContent=playing?"Pausar música":"Reproducir música";
  }
  function playMusic(){
    if(!audio)return;
    seekMusicStart();
    audio.play().then(setMusicButton).catch(()=>{
      setMusicButton();
      console.warn("El navegador requiere pulsar Reproducir música para activar el audio.");
    });
  }

  /* Revelar por desplazamiento, sin alterar las posiciones de papeles y fotos. */
  function enableMotion(){
    if(reduced || !("IntersectionObserver" in window))return;
    const targets=document.querySelectorAll(
      "#chapters .paper, #chapters .polaroid, #chapters .place-note, "+
      "#chapters .scripture-composition, #chapters .dress-plaque, "+
      "#chapters .gift-envelope, #chapters .finale-content, "+
      "#chapters .cayena, #chapters .round-medallion"
    );
    targets.forEach((el,i)=>{
      el.classList.add("motion-piece");
      el.style.setProperty("--motion-delay",String((i%3)*90)+"ms");
    });
    document.body.classList.add("motion-ready");
    const watcher=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          watcher.unobserve(entry.target);
        }
      }
    },{threshold:.08,rootMargin:"0px 0px 65px 0px"});
    targets.forEach(el=>watcher.observe(el));
  }

  /* Primero sale la carta; luego el invitado la mira 3 segundos completos;
     finalmente se desliza automáticamente a Lo nuestro sigue floreciendo. */
  let opened=false;
  if(button&&cover&&envelope&&chapters){
    button.addEventListener("click",()=>{
      if(opened)return;
      opened=true;
      chapters.hidden=false;
      enableMotion();
      button.disabled=true;
      button.setAttribute("aria-expanded","true");
      envelope.classList.add("is-open");
      cover.classList.add("is-photo-open");
      if(hint)hint.textContent="El día de nuestro sí";
      void playMusic();

      let scheduled=false;
      const scheduleAdvance=()=>{
        if(scheduled)return;
        scheduled=true;
        window.setTimeout(()=>{
          /* Evitar interrumpir a quien ya haya avanzado manualmente. */
          if(window.scrollY>Math.max(200,cover.offsetHeight*.75))return;
          document.getElementById("presentacion")?.scrollIntoView({
            behavior:reduced?"instant":"smooth",block:"start"
          });
        },3000);
      };
      if(!reduced&&letter){
        letter.addEventListener("transitionend",event=>{
          if(event.propertyName==="transform")scheduleAdvance();
        });
        window.setTimeout(scheduleAdvance,1600);
      }else{
        window.setTimeout(scheduleAdvance,0);
      }
    },{once:true});
  }

  musicButton?.addEventListener("click",()=>{
    if(!audio)return;
    if(audio.paused){
      if(audio.ended)seekMusicStart();
      playMusic();
    }else{
      audio.pause();
      setMusicButton();
    }
  });
  audio?.addEventListener("ended",()=>{
    seekMusicStart();
    audio.play().then(setMusicButton).catch(setMusicButton);
  });
  audio?.addEventListener("error",()=>{
    setMusicButton();
    console.warn("No se pudo cargar la canción de la Invitación 1.");
  });

  /* Enlaces profundos no deben saltarse la apertura del sobre. */
  if(location.hash&&location.hash!=="#portada"){
    history.replaceState(null,"",location.pathname+location.search);
  }
})();