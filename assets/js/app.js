/**
 * Suman Vatika - Redesigned Interactive Application Logic
 * Includes: Cost Calculator, Gallery Lightbox, 2-Step Lead Engine, Date Checker & Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSpacesTabs();
  initGallery();
  initCostCalculator();
  initBookingWizard();
  initModals();
});

/* ==========================================================================
   1. Navigation & Scroll Spy
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('header.site-header');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerLinks = document.querySelectorAll('.drawer-links a');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    mobileDrawer.addEventListener('click', (e) => {
      if (e.target === mobileDrawer) {
        mobileDrawer.classList.remove('open');
      }
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   2. Spaces Tab Switcher (Hall vs Lawn vs Full Estate)
   ========================================================================== */
function initSpacesTabs() {
  const tabBtns = document.querySelectorAll('.space-tab-btn');
  const spaceCards = document.querySelectorAll('.space-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      spaceCards.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = btn.dataset.space;
      const targetCard = document.getElementById(`space-${target}`);
      if (targetCard) {
        targetCard.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. Interactive Gallery & Fullscreen Lightbox
   ========================================================================== */
let currentLightboxIndex = 0;
let filteredGalleryItems = [...GALLERY_ITEMS];

function initGallery() {
  const galleryGrid = document.getElementById('gallery-grid');
  const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn');

  if (!galleryGrid) return;

  function renderGallery(items) {
    galleryGrid.innerHTML = '';
    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy" />
        <div class="gallery-overlay">
          <span>${item.categoryLabel} • ${item.capacity}</span>
          <h4>${item.title}</h4>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(index));
      galleryGrid.appendChild(card);
    });
  }

  // Initial render
  renderGallery(filteredGalleryItems);

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      if (filter === 'all') {
        filteredGalleryItems = [...GALLERY_ITEMS];
      } else {
        filteredGalleryItems = GALLERY_ITEMS.filter(it => it.category === filter);
      }
      renderGallery(filteredGalleryItems);
    });
  });

  // Lightbox controls
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  if (lightboxPrev && lightboxNext) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      changeLightbox(-1);
    });
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      changeLightbox(1);
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') changeLightbox(-1);
    if (e.key === 'ArrowRight') changeLightbox(1);
    if (e.key === 'Escape') closeModal('lightbox-modal');
  });
}

function openLightbox(index) {
  currentLightboxIndex = index;
  updateLightboxContent();
  openModal('lightbox-modal');
}

function changeLightbox(step) {
  currentLightboxIndex += step;
  if (currentLightboxIndex < 0) {
    currentLightboxIndex = filteredGalleryItems.length - 1;
  } else if (currentLightboxIndex >= filteredGalleryItems.length) {
    currentLightboxIndex = 0;
  }
  updateLightboxContent();
}

function updateLightboxContent() {
  const item = filteredGalleryItems[currentLightboxIndex];
  if (!item) return;

  const imgEl = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const capEl = document.getElementById('lightbox-desc');

  if (imgEl) imgEl.src = item.image;
  if (titleEl) titleEl.textContent = item.title;
  if (capEl) capEl.textContent = `${item.categoryLabel} — ${item.caption}`;
}

/* ==========================================================================
   4. Interactive Wedding Cost Calculator
   ========================================================================== */
function initCostCalculator() {
  const guestSlider = document.getElementById('calc-guests');
  const guestDisplay = document.getElementById('calc-guest-display');
  const spaceOptions = document.querySelectorAll('.calc-space-opt');
  const menuOptions = document.querySelectorAll('.calc-menu-opt');
  const addonCheckboxes = document.querySelectorAll('.calc-addon-check');

  if (!guestSlider) return;

  let state = {
    guests: parseInt(guestSlider.value, 10) || 300,
    space: 'both', // hall, lawn, both
    spaceCost: 280000,
    spaceLabel: 'Both Hall & Lawn (Exclusive)',
    menuPerPlate: 1200,
    menuLabel: 'Royal Multi-Cuisine',
    addons: []
  };

  const spaceRates = {
    hall: { cost: 150000, label: 'Indoor AC Banquet Hall' },
    lawn: { cost: 180000, label: 'Starlight Open Lawn' },
    both: { cost: 280000, label: 'Both Hall & Lawn (Exclusive)' }
  };

  const menuRates = {
    standard: { rate: 850, label: 'Standard Feast' },
    royal: { rate: 1200, label: 'Royal Multi-Cuisine' },
    palace: { rate: 1650, label: 'Palace Grand Buffet' }
  };

  function updateCalculation() {
    state.guests = parseInt(guestSlider.value, 10);
    guestDisplay.textContent = `${state.guests} Guests`;

    const cateringTotal = state.guests * state.menuPerPlate;
    let addonsTotal = 0;
    state.addons = [];

    addonCheckboxes.forEach(cb => {
      if (cb.checked) {
        const cost = parseInt(cb.dataset.cost, 10);
        addonsTotal += cost;
        state.addons.push({ name: cb.dataset.name, cost });
      }
    });

    const totalEstimate = state.spaceCost + cateringTotal + addonsTotal;

    // Update DOM
    document.getElementById('summary-guests').textContent = `${state.guests} Guests`;
    document.getElementById('summary-space').textContent = state.spaceLabel;
    document.getElementById('summary-catering').textContent = `${state.menuLabel} (₹${state.menuPerPlate}/pax)`;
    document.getElementById('summary-addons').textContent = `₹${addonsTotal.toLocaleString('en-IN')}`;
    document.getElementById('summary-total-price').textContent = `₹${totalEstimate.toLocaleString('en-IN')}`;
  }

  guestSlider.addEventListener('input', updateCalculation);

  spaceOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      spaceOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const val = opt.dataset.space;
      state.space = val;
      state.spaceCost = spaceRates[val].cost;
      state.spaceLabel = spaceRates[val].label;
      updateCalculation();
    });
  });

  menuOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      menuOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const val = opt.dataset.menu;
      state.menuPerPlate = menuRates[val].rate;
      state.menuLabel = menuRates[val].label;
      updateCalculation();
    });
  });

  addonCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateCalculation);
  });

  // Lock estimate to WhatsApp
  const lockBtn = document.getElementById('calc-whatsapp-btn');
  if (lockBtn) {
    lockBtn.addEventListener('click', () => {
      const total = document.getElementById('summary-total-price').textContent;
      const text = `Namaste Suman Vatika Team,\n\nI just calculated an estimate on your website:\n` +
        `• Guest Count: ${state.guests}\n` +
        `• Venue Space: ${state.spaceLabel}\n` +
        `• Catering: ${state.menuLabel} (₹${state.menuPerPlate}/pax)\n` +
        `• Estimated Budget: ${total}\n\n` +
        `Could you please share your availability and a detailed proposal for our dates?`;

      window.open(`https://wa.me/919839074240?text=${encodeURIComponent(text)}`, '_blank');
      showToast('Redirecting to WhatsApp with your customized estimate...', 'info');
    });
  }

  // Initial calculation
  updateCalculation();
}

/* ==========================================================================
   5. Two-Step Smart Booking Wizard
   ========================================================================== */
function initBookingWizard() {
  const form = document.getElementById('booking-form');
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const nextBtn = document.getElementById('btn-step-next');
  const prevBtn = document.getElementById('btn-step-prev');
  const bubble1 = document.getElementById('step-bubble-1');
  const bubble2 = document.getElementById('step-bubble-2');

  if (!form) return;

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      // Validate Step 1
      const date = document.getElementById('book-date').value;
      const type = document.getElementById('book-type').value;

      if (!date) {
        showToast('Please select your preferred event date.', 'error');
        return;
      }

      step1.classList.remove('active');
      step2.classList.add('active');
      bubble1.classList.remove('active');
      bubble2.classList.add('active');
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      step2.classList.remove('active');
      step1.classList.add('active');
      bubble2.classList.remove('active');
      bubble1.classList.add('active');
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('book-name').value.trim();
    const phone = document.getElementById('book-phone').value.trim();
    const email = document.getElementById('book-email').value.trim();
    const date = document.getElementById('book-date').value;
    const type = document.getElementById('book-type').value;
    const space = document.getElementById('book-space').value;
    const guests = document.getElementById('book-guests').value;
    const msg = document.getElementById('book-msg').value.trim();

    if (!name || !phone) {
      showToast('Please provide your name and phone number.', 'error');
      return;
    }

    const leadData = {
      id: 'SV-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      name,
      phone,
      email,
      eventDate: date,
      eventType: type,
      spacePreference: space,
      guestCount: guests,
      notes: msg
    };

    // 1. Save locally so lead is NEVER lost
    try {
      const existingLeads = JSON.parse(localStorage.getItem('suman_vatika_leads') || '[]');
      existingLeads.push(leadData);
      localStorage.setItem('suman_vatika_leads', JSON.stringify(existingLeads));
    } catch (err) {
      console.warn('Storage error', err);
    }

    // 2. Dispatch to local backend API if available
    try {
      fetch('/api/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      }).catch(() => {});
    } catch (_) {}

    // 3. Show Success Modal
    document.getElementById('lead-ref-id').textContent = leadData.id;
    openModal('success-modal');

    // 4. Construct WhatsApp Message Link
    const waText = `*Wedding Enquiry — Suman Vatika*\n` +
      `*Ref ID:* ${leadData.id}\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Event Date:* ${date}\n` +
      `*Event Type:* ${type}\n` +
      `*Preferred Space:* ${space}\n` +
      `*Guest Count:* ${guests}\n` +
      (msg ? `*Message:* ${msg}` : '');

    const waUrl = `https://wa.me/919839074240?text=${encodeURIComponent(waText)}`;
    
    // Provide direct WhatsApp connect button inside the success modal
    const waConnectBtn = document.getElementById('modal-wa-btn');
    if (waConnectBtn) {
      waConnectBtn.onclick = () => window.open(waUrl, '_blank');
    }

    form.reset();
    showToast('Enquiry recorded successfully! Reference: ' + leadData.id, 'success');
  });
}

/* ==========================================================================
   6. Modals & Helpers
   ========================================================================== */
function initModals() {
  // Modal triggers
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal-open');
      openModal(modalId);
    });
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) modal.classList.remove('open');
    });
  });

  // Click backdrop to close
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });

  // Quick Hero Availability Form
  const heroAvailForm = document.getElementById('hero-avail-form');
  if (heroAvailForm) {
    heroAvailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const date = document.getElementById('hero-date').value;
      const type = document.getElementById('hero-type').value;
      const guests = document.getElementById('hero-guests').value;

      // Prefill booking form
      if (document.getElementById('book-date')) document.getElementById('book-date').value = date;
      if (document.getElementById('book-type')) document.getElementById('book-type').value = type;
      if (document.getElementById('book-guests')) document.getElementById('book-guests').value = guests;

      // Scroll to booking or open date modal
      const bookSec = document.getElementById('booking');
      if (bookSec) {
        bookSec.scrollIntoView({ behavior: 'smooth' });
        showToast('Dates prefilled! Complete step 2 to lock your slot.', 'info');
      }
    });
  }

  // Admin Login mock
  const adminForm = document.getElementById('admin-login-form');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value;
      showToast(`Welcome back ${email}! Redirecting to management dashboard...`, 'success');
      setTimeout(() => {
        closeModal('admin-modal');
      }, 1200);
    });
  }
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

/* ==========================================================================
   7. Toast Notification Engine
   ========================================================================== */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = '🔔';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
