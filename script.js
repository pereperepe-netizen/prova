// =========================================================
// ISOLA FORMATIVA — script.js
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Anno corrente nel footer ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Menu mobile ----------
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Chiude il menu quando si clicca un link
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Animazioni leggere on-scroll ----------
  const revealTargets = document.querySelectorAll(
    '.section .container > *, .path-block, .story-card, .resource-item, .mission-block'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => observer.observe(el));

  // ---------- Form contatti ----------
  // GitHub Pages non esegue codice lato server: qui validiamo i campi
  // e prepariamo un'email pronta da inviare tramite il client di posta
  // dell'utente. Per un invio diretto senza aprire il client di posta,
  // si può collegare un servizio esterno gratuito come Formspree
  // (https://formspree.io) sostituendo l'azione del form.
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !email || !message) {
        formNote.textContent = 'Compila tutti i campi prima di inviare.';
        formNote.style.color = '#b3462c';
        return;
      }

      const subject = encodeURIComponent(`Messaggio da ${name} — Isola Formativa`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:info@isolaformativa.it?subject=${subject}&body=${body}`;

      formNote.textContent = 'Si sta aprendo il tuo client di posta con il messaggio pronto.';
      formNote.style.color = '';
    });
  }

});

// =========================================================
// Effetto "ricomposizione" — solo per #missioneText.
// Il movimento è agganciato allo scroll (non a un timer):
// più scrolli veloce, più le lettere convergono veloci.
// Ogni lettera ha una soglia casuale d'ingresso e arriva
// da sinistra o destra con una rotazione 3D su asse casuale.
// Una volta completato (testo al centro schermo), resta
// fisso: non torna indietro nemmeno risalendo con lo scroll.
// =========================================================
(function shatterTextEffect() {
  const el = document.getElementById('missioneText');
  if (!el) return;

  // Chi preferisce meno animazioni vede subito il testo normale
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const originalText = el.textContent.trim();

  // Versione leggibile per screen reader (il testo vero, invariato)
  const srSpan = document.createElement('span');
  srSpan.className = 'sr-only';
  srSpan.textContent = originalText;

  // Versione visiva animata, marcata come decorativa
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');

  const letters = [];
  const words = originalText.split(' ');
  const axes = [
    [1, 0, 0],   // asse orizzontale
    [0, 1, 0],   // asse verticale
    [1, 1, 0],   // diagonale \
    [1, -1, 0],  // diagonale /
  ];

  words.forEach((word, wIndex) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'shatter-word';

    word.split('').forEach((char) => {
      const letterSpan = document.createElement('span');
      letterSpan.className = 'shatter-letter';
      letterSpan.textContent = char;

      // Punto di partenza sparso su tutta l'area visibile, non solo
      // a lato del testo: sia lo scarto orizzontale che quello
      // verticale sono proporzionati all'intero schermo.
      const tx = (Math.random() * 2 - 1) * (window.innerWidth * 0.65);
      const ty = (Math.random() * 2 - 1) * (window.innerHeight * 0.6);

      letters.push({
        node: letterSpan,
        tx,
        ty,
        axis: axes[Math.floor(Math.random() * axes.length)],
        angle: 70 + Math.random() * 190,
        start: Math.random() * 0.7,            // soglia casuale: NON legata all'ordine nella frase
        range: 0.2 + Math.random() * 0.25,
      });

      wordSpan.appendChild(letterSpan);
    });

    visual.appendChild(wordSpan);
    if (wIndex < words.length - 1) {
      visual.appendChild(document.createTextNode(' '));
    }
  });

  el.textContent = '';
  el.appendChild(srSpan);
  el.appendChild(visual);

  let locked = false;
  let ticking = false;

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  // 0 = blocco non ancora arrivato, 1 = animazione completata.
  // REQUIRED_SCROLL_PX = quanti pixel devi scrollare, da quando il
  // blocco entra nello schermo, perché l'effetto si completi.
  // Valore più alto = effetto più lento. Numero fisso, indipendente
  // dalla posizione della sezione nella pagina.
  const REQUIRED_SCROLL_PX = 1400;

  let scrollStartY = null; // impostato al primo istante in cui il blocco entra in vista

  function overallProgress() {
    const rect = el.getBoundingClientRect();

    if (scrollStartY === null) {
      if (rect.top > window.innerHeight) return 0; // non ancora entrato in viewport
      scrollStartY = window.scrollY; // fissa il punto di partenza, una sola volta
    }

    const raw = (window.scrollY - scrollStartY) / REQUIRED_SCROLL_PX;
    return Math.min(Math.max(raw, 0), 1);
  }

  function render() {
    ticking = false;
    if (locked) return;

    const progress = overallProgress();

    letters.forEach((L) => {
      const localProgress = Math.min(Math.max((progress - L.start) / L.range, 0), 1);
      const eased = easeOutCubic(localProgress);
      const tx = L.tx * (1 - eased);
      const ty = L.ty * (1 - eased);
      const angle = L.angle * (1 - eased);

      L.node.style.transform =
        `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotate3d(${L.axis[0]}, ${L.axis[1]}, ${L.axis[2]}, ${angle.toFixed(1)}deg)`;
      L.node.style.opacity = localProgress < 0.04 ? '0' : '1';
    });

    if (progress >= 1) lockInPlace();
  }

  function lockInPlace() {
    locked = true;
    letters.forEach((L) => {
      L.node.style.transform = 'none';
      L.node.style.opacity = '1';
    });
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  }

  function onScroll() {
    if (locked || ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();