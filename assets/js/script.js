"use strict";

/* ────────────────────────────────────────────────────────── */
/* 1) URL Hash Reset on Load                                 */
/* ────────────────────────────────────────────────────────── */
if (window.location.hash) {
  history.replaceState(null, document.title, window.location.pathname + window.location.search);
  window.scrollTo(0, 0);
}

/* ────────────────────────────────────────────────────────── */
/* 2) Smooth Scroll for Anchor Links                          */
/* ────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const targetID = anchor.getAttribute("href");
    const targetEl = document.querySelector(targetID);
    if (!targetEl) return;
    e.preventDefault();

    document.querySelector("[data-navbar].active")?.classList.remove("active");
    document.querySelector("[data-overlay].active")?.classList.remove("active");
    document.body.classList.remove("nav-active");

    targetEl.scrollIntoView({ behavior: "smooth" });
    history.pushState(null, document.title, targetID);
  });
});

function setupGoTopButton() {
  const goTopBtn = document.querySelector("[data-go-top]");
  const header = document.querySelector("[data-header]");

  if (!goTopBtn || !header) return;

  window.addEventListener("scroll", () => {
    const active = window.scrollY >= 200;
    header.classList.toggle("active", active);
    goTopBtn.classList.toggle("active", active);
  });

  goTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setupTabSwitching() {
  document.querySelectorAll('.inquire-tabs .inquire-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.inquire-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.inquire-form-tab').forEach(tab => tab.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab + '-form').classList.add('active');
    });
  });
}

function setupMoreDropdown() {
  const moreBtn = document.getElementById('moreDropdownBtn');
  const moreDropdown = document.getElementById('moreDropdown');

  if (!moreBtn || !moreDropdown) return;

  moreBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    moreDropdown.classList.toggle('open');
    moreBtn.setAttribute('aria-expanded', moreDropdown.classList.contains('open'));
  });

  document.addEventListener('click', function() {
    if (moreDropdown.classList.contains('open')) {
      moreDropdown.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('#moreDropdownMenu a').forEach(link => {
    link.addEventListener('click', function() {
      moreDropdown.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

function setupMobileNavbar() {
  const overlay = document.querySelector('.overlay') || document.querySelector('[data-overlay]');
  const navOpenBtn = document.querySelector('[data-nav-open-btn]');
  const navCloseBtn = document.querySelector('[data-nav-close-btn]');
  const navbar = document.querySelector('[data-navbar]');

  if (!(navOpenBtn && navCloseBtn && navbar && overlay)) return;

  function openNav() {
    navbar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    navbar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  navOpenBtn.addEventListener('click', openNav);
  navCloseBtn.addEventListener('click', closeNav);
  overlay.addEventListener('click', closeNav);

  document.querySelectorAll('.navbar-link').forEach(link => {
    link.addEventListener('click', closeNav);
  });
}

function setupNewsletterForm() {
  const form = document.getElementById("newsletter-form");
  const emailInput = document.getElementById("newsletter-email");
  const submitBtn = document.getElementById("newsletter-submit");
  const errorSpan = document.getElementById("newsletter-error");

  if (!form || !emailInput || !submitBtn || !errorSpan) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorSpan.classList.remove("active");

    if (!emailInput.checkValidity()) {
      if (emailInput.validity.valueMissing) {
        errorSpan.textContent = "Email is required.";
      } else if (emailInput.validity.typeMismatch) {
        errorSpan.textContent = "Please enter a valid email address.";
      }
      errorSpan.classList.add("active");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Subscribing…";

    try {
      await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
      });

      const dlg = document.createElement("div");
      dlg.className = "submission-dialog";
      dlg.innerHTML = `
        <div class="dialog-content">
          <ion-icon name="checkmark-circle-outline"></ion-icon>
          <h2>Thank You!</h2>
          <p>You’ve been subscribed to our newsletter.</p>
          <button id="dialog-ok">OK</button>
        </div>`;
      document.body.appendChild(dlg);

      dlg.querySelector("#dialog-ok").addEventListener("click", () => dlg.remove());

      form.reset();
      submitBtn.textContent = "Subscribe";
    } catch {
      errorSpan.textContent = "Subscription failed. Please try again.";
      errorSpan.classList.add("active");
      submitBtn.disabled = false;
      submitBtn.textContent = "Subscribe";
    }
  });
}

function setupFormSubmissions() {
  ['visa-form','flights-form'].forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;
    const btn  = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      form.querySelectorAll('input').forEach(i => i.classList.remove('error'));
      form.querySelectorAll('.error-message').forEach(em => em.style.display = 'none');

      btn.disabled = true;
      const origText = btn.textContent;
      btn.textContent = 'Submitting...';

      let valid = true;
      form.querySelectorAll('input[required]').forEach(i => {
        if (!i.checkValidity()) {
          valid = false;
          i.classList.add('error');
          i.closest('.inquire-field-group')?.querySelector('.error-message')?.style?.setProperty('display', 'block');
        }
      });

      if (!valid) {
        btn.disabled = false;
        btn.textContent = origText;
        return;
      }

      try {
        await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          mode: 'no-cors'
        });
        showSubmissionDialog();
        form.reset();
      } catch {
        alert('❌ Submission failed. Please try again.');
      }

      btn.disabled = false;
      btn.textContent = origText;
    });
  });
}

function showSubmissionDialog() {
  const d = document.createElement('div');
  d.className = 'submission-dialog';
  d.innerHTML = `
    <div class="dialog-content">
      <ion-icon name="checkmark-circle-outline"></ion-icon>
      <h2>Thank You!</h2>
      <p>Your inquiry has been submitted.<br/>We will contact you shortly.</p>
      <button id="dialog-ok">OK</button>
    </div>`;
  document.body.appendChild(d);
  d.querySelector('#dialog-ok').addEventListener('click', () => d.remove());
}

function closePopup() {
  const popup = document.getElementById("call-deal-popup");
  if (popup) popup.style.display = "none";
}

function loadPopupPartial() {
  const container = document.getElementById("popup-container");
  if (!container) return;
  fetch("./assets/partials/popup.html")
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;
      setTimeout(() => {
        const popup = document.getElementById("call-deal-popup");
        if (popup) popup.style.display = "flex";

        const closeBtn = popup.querySelector(".close-popup");
        if (closeBtn) {
          closeBtn.addEventListener("click", () => {
            closePopup();
          });
        }
      }, 1000);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  setupGoTopButton();
  setupMobileNavbar();
  setupMoreDropdown();
  setupTabSwitching();
  setupFormSubmissions();
  setupNewsletterForm();
  loadPopupPartial();
});