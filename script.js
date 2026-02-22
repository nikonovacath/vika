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
  if (window.innerWidth > 900) closeMobileMenu();
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
const popupSubmitButton = document.getElementById('popup-submit');
const defaultContactMethod = 'telegram';

function setContactMethod(method) {
  document.querySelectorAll('.popup-toggle').forEach(t => {
    t.classList.toggle('active', t.dataset.value === method);
  });
  contactField.style.display = 'block';
  contactInput.placeholder = method === 'phone' ? 'Номер телефона' : '@username';
}

function resetPopupFormState() {
  setContactMethod(defaultContactMethod);
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
  [nameInput, contactInput].forEach(input => clearFieldError(input));
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

popupSubmitButton.addEventListener('click', () => {
  const isNameEmpty = !nameInput.value.trim();
  const isContactEmpty = !contactInput.value.trim();

  if (isNameEmpty) setFieldError(nameInput);
  else clearFieldError(nameInput);

  if (isContactEmpty) setFieldError(contactInput);
  else clearFieldError(contactInput);

  if (isNameEmpty || isContactEmpty) return;

  popupForm.style.display = 'none';
  popupSuccess.style.display = 'block';
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
