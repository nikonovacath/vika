// Scroll nav border
const nav = document.getElementById('nav');
const navBurger = document.getElementById('nav-burger');
const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

function syncBodyScrollLock() {
  const isPopupOpen = popupOverlay.classList.contains('open');
  const isMobileMenuOpen = nav.classList.contains('mobile-open');
  document.body.style.overflow = (isPopupOpen || isMobileMenuOpen) ? 'hidden' : '';
}

function openMobileMenu() {
  nav.classList.add('mobile-open');
  navBurger.setAttribute('aria-expanded', 'true');
  syncBodyScrollLock();
}

function closeMobileMenu() {
  nav.classList.remove('mobile-open');
  navBurger.setAttribute('aria-expanded', 'false');
  syncBodyScrollLock();
}

navBurger.addEventListener('click', () => {
  if (nav.classList.contains('mobile-open')) {
    closeMobileMenu();
    return;
  }
  openMobileMenu();
});

mobileNavBackdrop.addEventListener('click', closeMobileMenu);
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => closeMobileMenu());
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 1080) closeMobileMenu();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});

// Popup
const popupOverlay = document.getElementById('popup');
const popupForm = document.getElementById('popup-form');
const popupSuccess = document.getElementById('popup-success');
const nameInput = document.getElementById('field-name');
const contactField = document.getElementById('contact-field');
const contactInput = document.getElementById('field-contact');
const topicInput = document.getElementById('field-topic');
const consentInput = document.getElementById('field-consent');
const popupSubmitButton = document.getElementById('popup-submit');
const defaultContactMethod = 'telegram';

function setContactMethod(method) {
  document.querySelectorAll('.popup-toggle').forEach(t => {
    t.classList.toggle('active', t.dataset.value === method);
  });
  contactField.style.display = 'block';
  contactInput.placeholder = method === 'phone' ? 'Номер телефона' : '@username или номер телефона';
}

function resetPopupFormState() {
  setContactMethod(defaultContactMethod);
  if (consentInput) consentInput.checked = false;
  clearPopupErrors();
}

function setFieldError(input) {
  const field = input.closest('.popup-field');
  if (field) field.classList.add('has-error');
}

function clearFieldError(input) {
  const field = input.closest('.popup-field');
  if (field) field.classList.remove('has-error');
}

function clearPopupErrors() {
  [nameInput, contactInput, consentInput].forEach(input => {
    if (input) clearFieldError(input);
  });
}

function getActiveContactMethod() {
  const activeToggle = document.querySelector('.popup-toggle.active');
  return activeToggle ? activeToggle.dataset.value : defaultContactMethod;
}

function openPopup() {
  resetPopupFormState();
  popupOverlay.classList.add('open');
  closeMobileMenu();
  syncBodyScrollLock();
}

function closePopup() {
  popupOverlay.classList.remove('open');
  syncBodyScrollLock();
  setTimeout(() => {
    popupForm.style.display = '';
    popupSuccess.style.display = 'none';
    resetPopupFormState();
  }, 300);
}

document.querySelectorAll('.open-popup').forEach(btn => {
  btn.addEventListener('click', e => { e.preventDefault(); openPopup(); });
});

document.getElementById('popup-close').addEventListener('click', closePopup);
document.getElementById('popup-ok').addEventListener('click', closePopup);
popupOverlay.addEventListener('click', e => { if (e.target === popupOverlay) closePopup(); });

document.querySelectorAll('.popup-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    setContactMethod(btn.dataset.value);
    clearFieldError(contactInput);
  });
});

resetPopupFormState();

nameInput.addEventListener('input', () => clearFieldError(nameInput));
contactInput.addEventListener('input', () => clearFieldError(contactInput));
if (consentInput) {
  consentInput.addEventListener('change', () => clearFieldError(consentInput));
}

popupSubmitButton.addEventListener('click', async () => {
  const isNameEmpty = !nameInput.value.trim();
  const isContactEmpty = !contactInput.value.trim();
  const isConsentMissing = !consentInput || !consentInput.checked;

  if (isNameEmpty) setFieldError(nameInput);
  else clearFieldError(nameInput);

  if (isContactEmpty) setFieldError(contactInput);
  else clearFieldError(contactInput);

  if (isConsentMissing) setFieldError(consentInput);
  else clearFieldError(consentInput);

  if (isNameEmpty || isContactEmpty || isConsentMissing) return;

  const originalButtonText = popupSubmitButton.textContent;
  popupSubmitButton.disabled = true;
  popupSubmitButton.textContent = 'Отправляем...';

  try {
    const response = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        contact: contactInput.value.trim(),
        topic: topicInput ? topicInput.value.trim() : '',
        contactMethod: getActiveContactMethod(),
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok !== true) {
      throw new Error('Request failed');
    }

    popupForm.style.display = 'none';
    popupSuccess.style.display = 'block';
  } catch (error) {
    alert('Не удалось отправить заявку. Попробуйте ещё раз.');
  } finally {
    popupSubmitButton.disabled = false;
    popupSubmitButton.textContent = originalButtonText;
  }
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Testimonials
const testimonialsSection = document.getElementById('testimonials');
const testimonialsMore = document.querySelector('.testimonials-more');

if (testimonialsSection && testimonialsMore) {
  testimonialsMore.addEventListener('click', () => {
    const isExpanded = testimonialsSection.classList.toggle('testimonials-expanded');
    testimonialsMore.textContent = isExpanded ? 'Скрыть' : 'Показать ещё';
    testimonialsMore.setAttribute('aria-expanded', String(isExpanded));
  });
}

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));
