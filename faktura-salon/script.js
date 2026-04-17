// ============================================================
//  Webhook URL (production)
// ============================================================
const WEBHOOK_URL = 'https://primary-production-f7ad.up.railway.app/webhook/764e3ba2-d92d-4b23-a7de-aa8f9ed1b696';

function announceFormStatus(message) {
  const el = document.getElementById('form-status-announcer');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}

// ============================================================
//  Mobile Burger Menu
// ============================================================
function initBurgerMenu() {
  const btn   = document.getElementById('burger-btn');
  const menu  = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  let isOpen = false;
  let lastFocused = null;

  const getFocusable = () =>
    [...menu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')];

  const open = () => {
    isOpen = true;
    lastFocused = document.activeElement;

    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Закрыть меню');
    menu.classList.add('is-open');
    document.body.classList.add('menu-open');

    requestAnimationFrame(() => {
      const first = getFocusable()[0];
      if (first) first.focus();
    });
  };

  const close = () => {
    isOpen = false;

    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Открыть меню');
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');

    if (lastFocused) lastFocused.focus();
  };

  btn.addEventListener('click', () => (isOpen ? close() : open()));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

  menu.addEventListener('click', (e) => {
    if (e.target === menu) close();
  });

  menu.querySelectorAll('.mobile-menu__link, .mobile-menu__cta').forEach((link) => {
    link.addEventListener('click', () => {
      close();
    });
  });

  menu.addEventListener('keydown', (e) => {
    if (!isOpen || e.key !== 'Tab') return;
    const focusable = getFocusable();
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

// ============================================================
// Mini Booking Form
// ============================================================
function initMiniBookingForm() {
  const form = document.getElementById('mini-booking-form');
  if (!form) return;

  const feedback = document.getElementById('mini-form-feedback');
  const setFeedback = (message, kind) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.remove('hidden', 'text-brand', 'text-red-400/90');
    if (kind === 'success') {
      feedback.classList.add('text-brand');
    } else if (kind === 'error') {
      feedback.classList.add('text-red-400/90');
    }
  };
  const clearFeedback = () => {
    if (!feedback) return;
    feedback.textContent = '';
    feedback.classList.add('hidden');
    feedback.classList.remove('text-brand', 'text-red-400/90');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name  = document.getElementById('mini-name').value.trim();
    const phone = document.getElementById('mini-phone').value.trim();

    const btnSubmit = form.querySelector('button[type="submit"]');
    const btnText   = document.getElementById('mini-btn-text');
    const btnLoader = document.getElementById('mini-btn-loader');

    clearFeedback();
    btnSubmit.disabled = true;
    btnText.textContent = 'ОТПРАВКА...';
    if (btnLoader) btnLoader.classList.remove('hidden');

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Webhook error: ${response.status}`);
      }

      btnText.textContent = 'ЗАЯВКА ПРИНЯТА';
      setFeedback('Спасибо! Заявка принята — администратор свяжется с вами в ближайшее время.', 'success');
      announceFormStatus('Заявка принята. Администратор свяжется с вами в течение 10 минут.');
      form.reset();

      setTimeout(() => {
        btnText.textContent = 'Записаться';
      }, 3000);

    } catch (error) {
      console.error('Ошибка отправки мини-формы:', error);
      btnText.textContent = 'ОШИБКА — ПОВТОРИТЕ';
      setFeedback('Не удалось отправить заявку. Проверьте сеть и попробуйте снова.', 'error');
      announceFormStatus('Ошибка отправки. Проверьте сеть и попробуйте снова.');
      setTimeout(() => {
        btnText.textContent = 'Записаться';
      }, 3000);
    } finally {
      btnSubmit.disabled = false;
      if (btnLoader) btnLoader.classList.add('hidden');
    }
  });
}

// ============================================================
// Calculator Contact Form
// ============================================================
function initCalcContactForm() {
  const form = document.getElementById('calc-contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = document.getElementById('calc-name').value.trim();
    const phone   = document.getElementById('calc-phone').value.trim();
    const service = document.getElementById('calc-service')
      ? document.getElementById('calc-service').options[document.getElementById('calc-service').selectedIndex].text
      : '';
    const price   = document.getElementById('calc-result')
      ? document.getElementById('calc-result').innerText
      : '';

    const btnSubmit = form.querySelector('button[type="submit"]');
    const originalText = btnSubmit.querySelector('span').textContent;

    btnSubmit.disabled = true;
    btnSubmit.querySelector('span').textContent = 'ОТПРАВКА...';

    try {
      const payload = new URLSearchParams({
        source: 'calculator',
        name,
        phone,
        service,
        estimated_price: price
      });

      const response = await fetch(WEBHOOK_URL, { method: 'POST', body: payload });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Webhook error: ${response.status}`);
      }

      btnSubmit.querySelector('span').textContent = 'ЦЕНА ЗАФИКСИРОВАНА';
      announceFormStatus('Заявка с расчётом цены отправлена. Мы свяжемся с вами.');
      form.reset();

      setTimeout(() => {
        btnSubmit.querySelector('span').textContent = originalText;
      }, 3000);

    } catch (error) {
      console.error('Ошибка отправки формы калькулятора:', error);
      btnSubmit.querySelector('span').textContent = 'ОШИБКА — ПОВТОРИТЕ';
      announceFormStatus('Ошибка отправки. Проверьте сеть и попробуйте снова.');
      setTimeout(() => {
        btnSubmit.querySelector('span').textContent = originalText;
      }, 3000);
    } finally {
      btnSubmit.disabled = false;
    }
  });
}

// ============================================================
// Quiz Logic (CRO-optimized)
// ============================================================
function initQuiz() {
  const steps = document.querySelectorAll('.quiz-step');
  const btnPrev = document.getElementById('quiz-btn-prev');
  const progressContainer = document.getElementById('quiz-progress-container');
  const progressBar = document.getElementById('quiz-progress-bar');
  const stepCounter = document.getElementById('quiz-step-counter');
  const leadForm = document.getElementById('quiz-lead-form');

  if (!steps.length) return;

  // Answers keyed to match data-question attributes in the HTML
  const answers = {
    pain: null,
    length: null,
    priority: null,
    name: null,
    phone: null
  };

  const totalSteps = 4;
  let currentStep = 1;

  const updateUI = () => {
    if (currentStep >= 1 && currentStep <= totalSteps) {
      progressContainer.classList.remove('hidden');
      stepCounter.textContent = `Шаг ${currentStep} из ${totalSteps}`;
      progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
    } else {
      progressContainer.classList.add('hidden');
    }

    if (currentStep > 1 && currentStep <= totalSteps) {
      btnPrev.classList.remove('invisible');
    } else {
      btnPrev.classList.add('invisible');
    }

    steps.forEach(step => {
      step.classList.remove('active');
      let stepVal = step.dataset.step;
      if (stepVal == currentStep || (currentStep > totalSteps && stepVal === 'result')) {
        step.classList.add('active');
        step.style.animation = 'none';
        step.offsetHeight;
        step.style.animation = null;
      }
    });
  };

  const answerBtns = document.querySelectorAll('.quiz-answer');
  answerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.dataset.question;
      const value = btn.dataset.value;

      answers[question] = value;

      const currentStepBtns = btn.closest('.quiz-step').querySelectorAll('.quiz-answer');
      currentStepBtns.forEach(b => {
        b.style.borderColor = 'rgba(18,18,18,0.1)';
        b.style.backgroundColor = 'rgba(255,255,255,0.2)';
      });
      btn.style.borderColor = '#121212';
      btn.style.backgroundColor = 'transparent';

      setTimeout(() => {
        currentStep++;
        updateUI();
      }, 350);
    });
  });

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateUI();
      }
    });
  }

  const generateResult = () => {
    const resStyle   = document.getElementById('quiz-res-style');
    const resService = document.getElementById('quiz-res-service');
    const resMaster  = document.getElementById('quiz-res-master');

    // Branch on pain point (question 1: data-question="pain")
    if (answers.pain === 'gray' || answers.pain === 'dull') {
      resStyle.textContent = 'Авторское окрашивание';
      resMaster.textContent = 'Топ-стилист Саша Эхова';
      if (answers.priority === 'expressive') {
        resService.textContent = 'Сложное окрашивание + Тонирование';
      } else {
        resService.textContent = 'Окрашивание в один тон + Интенсивный уход';
      }
    } else if (answers.pain === 'volume') {
      resStyle.textContent = 'Лёгкость и объём';
      resMaster.textContent = 'Арт-директор Наташа Яковлева';
      if (answers.length === 'short') {
        resService.textContent = 'Авторская стрижка + Пилинг кожи головы';
      } else {
        resService.textContent = 'Архитектурная стрижка + Укладка Медиум';
      }
    } else {
      // other / general
      resStyle.textContent = 'Архитектурная классика';
      resMaster.textContent = 'Топ-стилист Алина Лопухова';
      if (answers.length === 'short') {
        resService.textContent = 'Авторская стрижка + Уход К18';
      } else {
        resService.textContent = 'Архитектурная стрижка + Индивидуальный уход';
      }
    }
  };

  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      answers.name  = document.getElementById('quiz-name').value;
      answers.phone = document.getElementById('quiz-phone').value;

      const submitBtn = document.getElementById('quiz-submit-btn');
      const btnText   = document.getElementById('quiz-btn-text');
      const btnLoader = document.getElementById('quiz-btn-loader');

      submitBtn.disabled = true;
      btnText.textContent = 'Отправка...';
      btnLoader.classList.remove('hidden');

      try {
        const payload = new URLSearchParams();
        payload.set('source', 'quiz');
        Object.entries(answers).forEach(([key, value]) => {
          if (value != null) payload.set(key, value);
        });

        const response = await fetch(WEBHOOK_URL, { method: 'POST', body: payload });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Webhook error: ${response.status}`);
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        generateResult();
        currentStep++;
        updateUI();
        announceFormStatus('Рекомендация по квизу отправлена. Администратор свяжется с вами.');

      } catch (error) {
        console.error('Ошибка отправки формы:', error);
        announceFormStatus('Ошибка отправки заявки. Пожалуйста, попробуйте ещё раз.');
      } finally {
        submitBtn.disabled = false;
        btnText.textContent = 'Получить рекомендацию';
        btnLoader.classList.add('hidden');
      }
    });
  }

  updateUI();
}

// ============================================================
// Price Store
// ============================================================
const PRICES_DATA = {
  services: [
    { id: 'haircut_w',        name: 'Женская стрижка',              type: 'master', prices: { master: 3600, stylist: 4000, expert: 4500, top: 5000, art: 10000 } },
    { id: 'haircut_m',        name: 'Мужская стрижка',              type: 'master', prices: { master: 3100, stylist: 3500, expert: 4000, top: 4500 } },
    { id: 'haircut_bangs',    name: 'Стрижка челки',                type: 'master', prices: { master: 1300, stylist: 1500, expert: 2000, top: 2500, art: 3000 } },
    { id: 'styling_light',    name: 'Укладка Легкая',               type: 'master', prices: { master: 2600, stylist: 2800, expert: 3200, top: 3800 } },
    { id: 'styling_medium',   name: 'Укладка Медиум',               type: 'master', prices: { master: 3100, stylist: 3400, expert: 3800, top: 4300 } },
    { id: 'coloring_basic',   name: 'Окрашивание (1 тон)',          type: 'from',   price: 5500 },
    { id: 'coloring_complex_25', name: 'Сложное окрашивание (до 25%)', type: 'from', price: 7000 },
    { id: 'coloring_complex_50', name: 'Сложное окрашивание (до 50%)', type: 'from', price: 9000 },
    { id: 'coloring_total',   name: 'Тотал блонд',                  type: 'from',   price: 9000 },
    { id: 'care_peeling',     name: 'Пилинг кожи головы',           type: 'fixed',  price: 5000 },
    { id: 'lamination',       name: 'Ламинирование SEBASTIAN',      type: 'length', prices: { medium: 15000, long: 20000 } },
    { id: 'makeup_express',   name: 'Экспресс-макияж',              type: 'fixed',  price: 3000 },
    { id: 'makeup_day',       name: 'Дневной макияж',               type: 'fixed',  price: 4000 }
  ],
  masters: {
    master:  'Мастер',
    stylist: 'Стилист',
    expert:  'Эксперт',
    top:     'Топ-стилист',
    art:     'Арт-директор'
  },
  lengths: {
    medium: 'Средняя',
    long:   'Длинная'
  }
};

function initCalculator() {
  const serviceSelect   = document.getElementById('calc-service');
  const masterSelect    = document.getElementById('calc-master');
  const lengthContainer = document.getElementById('calc-length-container');

  if (!serviceSelect || !masterSelect || !lengthContainer) return;

  serviceSelect.innerHTML = PRICES_DATA.services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  masterSelect.innerHTML  = Object.entries(PRICES_DATA.masters).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');

  lengthContainer.innerHTML = Object.entries(PRICES_DATA.lengths).map(([k, v], i) => `
    <label class="flex-1 text-center py-4 border border-white/5 cursor-pointer hover:bg-white/[0.02] rounded-custom has-[:checked]:border-brand/40 has-[:checked]:text-brand text-xs transition-all uppercase tracking-widest opacity-60 has-[:checked]:opacity-100">
      <input class="hidden" name="calc-length" onchange="calculatePrice()" type="radio" value="${k}" ${i === 0 ? 'checked' : ''} />
      ${v}
    </label>
  `).join('');

  updateCalcUI();
}

function updateCalcUI() {
  const serviceId = document.getElementById('calc-service').value;
  const service   = PRICES_DATA.services.find(s => s.id === serviceId);
  if (!service) return;

  const masterWrapper = document.getElementById('calc-master-wrapper');
  const lengthWrapper = document.getElementById('calc-length-wrapper');

  if (service.type === 'master') {
    masterWrapper.classList.remove('hidden');
    lengthWrapper.classList.add('hidden');

    const masterSelect = document.getElementById('calc-master');
    Array.from(masterSelect.options).forEach(opt => {
      opt.style.display = service.prices[opt.value] ? 'block' : 'none';
    });

    if (service.prices && !service.prices[masterSelect.value]) {
      const firstAvailable = Array.from(masterSelect.options).find(opt => service.prices[opt.value]);
      if (firstAvailable) masterSelect.value = firstAvailable.value;
    }
  } else if (service.type === 'length') {
    masterWrapper.classList.add('hidden');
    lengthWrapper.classList.remove('hidden');
  } else {
    masterWrapper.classList.add('hidden');
    lengthWrapper.classList.add('hidden');
  }

  calculatePrice();
}

function calculatePrice() {
  const serviceId = document.getElementById('calc-service').value;
  const service   = PRICES_DATA.services.find(s => s.id === serviceId);
  const resultEl  = document.getElementById('calc-result');
  if (!service || !resultEl) return;

  let priceStr = '';

  if (service.type === 'fixed') {
    priceStr = service.price.toLocaleString('ru-RU') + ' ₽';
  } else if (service.type === 'from') {
    priceStr = 'от ' + service.price.toLocaleString('ru-RU') + ' ₽';
  } else if (service.type === 'master') {
    const masterVal = document.getElementById('calc-master').value;
    const price = service.prices[masterVal] || Object.values(service.prices)[0] || 0;
    priceStr = price.toLocaleString('ru-RU') + ' ₽';
  } else if (service.type === 'length') {
    const checked   = document.querySelector('input[name="calc-length"]:checked');
    const lengthVal = checked ? checked.value : Object.keys(PRICES_DATA.lengths)[0];
    const price     = service.prices[lengthVal] || 0;
    priceStr = price.toLocaleString('ru-RU') + ' ₽';
  }

  resultEl.style.transition = 'opacity 0.15s ease';
  resultEl.style.opacity    = '0';

  setTimeout(() => {
    resultEl.innerText     = priceStr;
    resultEl.style.opacity = '1';
  }, 150);
}

// ============================================================
// Price List Tabs
// ============================================================
function initPriceListTabs() {
  const tabs   = document.querySelectorAll('.price-list__tab');
  const panels = document.querySelectorAll('.price-list__panel');

  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanel = tab.dataset.tab;
      const currentPanel = document.querySelector('.price-list__panel--active');
      const nextPanel    = document.querySelector(`[data-panel="${targetPanel}"]`);

      if (!nextPanel || nextPanel === currentPanel) return;

      // Update tab pills immediately (CSS transition handles the smooth look)
      tabs.forEach(t => {
        t.classList.remove('price-list__tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('price-list__tab--active');
      tab.setAttribute('aria-selected', 'true');
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      // Fade out old panel, then let it clean up after animation
      if (currentPanel) {
        currentPanel.classList.remove('price-list__panel--active');
        currentPanel.classList.add('price-list__panel--leaving');
        currentPanel.addEventListener('animationend', () => {
          currentPanel.classList.remove('price-list__panel--leaving');
        }, { once: true });
      }

      // Fade in new panel (overlaps briefly for cinematic cross-fade)
      nextPanel.classList.add('price-list__panel--active');
    });
  });
}

// ============================================================
// Video Interaction (desktop hover + mobile autoplay)
// ============================================================
function initVideoInteraction() {
  const video = document.getElementById('philosophy-video');
  if (!video) return;

  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

  if (isTouchDevice()) {
    // On mobile/touch: mute and autoplay
    video.muted    = true;
    video.autoplay = true;
    video.loop     = true;
    video.setAttribute('playsinline', '');
    video.play().catch(() => {});
  } else {
    // Desktop: play on hover
    let pauseTimeout = null;

    video.addEventListener('mouseenter', () => {
      if (pauseTimeout) clearTimeout(pauseTimeout);
      video.playbackRate = 1.0;
      video.play().catch(err => console.warn('Play blocked:', err));
    });

    video.addEventListener('mouseleave', () => {
      pauseTimeout = setTimeout(() => {
        video.pause();
      }, 800);
    });
  }
}

// ============================================================
// FAQ Accordion
// ============================================================
function initFAQ() {
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  if (!faqTriggers.length) return;

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const faqItem = trigger.closest('.faq-item');
      const content = faqItem.querySelector('.faq-content');
      const icon    = trigger.querySelector('.faq-icon');
      const isOpen  = !content.classList.contains('hidden');

      document.querySelectorAll('.faq-item').forEach(item => {
        const otherContent = item.querySelector('.faq-content');
        const otherIcon    = item.querySelector('.faq-icon');

        if (item !== faqItem) {
          otherContent.classList.add('hidden');
          otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      if (isOpen) {
        content.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
      } else {
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

// ============================================================
// New Guest Form
// ============================================================
function initNewGuestForm() {
  const form = document.getElementById('newguest-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name     = document.getElementById('newguest-name').value.trim();
    const phone    = document.getElementById('newguest-phone').value.trim();
    const service  = document.getElementById('newguest-service').value;
    const timePart = document.getElementById('newguest-time-part').value;
    const day      = document.getElementById('newguest-day').value;

    const btnSubmit    = form.querySelector('button[type="submit"]');
    const originalText = btnSubmit.querySelector('span').textContent;

    btnSubmit.disabled = true;
    btnSubmit.querySelector('span').textContent = 'ОТПРАВКА...';

    try {
      const payload = new URLSearchParams({
        source: 'newguest',
        name,
        phone,
        service,
        time_part: timePart,
        day
      });

      const response = await fetch(WEBHOOK_URL, { method: 'POST', body: payload });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Webhook error: ${response.status}`);
      }

      btnSubmit.querySelector('span').textContent = 'ЗАЯВКА ОТПРАВЛЕНА';
      announceFormStatus('Заявка на скидку для новых гостей отправлена. Мы свяжемся с вами.');
      form.reset();

      setTimeout(() => {
        btnSubmit.querySelector('span').textContent = originalText;
      }, 3000);

    } catch (error) {
      console.error('Ошибка отправки формы нового гостя:', error);
      btnSubmit.querySelector('span').textContent = 'ОШИБКА';
      announceFormStatus('Ошибка отправки. Проверьте сеть и попробуйте снова.');
      setTimeout(() => {
        btnSubmit.querySelector('span').textContent = originalText;
      }, 3000);
    } finally {
      btnSubmit.disabled = false;
    }
  });
}

// ============================================================
// Master Gallery Carousel
// ============================================================
function initMasterGallery() {
  const masterCards    = document.querySelectorAll('[data-master]');
  const gallery        = document.getElementById('master-gallery');
  const galleryTrack   = document.getElementById('gallery-track');
  const closeGalleryBtn = document.getElementById('close-gallery');
  const prevBtn        = document.getElementById('gallery-prev');
  const nextBtn        = document.getElementById('gallery-next');
  const galleryMasterName = document.getElementById('gallery-master-name');

  if (!masterCards.length || !gallery || !galleryTrack) return;

  const mqMobileGalleryOff = window.matchMedia('(max-width: 767px)');
  const isGalleryDisabledOnThisViewport = () => mqMobileGalleryOff.matches;

  // Master portfolio images — update with real photos when available
  const mastersData = {
    alexander: {
      name: 'Наташа Яковлева',
      images: [
        '../workers/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202026-04-07%20221237.png',
        '../workers/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202026-04-07%20221257.png',
        '../workers/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202026-04-07%20221305.png'
      ]
    },
    elena: {
      name: 'Саша Эхова',
      images: [
        '../workers/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202026-04-07%20221257.png',
        '../workers/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202026-04-07%20221237.png',
        '../workers/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202026-04-07%20221305.png'
      ]
    },
    mark: {
      name: 'Алина Лопухова',
      images: [
        '../workers/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202026-04-07%20221305.png',
        '../workers/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202026-04-07%20221237.png',
        '../workers/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202026-04-07%20221257.png'
      ]
    }
  };

  let currentSlide  = 0;
  let currentMaster = null;

  const openGallery = (masterId) => {
    if (isGalleryDisabledOnThisViewport()) return;

    const master = mastersData[masterId];
    if (!master) return;

    currentMaster = masterId;
    currentSlide  = 0;
    galleryMasterName.textContent = master.name;

    galleryTrack.innerHTML = master.images.map(img => `
      <div class="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
        <img src="${img}" alt="Работа ${master.name}" class="w-full h-[400px] object-cover rounded-custom" />
      </div>
    `).join('');

    gallery.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    gallery.classList.add('hidden');
    document.body.style.overflow = '';
  };

  const nextSlide = () => {
    const master = mastersData[currentMaster];
    if (!master) return;
    currentSlide = (currentSlide + 1) % master.images.length;
    updateGalleryPosition();
  };

  const prevSlide = () => {
    const master = mastersData[currentMaster];
    if (!master) return;
    currentSlide = (currentSlide - 1 + master.images.length) % master.images.length;
    updateGalleryPosition();
  };

  const updateGalleryPosition = () => {
    const slideWidth = galleryTrack.firstElementChild.offsetWidth;
    galleryTrack.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
  };

  masterCards.forEach(card => {
    card.addEventListener('click', () => {
      openGallery(card.dataset.master);
    });
  });

  closeGalleryBtn.addEventListener('click', closeGallery);
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  document.addEventListener('keydown', (e) => {
    if (gallery.classList.contains('hidden')) return;
    if (e.key === 'Escape')      closeGallery();
    if (e.key === 'ArrowRight')  nextSlide();
    if (e.key === 'ArrowLeft')   prevSlide();
  });

  mqMobileGalleryOff.addEventListener('change', () => {
    if (isGalleryDisabledOnThisViewport() && !gallery.classList.contains('hidden')) {
      closeGallery();
    }
  });
}

// ============================================================
// Yandex Maps widget — lazy load (no iframe until user interaction)
// Reduces third-party cookies and main-thread work on initial load.
// Optional consent: set data-map-consent-key on #yandex-map-lazy to a
// localStorage key (truthy value required before the button loads the map).
// Or from a cookie banner: localStorage.setItem(key, '1') then enable UI.
// ============================================================
function initLazyYandexMap() {
  const root = document.getElementById('yandex-map-lazy');
  const btn = document.getElementById('yandex-map-load-btn');
  if (!root || !btn) return;

  const mapUrl = root.getAttribute('data-map-url');
  const mapTitle = root.getAttribute('data-map-title') || 'Карта';
  const consentKey = root.getAttribute('data-map-consent-key');

  const consentAllows = () => {
    if (!consentKey) return true;
    try {
      return Boolean(localStorage.getItem(consentKey));
    } catch {
      return false;
    }
  };

  const injectIframe = () => {
    if (root.dataset.mapLoaded === '1' || !mapUrl) return;
    root.dataset.mapLoaded = '1';
    root.classList.add('map-lazy-root--loaded');

    const iframe = document.createElement('iframe');
    iframe.src = mapUrl;
    iframe.title = mapTitle;
    iframe.className = 'map-iframe';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    iframe.setAttribute('tabindex', '0');
    root.appendChild(iframe);
    btn.remove();
    requestAnimationFrame(() => {
      try {
        iframe.focus();
      } catch {
        /* ignore */
      }
    });
  };

  const tryLoad = () => {
    if (!consentAllows()) return;
    btn.disabled = true;
    injectIframe();
  };

  btn.addEventListener('click', tryLoad);

  const enableBtnIfConsent = () => {
    if (!consentKey || !btn.isConnected) return;
    if (!consentAllows()) return;
    btn.disabled = false;
    btn.removeAttribute('aria-disabled');
    btn.removeAttribute('title');
  };

  window.addEventListener('storage', (e) => {
    if (consentKey && e.key === consentKey && e.newValue) enableBtnIfConsent();
  });

  window.addEventListener('faktura-map-consent-updated', enableBtnIfConsent);

  if (consentKey && !consentAllows()) {
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    btn.title = 'Сначала примите использование cookies в уведомлении на сайте';
  }
}

// ============================================================
// DOMContentLoaded — init all modules
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  initBurgerMenu();
  initLazyYandexMap();
  initMiniBookingForm();
  initQuiz();
  initPriceListTabs();
  initCalculator();
  initCalcContactForm();
  initVideoInteraction();
  initFAQ();
  initNewGuestForm();
  initMasterGallery();

  // Dynamic copyright year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Lenis smooth scrolling
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Reveal on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-header, .reveal-item').forEach(el => observer.observe(el));

  // Active nav tracking (stable: pick section with highest intersection ratio)
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (navLinks.length && sections.length && 'IntersectionObserver' in window) {
    const visibleSections = new Map();

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        if (!id) return;
        if (entry.isIntersecting) {
          visibleSections.set(id, entry.intersectionRatio);
        } else {
          visibleSections.delete(id);
        }
      });

      if (visibleSections.size === 0) return;

      let bestId = null;
      let bestRatio = 0;
      visibleSections.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });

      if (bestId) {
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + bestId);
        });
      }
    }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-20% 0px -35% 0px' });

    sections.forEach((s) => navObserver.observe(s));
  }

  // Smooth scroll to anchors
  document.addEventListener('click', (event) => {
    const link = event.target.closest('.nav-link, .mobile-menu__link, .mobile-menu__cta, a[href="#new-guests"], .skip-link');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const targetId = href.slice(1);
    if (!targetId) return;

    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    event.preventDefault();
    lenis.scrollTo(targetEl, { offset: 0 });
  });
});
