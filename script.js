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
// Effetto "accensione" — solo per #missioneText.
// Il colore di ogni parola passa da grigio spento ad accento
// lime in base allo scroll (non a un timer): più scrolli
// veloce, più le parole si accendono in fretta. L'ordine è
// sequenziale (parola per parola, da sinistra a destra).
// Una volta completato, resta fisso: non torna indietro
// nemmeno risalendo con lo scroll.
// =========================================================
(function igniteTextEffect() {
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

  const words = originalText.split(' ');
  const wordNodes = [];

  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'ignite-word';
    span.textContent = word;
    wordNodes.push(span);
    visual.appendChild(span);
    if (i < words.length - 1) {
      visual.appendChild(document.createTextNode(' '));
    }
  });

  el.textContent = '';
  el.appendChild(srSpan);
  el.appendChild(visual);

  // Colori di partenza e arrivo: devono coincidere con
  // --gray (#8A8A8A) e --accent (#C6FF3D) definiti in style.css
  const FROM = [138, 138, 138];
  const TO = [198, 255, 61];

  let locked = false;
  let ticking = false;
  let scrollStartY = null;

  // REQUIRED_SCROLL_PX = quanti pixel di scroll servono, da
  // quando il blocco entra nello schermo, perché l'effetto si
  // completi del tutto. Valore più alto = tutta la sequenza
  // più lenta a completarsi.
  const REQUIRED_SCROLL_PX = 550;

  // WORD_SPAN = quanta parte del progresso totale usa ogni
  // singola parola per sfumare dal grigio al lime (0 a 1).
  // Valore più alto = ogni parola sfuma più lentamente e le
  // parole vicine si sovrappongono di più (movimento più
  // percepibile). Valore basso = ogni parola scatta di colore
  // quasi di colpo, anche se il totale dura a lungo.
  const WORD_SPAN = 0.4;

  function overallProgress() {
    const rect = el.getBoundingClientRect();

    if (scrollStartY === null) {
      if (rect.top > window.innerHeight) return 0;
      scrollStartY = window.scrollY;
    }

    const raw = (window.scrollY - scrollStartY) / REQUIRED_SCROLL_PX;
    return Math.min(Math.max(raw, 0), 1);
  }

  function render() {
    ticking = false;
    if (locked) return;

    const progress = overallProgress();
    const N = wordNodes.length;

    wordNodes.forEach((node, i) => {
      const start = (i / N) * (1 - WORD_SPAN);
      const local = Math.min(Math.max((progress - start) / WORD_SPAN, 0), 1);
      const r = Math.round(FROM[0] + (TO[0] - FROM[0]) * local);
      const g = Math.round(FROM[1] + (TO[1] - FROM[1]) * local);
      const b = Math.round(FROM[2] + (TO[2] - FROM[2]) * local);
      node.style.color = `rgb(${r}, ${g}, ${b})`;
    });

    if (progress >= 1) lockInPlace();
  }

  function lockInPlace() {
    locked = true;
    wordNodes.forEach((node) => {
      node.style.color = `rgb(${TO[0]}, ${TO[1]}, ${TO[2]})`;
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

// =========================================================
// Effetto mosaico Hero — griglia 5x4 di tessere, ognuna una
// porzione della stessa foto. Al cambio, le tessere si
// aggiornano a cascata (partendo dall'angolo in alto a
// sinistra), non tutte insieme. Nessuna maschera SVG.
// =========================================================
(function heroMosaicEffect() {
  const mosaic = document.getElementById('heroMosaic');
  if (!mosaic) return;

  const photos = [
    'images/bici.jpg',
    'images/calibro.jpg',
    'images/cucire.jpg',
    'images/legna.jpg',
    'images/pc.jpg',
  ];

  const COLS = 5, ROWS = 4;
  const tiles = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = document.createElement('span');
      tile.style.backgroundSize = `${COLS * 100}% ${ROWS * 100}%`;
      tile.style.backgroundPosition = `${(c / (COLS - 1)) * 100}% ${(r / (ROWS - 1)) * 100}%`;
      tile.style.backgroundImage = `url(${photos[0]})`;
      mosaic.appendChild(tile);
      tiles.push({ el: tile, col: c, row: r });
    }
  }

  let current = 0;
  const HOLD_MS = 2600;

  function cascadeTo(nextIdx) {
    const nextPhoto = photos[nextIdx];
    tiles.forEach((tile) => {
      const delay = (tile.col + tile.row) * 60;
      setTimeout(() => {
        tile.el.style.backgroundImage = `url(${nextPhoto})`;
      }, delay);
    });
    current = nextIdx;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    setInterval(() => {
      cascadeTo((current + 1) % photos.length);
    }, HOLD_MS);
  }
})();