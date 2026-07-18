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
    '.section .container > *, .path-card, .story-card, .resource-item, .mission-card'
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
