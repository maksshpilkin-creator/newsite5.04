// Shared Lenis instance — assigned in DOMContentLoaded, used by service booking buttons
let lenis;

function announceFormStatus(message) {
  const el = document.getElementById('form-status-announcer');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}

/** Layout / demo only: no backend. Short delay so loading → success feels natural. */
function simulateLayoutSubmit(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** RU mobile: 10 digits starting with 9 after optional +7 / 7 / 8 prefix. Returns digits only or null. */
function normalizeRussianMobile(input) {
  const d = String(input).replace(/\D/g, '');
  let rest = d;
  if (rest.length === 11 && (rest[0] === '7' || rest[0] === '8')) rest = rest.slice(1);
  if (rest.length === 10 && rest[0] === '9') return rest;
  return null;
}

function formatRussianMobileE164(digits10) {
  return '+7' + digits10;
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

    const phone = document.getElementById('mini-phone').value.trim();

    const phoneDigits = normalizeRussianMobile(phone);
    if (!phoneDigits) {
      setFeedback('Укажите корректный мобильный номер — например +7 912 345-67-89.', 'error');
      announceFormStatus('Некорректный номер телефона.');
      return;
    }

    const btnSubmit = form.querySelector('button[type="submit"]');
    const btnText   = document.getElementById('mini-btn-text');
    const btnLoader = document.getElementById('mini-btn-loader');

    clearFeedback();
    btnSubmit.disabled = true;
    btnText.textContent = 'ОТПРАВКА...';
    if (btnLoader) btnLoader.classList.remove('hidden');

    try {
      await simulateLayoutSubmit(650);

      btnText.textContent = 'ЗАЯВКА ПРИНЯТА';
      setFeedback('Спасибо! Заявка принята — администратор свяжется с вами в ближайшее время.', 'success');
      announceFormStatus('Заявка принята. Администратор свяжется с вами в течение 10 минут.');
      form.reset();

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

  const calcFormFeedback = document.getElementById('calc-form-feedback');
  const setCalcFeedback = (message, kind) => {
    if (!calcFormFeedback) return;
    calcFormFeedback.textContent = message;
    calcFormFeedback.classList.remove('hidden', 'text-white/50', 'text-red-400/90', 'text-brand');
    if (kind === 'success') {
      calcFormFeedback.classList.add('text-brand');
    } else if (kind === 'error') {
      calcFormFeedback.classList.add('text-red-400/90');
    } else {
      calcFormFeedback.classList.add('text-white/50');
    }
  };
  const clearCalcFeedback = () => {
    if (!calcFormFeedback) return;
    calcFormFeedback.textContent = '';
    calcFormFeedback.classList.add('hidden');
    calcFormFeedback.classList.remove('text-white/50', 'text-red-400/90', 'text-brand');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    clearCalcFeedback();

    if (!form.reportValidity()) {
      return;
    }

    const phone   = document.getElementById('calc-phone').value.trim();
    const phoneDigits = normalizeRussianMobile(phone);
    if (!phoneDigits) {
      setCalcFeedback('Укажите корректный мобильный номер РФ — например +7 912 345-67-89.', 'error');
      announceFormStatus('Укажите корректный мобильный номер.');
      return;
    }

    const btnSubmit = form.querySelector('button[type="submit"]');
    const btnSpan   = btnSubmit ? btnSubmit.querySelector('span') : null;
    if (!btnSubmit || !btnSpan) {
      console.error('initCalcContactForm: missing submit button or label');
      return;
    }
    const originalText = btnSpan.textContent;

    btnSubmit.disabled = true;
    btnSpan.textContent = 'ОТПРАВКА...';

    try {
      await simulateLayoutSubmit(600);

      btnSpan.textContent = 'ЦЕНА ЗАФИКСИРОВАНА';
      setCalcFeedback('Заявка с расчётом отправлена. Мы свяжемся с вами.', 'success');
      announceFormStatus('Заявка с расчётом цены отправлена. Мы свяжемся с вами.');
      form.reset();

      setTimeout(() => {
        btnSpan.textContent = originalText;
        clearCalcFeedback();
      }, 3000);
    } catch (error) {
      console.error('Ошибка отправки формы калькулятора:', error);
      setCalcFeedback('Не удалось завершить отправку. Попробуйте ещё раз.', 'error');
      announceFormStatus('Ошибка отправки. Проверьте сеть и попробуйте снова.');
      setTimeout(() => {
        btnSpan.textContent = originalText;
        clearCalcFeedback();
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
  const quizFormFeedback = document.getElementById('quiz-form-feedback');
  const quizContainer = document.getElementById('quiz-container');
  const setQuizFeedback = (message, kind) => {
    if (!quizFormFeedback) return;
    quizFormFeedback.textContent = message;
    quizFormFeedback.classList.remove('hidden', 'text-matte', 'text-red-600', 'text-matte/70');
    if (kind === 'success') {
      quizFormFeedback.classList.add('text-matte/70');
    } else if (kind === 'error') {
      quizFormFeedback.classList.add('text-red-600');
    } else {
      quizFormFeedback.classList.add('text-matte');
    }
  };
  const clearQuizFeedback = () => {
    if (!quizFormFeedback) return;
    quizFormFeedback.textContent = '';
    quizFormFeedback.classList.add('hidden');
    quizFormFeedback.classList.remove('text-matte', 'text-red-600', 'text-matte/70');
  };

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
  let advanceTimerId = null;

  const stepQuestionKeys = { 1: 'pain', 2: 'length', 3: 'priority' };

  const restoreAnswerStylesForStep = (stepNum) => {
    const q = stepQuestionKeys[stepNum];
    if (!q || answers[q] == null) return;
    const stepEl = document.querySelector(`.quiz-step[data-step="${stepNum}"]`);
    if (!stepEl) return;
    const selected = stepEl.querySelector(`.quiz-answer[data-value="${answers[q]}"]`);
    if (!selected) return;
    stepEl.querySelectorAll('.quiz-answer').forEach((b) => {
      b.style.borderColor = 'rgba(18,18,18,0.1)';
      b.style.backgroundColor = 'rgba(255,255,255,0.2)';
    });
    selected.style.borderColor = '#121212';
    selected.style.backgroundColor = 'transparent';
  };

  const updateUI = () => {
    if (
      currentStep === 4 &&
      (answers.pain == null || answers.length == null || answers.priority == null)
    ) {
      if (answers.pain == null) currentStep = 1;
      else if (answers.length == null) currentStep = 2;
      else currentStep = 3;
    }

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

    if (currentStep >= 1 && currentStep <= 3) {
      restoreAnswerStylesForStep(currentStep);
    }
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

      clearTimeout(advanceTimerId);
      if (quizContainer) quizContainer.classList.add('quiz-container--advancing');
      advanceTimerId = setTimeout(() => {
        advanceTimerId = null;
        if (quizContainer) quizContainer.classList.remove('quiz-container--advancing');
        currentStep++;
        updateUI();
      }, 350);
    });
  });

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      clearTimeout(advanceTimerId);
      advanceTimerId = null;
      if (quizContainer) quizContainer.classList.remove('quiz-container--advancing');
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

      clearQuizFeedback();

      if (!leadForm.reportValidity()) {
        return;
      }

      if (answers.pain == null || answers.length == null || answers.priority == null) {
        setQuizFeedback('Пройдите все шаги квиза перед отправкой.', 'error');
        announceFormStatus('Заполните все шаги квиза.');
        return;
      }

      answers.name = document.getElementById('quiz-name').value.trim();
      const rawPhone = document.getElementById('quiz-phone').value.trim();
      const phoneDigits = normalizeRussianMobile(rawPhone);
      if (!phoneDigits) {
        setQuizFeedback('Укажите корректный мобильный номер РФ — например +7 912 345-67-89.', 'error');
        announceFormStatus('Укажите корректный мобильный номер.');
        return;
      }
      answers.phone = formatRussianMobileE164(phoneDigits);

      const submitBtn = document.getElementById('quiz-submit-btn');
      const btnText   = document.getElementById('quiz-btn-text');
      const btnLoader = document.getElementById('quiz-btn-loader');

      if (!submitBtn || !btnText || !btnLoader) {
        console.error('initQuiz: missing submit button or label nodes');
        return;
      }

      submitBtn.disabled = true;
      btnText.textContent = 'Отправка...';
      btnLoader.classList.remove('hidden');

      let submitSucceeded = false;
      try {
        await simulateLayoutSubmit(800);

        generateResult();
        currentStep++;
        updateUI();
        clearQuizFeedback();
        announceFormStatus('Рекомендация по квизу отправлена. Администратор свяжется с вами.');
        submitSucceeded = true;
      } catch (error) {
        console.error('Ошибка отправки формы:', error);
        setQuizFeedback('Не удалось завершить отправку. Попробуйте ещё раз.', 'error');
        announceFormStatus('Ошибка отправки заявки. Пожалуйста, попробуйте ещё раз.');
      } finally {
        btnLoader.classList.add('hidden');
        if (submitSucceeded) {
          btnText.textContent = 'Отправлено';
          submitBtn.disabled = true;
          submitBtn.title = 'Отправлено';
        } else {
          btnText.textContent = 'Получить рекомендацию';
          submitBtn.disabled = false;
          submitBtn.title = 'Получить рекомендацию';
        }
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
  const masterSelectEl  = document.getElementById('calc-master');
  const lengthContainer = document.getElementById('calc-length-container');

  if (!serviceSelect || !masterSelectEl || !lengthContainer) return;

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

  serviceSelect.innerHTML = PRICES_DATA.services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  masterSelectEl.innerHTML  = Object.entries(PRICES_DATA.masters).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');

  lengthContainer.innerHTML = Object.entries(PRICES_DATA.lengths).map(([k, v], i) => `
    <label class="flex-1 text-center py-4 border border-white/5 cursor-pointer hover:bg-white/[0.02] rounded-custom has-[:checked]:border-brand/40 has-[:checked]:text-brand text-xs transition-all uppercase tracking-widest opacity-60 has-[:checked]:opacity-100">
      <input class="hidden" name="calc-length" type="radio" value="${k}" ${i === 0 ? 'checked' : ''} />
      ${v}
    </label>
  `).join('');

  serviceSelect.addEventListener('change', updateCalcUI);
  masterSelectEl.addEventListener('change', calculatePrice);
  lengthContainer.addEventListener('change', (e) => {
    if (e.target.matches('input[name="calc-length"]')) calculatePrice();
  });

  updateCalcUI();
}

// ============================================================
// Price List Tabs
// ============================================================
function initPriceListTabs() {
  const tabs = [...document.querySelectorAll('.price-list__tab')];
  if (!tabs.length) return;

  // Only the active tab is in the natural tab order; others use arrow keys
  tabs.forEach(t => {
    if (!t.classList.contains('price-list__tab--active')) {
      t.setAttribute('tabindex', '-1');
    }
  });

  const switchTab = (tab, { animate = true, updateHash = true } = {}) => {
    const targetId  = tab.dataset.tab;
    const nextPanel = document.querySelector(`[data-panel="${targetId}"]`);
    const curPanel  = document.querySelector('.price-list__panel--active');

    if (!nextPanel || nextPanel === curPanel) return;

    // Update tab roving tabindex + aria state
    tabs.forEach(t => {
      t.classList.remove('price-list__tab--active');
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    tab.classList.add('price-list__tab--active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');

    if (animate) {
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      if (curPanel) {
        curPanel.classList.remove('price-list__panel--active');
        curPanel.classList.add('price-list__panel--leaving');
        curPanel.addEventListener('animationend', () => {
          curPanel.classList.remove('price-list__panel--leaving');
        }, { once: true });
      }
    } else {
      if (curPanel) curPanel.classList.remove('price-list__panel--active');
    }

    nextPanel.classList.add('price-list__panel--active');

    if (updateHash) history.replaceState(null, '', `#services-${targetId}`);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => switchTab(tab));

    // Arrow key navigation (ARIA tablist pattern)
    tab.addEventListener('keydown', (e) => {
      let target = -1;
      if (e.key === 'ArrowRight') target = (index + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') target = 0;
      else if (e.key === 'End')  target = tabs.length - 1;

      if (target !== -1) {
        e.preventDefault();
        tabs[target].focus();
        switchTab(tabs[target]);
      }
    });
  });

  // Restore tab from URL hash on page load (e.g. #services-coloring)
  const hash = location.hash;
  if (hash.startsWith('#services-')) {
    const tabName   = hash.slice('#services-'.length);
    const targetTab = tabs.find(t => t.dataset.tab === tabName);
    if (targetTab) switchTab(targetTab, { animate: false, updateHash: false });
  }
}

// ============================================================
// Service booking — "Записаться" on each price row (delegated click scrolls to #new-guests)
// ============================================================
function initServiceBookBtns() {
  const panelToService = {
    brows:      'Комплекс',
    coloring:   'Окрашивание',
    makeup:     'Комплекс',
    styling:    'Комплекс',
    haircuts:   'Стрижка',
    care:       'Уход',
    wedding:    'Комплекс',
    lamination: 'Комплекс'
  };

  document.querySelectorAll('.price-list__panel[data-panel]').forEach(panel => {
    const serviceValue = panelToService[panel.dataset.panel] || '';
    panel.querySelectorAll('.price-list__item').forEach(item => {
      const serviceName = item.querySelector('.price-list__name')?.textContent?.trim() || '';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'price-list__book-btn';
      btn.innerHTML = 'Записаться <span aria-hidden="true">&#8594;</span>';
      btn.dataset.bookService = serviceValue;
      btn.setAttribute('aria-label', `Записаться на услугу: ${serviceName}`);
      item.appendChild(btn);
    });
  });

  // Event delegation for dynamically added book buttons on price list items
  const content = document.querySelector('.price-list__content');
  if (!content) return;
  content.addEventListener('click', (e) => {
    const btn = e.target.closest('.price-list__book-btn');
    if (!btn) return;
    e.stopPropagation();

    const serviceValue = btn.dataset.bookService;
    const select = document.getElementById('newguest-service');
    if (select && serviceValue) select.value = serviceValue;

    const target = document.getElementById('new-guests');
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: 0 });
    else target.scrollIntoView({ behavior: 'smooth' });
  });
}

// ============================================================
// Video Interaction (desktop hover + mobile autoplay)
// ============================================================
function initVideoInteraction() {
  const video = document.getElementById('philosophy-video');
  const splash = document.getElementById('philosophy-video-splash');
  if (!video) return;

  // Inline playback hint (esp. iOS); set in JS so HTML compat linters do not flag Firefox.
  video.playsInline = true;

  const hideSplash = () => {
    if (!splash || splash.dataset.dismissed === '1') return;
    splash.dataset.dismissed = '1';
    splash.classList.add('opacity-0');
    const done = () => {
      splash.remove();
    };
    splash.addEventListener('transitionend', (ev) => {
      if (ev.propertyName === 'opacity') done();
    }, { once: true });
    setTimeout(done, 900);
  };

  if (video.readyState >= 2) {
    hideSplash();
  } else {
    video.addEventListener('loadeddata', hideSplash, { once: true });
    video.addEventListener('canplay', hideSplash, { once: true });
    video.addEventListener('error', hideSplash, { once: true });
  }
  setTimeout(hideSplash, 14000);

  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

  if (isTouchDevice()) {
    // On mobile/touch: mute and autoplay (playsInline is set above for inline playback on iOS)
    video.muted    = true;
    video.autoplay = true;
    video.loop     = true;
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

  const newGuestFormFeedback = document.getElementById('newguest-form-feedback');
  const setNewGuestFeedback = (message, kind) => {
    if (!newGuestFormFeedback) return;
    newGuestFormFeedback.textContent = message;
    newGuestFormFeedback.classList.remove('hidden', 'text-white/50', 'text-red-400/90', 'text-brand');
    if (kind === 'success') {
      newGuestFormFeedback.classList.add('text-brand');
    } else if (kind === 'error') {
      newGuestFormFeedback.classList.add('text-red-400/90');
    } else {
      newGuestFormFeedback.classList.add('text-white/50');
    }
  };
  const clearNewGuestFeedback = () => {
    if (!newGuestFormFeedback) return;
    newGuestFormFeedback.textContent = '';
    newGuestFormFeedback.classList.add('hidden');
    newGuestFormFeedback.classList.remove('text-white/50', 'text-red-400/90', 'text-brand');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    clearNewGuestFeedback();

    if (!form.reportValidity()) {
      return;
    }

    const phone    = document.getElementById('newguest-phone').value.trim();
    const phoneDigits = normalizeRussianMobile(phone);
    if (!phoneDigits) {
      setNewGuestFeedback('Укажите корректный мобильный номер РФ — например +7 912 345-67-89.', 'error');
      announceFormStatus('Укажите корректный мобильный номер.');
      return;
    }

    const btnSubmit = form.querySelector('button[type="submit"]');
    const btnSpan   = btnSubmit ? btnSubmit.querySelector('span') : null;
    if (!btnSubmit || !btnSpan) {
      console.error('initNewGuestForm: missing submit button or label');
      return;
    }
    const originalText = btnSpan.textContent;

    btnSubmit.disabled = true;
    btnSpan.textContent = 'ОТПРАВКА...';

    try {
      await simulateLayoutSubmit(600);

      btnSpan.textContent = 'ЗАЯВКА ОТПРАВЛЕНА';
      setNewGuestFeedback('Заявка на скидку отправлена. Мы свяжемся с вами.', 'success');
      announceFormStatus('Заявка на скидку для новых гостей отправлена. Мы свяжемся с вами.');
      form.reset();

      setTimeout(() => {
        btnSpan.textContent = originalText;
        clearNewGuestFeedback();
      }, 3000);
    } catch (error) {
      console.error('Ошибка отправки формы нового гостя:', error);
      setNewGuestFeedback('Не удалось завершить отправку. Попробуйте ещё раз.', 'error');
      announceFormStatus('Ошибка отправки. Проверьте сеть и попробуйте снова.');
      setTimeout(() => {
        btnSpan.textContent = originalText;
        clearNewGuestFeedback();
      }, 3000);
    } finally {
      btnSubmit.disabled = false;
    }
  });
}

// Intrinsic widths of full-size master PNGs (for srcset `w` descriptors)
const MASTER_PNG_INTRINSIC_W = {
  1: 987,
  2: 1186,
  3: 1188
};

/** @param {string} pngPath e.g. assets/images/master-1.png */
function masterPortfolioSrcset(pngPath) {
  const m = pngPath.match(/master-(\d+)\.png$/);
  const id = m ? Number(m[1]) : 1;
  const w = MASTER_PNG_INTRINSIC_W[id] || 1024;
  const base = pngPath.replace(/\.png$/i, '');
  return `${base}-w384.webp 384w, ${base}-w768.webp 768w, ${pngPath} ${w}w`;
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
        'assets/images/master-1.png',
        'assets/images/master-2.png',
        'assets/images/master-3.png'
      ]
    },
    elena: {
      name: 'Саша Эхова',
      images: [
        'assets/images/master-2.png',
        'assets/images/master-1.png',
        'assets/images/master-3.png'
      ]
    },
    mark: {
      name: 'Алина Лопухова',
      images: [
        'assets/images/master-3.png',
        'assets/images/master-1.png',
        'assets/images/master-2.png'
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

    galleryTrack.innerHTML = master.images.map((img, idx) => `
      <div class="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
        <img src="${img}" srcset="${masterPortfolioSrcset(img)}" sizes="(max-width: 1023px) 90vw, 30vw" width="768" height="1024" alt="Работа ${master.name}" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async" class="w-full h-[400px] object-cover rounded-custom" />
      </div>
    `).join('');

    gallery.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      updateGalleryPosition();
      try {
        closeGalleryBtn.focus({ preventScroll: true });
      } catch {
        /* ignore */
      }
    });
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
    const first = galleryTrack.firstElementChild;
    if (!first) return;
    const slideWidth = first.offsetWidth;
    const cs = getComputedStyle(galleryTrack);
    const gap = parseFloat(cs.gap || cs.columnGap || cs.rowGap) || 16;
    galleryTrack.style.transform = `translateX(-${currentSlide * (slideWidth + gap)}px)`;
  };

  let galleryResizeTimer;
  window.addEventListener('resize', () => {
    if (gallery.classList.contains('hidden')) return;
    clearTimeout(galleryResizeTimer);
    galleryResizeTimer = setTimeout(updateGalleryPosition, 120);
  });

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
// Full-screen page loader — hide after window load + min display time
// ============================================================
function initPageLoader() {
  const el = document.getElementById('page-loader');
  if (!el) return;

  const minMs = 1500;
  const start = performance.now();
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    document.body.style.overflow = '';
    el.setAttribute('aria-hidden', 'true');
    document.body.classList.add('page-has-launched');
    el.remove();
  };

  const scheduleFinish = () => {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, minMs - elapsed);
    window.setTimeout(finish, wait);
  };

  document.body.style.overflow = 'hidden';

  if (document.readyState === 'complete') {
    scheduleFinish();
  } else {
    window.addEventListener('load', scheduleFinish, { once: true });
  }
}

// ============================================================
// DOMContentLoaded — init all modules
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  initPageLoader();

  initBurgerMenu();
  initLazyYandexMap();
  initMiniBookingForm();
  initQuiz();
  initPriceListTabs();
  initServiceBookBtns();
  initCalculator();
  initCalcContactForm();
  initVideoInteraction();
  initFAQ();
  initNewGuestForm();
  initMasterGallery();

  // Dynamic copyright year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Lenis smooth scrolling (assigned to module-level var so other functions can use it)
  // Lenis v1.0.x (vendor/lenis.min.js): use orientation / gestureOrientation / smoothWheel — not direction / smooth.
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 2,
  });

  let lenisRafId = 0;
  function raf(time) {
    if (!document.hidden) {
      lenis.raf(time);
    }
    if (document.hidden) {
      lenisRafId = 0;
      return;
    }
    lenisRafId = requestAnimationFrame(raf);
  }
  lenisRafId = requestAnimationFrame(raf);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(lenisRafId);
      lenisRafId = 0;
    } else if (!lenisRafId) {
      lenisRafId = requestAnimationFrame(raf);
    }
  });

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
  const sections = document.querySelectorAll('section[id], footer[id]');

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
