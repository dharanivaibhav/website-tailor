/**
 * Dharani Women's Tailors - Main Interactive Script
 */

function initTailorApp() {
  // --- 1. Sticky Header & Active Nav Scroll Spy ---
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    // Header shadow on scroll
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll spy for navigation highlighting
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = sectionId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // --- 2. Mobile Navigation Toggle ---
  const mainNav = document.getElementById('main-nav') || document.querySelector('nav');

  if (mobileToggle) {
    const closeMobileMenu = () => {
      if (mainNav) mainNav.classList.remove('active');
      if (navMenu) navMenu.classList.remove('active');
      if (header) header.classList.remove('menu-open');
      mobileToggle.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
    };

    const openMobileMenu = () => {
      if (mainNav) mainNav.classList.add('active');
      if (navMenu) navMenu.classList.add('active');
      if (header) header.classList.add('menu-open');
      mobileToggle.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
    };

    // Ensure initial closed state on load
    closeMobileMenu();

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true' ||
                     (mainNav && mainNav.classList.contains('active')) ||
                     (navMenu && navMenu.classList.contains('active'));
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close mobile menu when clicking any navigation link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close mobile menu when clicking outside header or nav panel
    document.addEventListener('click', (e) => {
      const isMenuOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      if (isMenuOpen) {
        const inHeader = header && header.contains(e.target);
        const inNav = mainNav && mainNav.contains(e.target);
        if (!inHeader && !inNav) {
          closeMobileMenu();
        }
      }
    });

    // Close mobile menu on resize to desktop view
    window.addEventListener('resize', () => {
      if (window.innerWidth > 868) {
        closeMobileMenu();
      }
    });

    // Close mobile menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  // --- 3. Set Minimum Date for Appointment Picker ---
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;
  }

  // --- 4. Service Selection Button Handler ---
  const selectServiceBtns = document.querySelectorAll('.select-service-btn');
  const serviceSelect = document.getElementById('service');

  selectServiceBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const serviceName = btn.getAttribute('data-service');
      if (serviceSelect && serviceName) {
        serviceSelect.value = serviceName;
      }
    });
  });

  // --- 5. Gallery Filter Functionality ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // --- 6. Lightbox Modal Viewer ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src') || item.querySelector('img').src;
      const title = item.getAttribute('data-title') || 'Dharani Women\'s Tailors Gallery';

      lightboxImg.src = src;
      lightboxCaption.textContent = title;
      lightbox.classList.add('active');
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
      }
    });
  }

  // --- 7. Form Validation & Submission ---
  const appointmentForm = document.getElementById('appointment-form');
  const successModal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalSummary = document.getElementById('modal-summary');
  const sendWhatsappConfirm = document.getElementById('send-whatsapp-confirm');

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Inputs
      const nameInput = document.getElementById('name');
      const phoneInput = document.getElementById('phone');
      const serviceInput = document.getElementById('service');
      const dateValInput = document.getElementById('date');
      const timeInput = document.getElementById('time');
      const notesInput = document.getElementById('notes');

      // Validate Name
      if (!nameInput.value.trim()) {
        showError('group-name');
        isValid = false;
      } else {
        clearError('group-name');
      }

      // Validate Phone (Basic Indian 10-digit regex or min 10 digits)
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = phoneInput.value.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        showError('group-phone');
        isValid = false;
      } else {
        clearError('group-phone');
      }

      // Validate Service
      if (!serviceInput.value) {
        showError('group-service');
        isValid = false;
      } else {
        clearError('group-service');
      }

      // Validate Date
      if (!dateValInput.value) {
        showError('group-date');
        isValid = false;
      } else {
        clearError('group-date');
      }

      // Validate Time
      if (!timeInput.value) {
        showError('group-time');
        isValid = false;
      } else {
        clearError('group-time');
      }

      if (isValid) {
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const service = serviceInput.value;
        const date = dateValInput.value;
        const time = timeInput.value;
        const notes = notesInput.value.trim() || 'None';

        const submitBtn = appointmentForm.querySelector('button[type="submit"]');
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Saving Booking...';
        }

        // Send appointment to backend API
        fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, service, date, time, notes })
        })
        .then(res => res.json())
        .then(result => {
          const bookingCode = result && result.booking ? result.booking.booking_code : 'DHT-' + Math.floor(1000 + Math.random() * 9000);

          // Render modal summary with booking code
          modalSummary.innerHTML = `
            <div style="background: #F6E6EB; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;">
              <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #7A2745; font-weight: 600;">Booking Reference</span>
              <div style="font-size: 1.4rem; font-weight: 700; color: #9E3B5E; letter-spacing: 1px;">${bookingCode}</div>
            </div>
            <div><strong>Client Name:</strong> <span>${escapeHtml(name)}</span></div>
            <div><strong>Phone:</strong> <span>${escapeHtml(phone)}</span></div>
            <div><strong>Service:</strong> <span>${escapeHtml(service)}</span></div>
            <div><strong>Date & Time:</strong> <span>${escapeHtml(date)} (${escapeHtml(time)})</span></div>
            ${notes !== 'None' ? `<div><strong>Notes:</strong> <span>${escapeHtml(notes)}</span></div>` : ''}
          `;

          // Format WhatsApp Message with Booking Reference
          const waText = encodeURIComponent(
            `*New Appointment Request - Dharani Tailors*\n` +
            `*Booking Ref:* ${bookingCode}\n` +
            `*Name:* ${name}\n` +
            `*Phone:* ${phone}\n` +
            `*Service:* ${service}\n` +
            `*Date:* ${date}\n` +
            `*Time:* ${time}\n` +
            `*Notes:* ${notes}`
          );

          sendWhatsappConfirm.href = `https://wa.me/919876543210?text=${waText}`;

          // Show Modal
          successModal.classList.add('active');

          // Reset Form
          appointmentForm.reset();
          const today = new Date().toISOString().split('T')[0];
          dateInput.value = today;
        })
        .catch(err => {
          console.warn('Backend unavailable, proceeding with local confirmation:', err);
          // Fallback if backend offline
          modalSummary.innerHTML = `
            <div><strong>Client Name:</strong> <span>${escapeHtml(name)}</span></div>
            <div><strong>Phone:</strong> <span>${escapeHtml(phone)}</span></div>
            <div><strong>Service:</strong> <span>${escapeHtml(service)}</span></div>
            <div><strong>Date & Time:</strong> <span>${escapeHtml(date)} (${escapeHtml(time)})</span></div>
            ${notes !== 'None' ? `<div><strong>Notes:</strong> <span>${escapeHtml(notes)}</span></div>` : ''}
          `;

          const waText = encodeURIComponent(
            `*New Appointment Request - Dharani Tailors*\n` +
            `*Name:* ${name}\n` +
            `*Phone:* ${phone}\n` +
            `*Service:* ${service}\n` +
            `*Date:* ${date}\n` +
            `*Time:* ${time}\n` +
            `*Notes:* ${notes}`
          );
          sendWhatsappConfirm.href = `https://wa.me/919876543210?text=${waText}`;
          successModal.classList.add('active');
          appointmentForm.reset();
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        });
      }
    });
  }

  function showError(groupId) {
    const group = document.getElementById(groupId);
    if (group) group.classList.add('error');
  }

  function clearError(groupId) {
    const group = document.getElementById(groupId);
    if (group) group.classList.remove('error');
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
    });
  }

  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('active');
      }
    });
  }
}

// Ensure execution even if DOMContentLoaded has already fired in Android WebView
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTailorApp);
} else {
  initTailorApp();
}
