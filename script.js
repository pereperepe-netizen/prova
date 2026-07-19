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
// Funzione autonoma: non tocca menu, reveal generico o form.
// =========================================================
(function shatterTextEffect() {
  const el = document.getElementById('missioneText');
  if (!el) return;

  const originalText = el.textContent.trim();

  // Versione leggibile per screen reader (il testo vero, invariato)
  const srSpan = document.createElement('span');
  srSpan.className = 'sr-only';
  srSpan.textContent = originalText;

  // Versione visiva animata, marcata come decorativa
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');

  const words = originalText.split(' ');
  let letterIndex = 0;

  words.forEach((word, wIndex) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'shatter-word';

    word.split('').forEach((char) => {
      const letterSpan = document.createElement('span');
      letterSpan.className = 'shatter-letter';
      letterSpan.textContent = char;

      // Posizione iniziale casuale ma contenuta: frammenti, non caos
      const tx = (Math.random() * 60 - 30).toFixed(1) + 'px';   // -30px .. 30px
      const ty = (Math.random() * -50 - 10).toFixed(1) + 'px';  // -60px .. -10px (dall'alto, senso di "risalita")
      const r  = (Math.random() * 24 - 12).toFixed(1) + 'deg';  // -12deg .. 12deg
      const delay = Math.min(letterIndex * 0.014, 0.9).toFixed(3) + 's';

      letterSpan.style.setProperty('--tx', tx);
      letterSpan.style.setProperty('--ty', ty);
      letterSpan.style.setProperty('--r', r);
      letterSpan.style.setProperty('--d', delay);

      wordSpan.appendChild(letterSpan);
      letterIndex++;
    });

    visual.appendChild(wordSpan);
    if (wIndex < words.length - 1) {
      visual.appendChild(document.createTextNode(' '));
    }
  });

  el.textContent = '';
  el.appendChild(srSpan);
  el.appendChild(visual);

  // Trigger allo scroll: parte quando il blocco entra nel viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(el);
})();
