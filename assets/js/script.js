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
  const tabsContainer = document.querySelector('.inquire-tabs');
  if (!tabsContainer) return;

  // 1) Create the indicator element
  const indicator = document.createElement('div');
  indicator.className = 'tab-indicator';
  tabsContainer.appendChild(indicator);

  // 2) Grab all the buttons
  const buttons = tabsContainer.querySelectorAll('.inquire-tab-btn');

  // 3) Function to reposition the indicator under a given button
  function updateIndicator(btn) {
    const btnRect    = btn.getBoundingClientRect();
    const parentRect = tabsContainer.getBoundingClientRect();
    const left       = btnRect.left - parentRect.left;
    indicator.style.width = `${btnRect.width}px`;
    indicator.style.left  = `${left}px`;
  }

  // 4) Wire up clicks
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // toggle active classes (your existing logic)
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.inquire-form-tab').forEach(tab => tab.classList.remove('active'));
      document.getElementById(btn.dataset.tab + '-form').classList.add('active');

      // slide the indicator
      updateIndicator(btn);
    });
  });

  // 5) Position the indicator under whichever is active on load
  const initial = tabsContainer.querySelector('.inquire-tab-btn.active') || buttons[0];
  updateIndicator(initial);
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
  const currentPage = window.location.pathname.split("/").pop();

  // Skip popup on specific pages
  const excludedPages = ["getvisanow.html", "inquire-us.html"];
  if (excludedPages.includes(currentPage)) return;

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

function setupSectionReveal() {
  const reveals = document.querySelectorAll('.reveal-section');
  if (!('IntersectionObserver' in window)) {
    // Fallback: just show all if not supported
    reveals.forEach(sec => sec.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, {
    threshold: 0.13   // about 13% visible triggers
  });

  reveals.forEach(sec => observer.observe(sec));
}

// HOLIDAY SERVICES SCROLLER
function setupHolidaySlider() {
  const holidayScrollContainer = document.getElementById("holidayCards");
  const prevBtn = document.querySelector(".holiday-prev");
  const nextBtn = document.querySelector(".holiday-next");

  if (!holidayScrollContainer || !prevBtn || !nextBtn) return;

  prevBtn.addEventListener("click", () => {
    holidayScrollContainer.scrollBy({ left: -350, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    holidayScrollContainer.scrollBy({ left: 350, behavior: "smooth" });
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
  setupSectionReveal();
  setupHolidaySlider();
});

