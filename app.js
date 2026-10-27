/**
 * UMak Ethics Project Application Logic — "Dignity into Action"
 * Group 1 Lead: Luigi D. Balingit
 * Features:
 * - Active tab switching across desktop nav, mobile drawer, and bottom quick dock
 * - Dark / Light theme toggle with local persistence and system pref sync
 * - Interactive Ethics Simulator with virtue impact scoring
 * - Evidence Matrix interactive filter pills
 * - Mobile responsive drawer & floating back-to-top handler
 */

(function () {
  'use strict';

  var THEME_STORAGE_KEY = 'umak-theme';
  var root = document.documentElement;

  /* ── 1. Theme Management ─────────────────────────────────────── */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    updateThemeToggleUI(theme);
  }

  function updateThemeToggleUI(theme) {
    var buttons = document.querySelectorAll('.theme-switch-btn');
    buttons.forEach(function (btn) {
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
      btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function resolveInitialTheme() {
    var stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function toggleTheme() {
    var current = root.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';

    root.classList.add('theme-transitioning');
    applyTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);

    setTimeout(function () {
      root.classList.remove('theme-transitioning');
    }, 300);
  }

  // Expose toggleTheme globally
  window.toggleTheme = toggleTheme;

  // Initialize theme immediately
  var initialTheme = resolveInitialTheme();
  applyTheme(initialTheme);

  /* ── 2. Navigation & Tab Switching ───────────────────────────── */
  var TAB_SECTIONS = ['overview', 'texts', 'matrix', 'actions', 'simulator', 'process'];

  window.switchTab = function (tabId) {
    if (!TAB_SECTIONS.includes(tabId)) return;

    // Hide all sections & deactivate all buttons
    TAB_SECTIONS.forEach(function (id) {
      var sectionEl = document.getElementById('section-' + id);
      if (sectionEl) {
        sectionEl.classList.add('hidden');
      }

      // Desktop nav items
      var desktopBtn = document.getElementById('nav-' + id);
      if (desktopBtn) desktopBtn.classList.remove('active');

      // Mobile drawer links
      var drawerLink = document.getElementById('drawer-nav-' + id);
      if (drawerLink) drawerLink.classList.remove('active');

      // Mobile bottom dock pills
      var dockPill = document.getElementById('dock-nav-' + id);
      if (dockPill) dockPill.classList.remove('active');
    });

    // Show active section
    var targetSection = document.getElementById('section-' + tabId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }

    // Activate corresponding nav controls
    var activeDesktopBtn = document.getElementById('nav-' + tabId);
    if (activeDesktopBtn) activeDesktopBtn.classList.add('active');

    var activeDrawerLink = document.getElementById('drawer-nav-' + tabId);
    if (activeDrawerLink) activeDrawerLink.classList.add('active');

    var activeDockPill = document.getElementById('dock-nav-' + tabId);
    if (activeDockPill) {
      activeDockPill.classList.add('active');
      try {
        activeDockPill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } catch (e) {}
    }

    // Close mobile drawer if opened
    closeMobileDrawer();

    // Smooth scroll to top of content area
    var anchor = document.getElementById('main-content-anchor');
    if (anchor) {
      var headerOffset = 80;
      var elementPosition = anchor.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  };

  /* ── 3. Mobile Off-Canvas Drawer ─────────────────────────────── */
  function openMobileDrawer() {
    var drawer = document.getElementById('mobileDrawer');
    var overlay = document.getElementById('drawerOverlay');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileDrawer() {
    var drawer = document.getElementById('mobileDrawer');
    var overlay = document.getElementById('drawerOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  window.openMobileDrawer = openMobileDrawer;
  window.closeMobileDrawer = closeMobileDrawer;

  window.toggleMobileMenu = function () {
    var drawer = document.getElementById('mobileDrawer');
    if (drawer && drawer.classList.contains('open')) {
      closeMobileDrawer();
    } else {
      openMobileDrawer();
    }
  };

  /* ── 4. Interactive Ethics Simulator ─────────────────────────── */
  // Track current choice for AI analysis
  var currentSimChoice = null;

  window.evaluateSim = function (choice) {
    currentSimChoice = choice;

    var feedbackBox = document.getElementById('sim-feedback');
    var titleEl = document.getElementById('sim-result-title');
    var bodyEl = document.getElementById('sim-result-body');
    var scoreBar = document.getElementById('sim-metrics-bar');
    var aiBtn = document.getElementById('sim-ai-btn');
    var aiPanel = document.getElementById('sim-ai-panel');
    var aiResponse = document.getElementById('sim-ai-response');
    var aiError = document.getElementById('sim-ai-error');
    var aiProvider = document.getElementById('sim-ai-provider');

    if (!feedbackBox || !titleEl || !bodyEl || !scoreBar) return;

    // Reset AI panel
    if (aiPanel) { aiPanel.style.display = 'none'; }
    if (aiResponse) { aiResponse.textContent = ''; }
    if (aiError) { aiError.style.display = 'none'; aiError.textContent = ''; }
    if (aiProvider) { aiProvider.textContent = ''; }

    feedbackBox.classList.add('active');

    // Deselect other buttons visual feedback
    var buttons = document.querySelectorAll('.sim-choice-btn');
    buttons.forEach(function (btn) {
      btn.style.opacity = '0.6';
      btn.style.borderColor = 'rgba(255, 255, 255, 0.18)';
    });

    var selectedBtn = document.getElementById('sim-btn-' + choice);
    if (selectedBtn) {
      selectedBtn.style.opacity = '1';
      selectedBtn.style.borderColor = 'var(--color-secondary)';
    }

    if (choice === 'A') {
      titleEl.innerHTML = '<i class="bi bi-x-circle-fill" style="color: var(--color-error); font-size: 1.15rem; margin-right: 6px;"></i> <span style="color: #ff8a80;">Severe Moral Compromise: Active Complicity</span>';
      bodyEl.innerHTML = '<strong>Analysis:</strong> Forwarding degrading media or validating it with laughter violates the inherent, sacred dignity of your classmate (von Hildebrand, <em>The Privilege of Being a Woman</em>, Part II). Furthermore, under Philippine Republic Act No. 11313 (Safe Spaces Act), circulating unauthorized private media and defamatory content constitutes illegal Gender-Based Online Sexual Harassment (GBOSH). Gray and Martin stress in <em>Boys to Men</em> that compromising virtue to seek cheap group popularity destroys character.';
      scoreBar.innerHTML = `
        <span class="sim-metric-badge" style="background: rgba(192, 57, 43, 0.35); color: #ff8a80;"><i class="bi bi-dash-circle-fill" style="margin-right: 4px;"></i> Prudence: 0/10 (Impulsive)</span>
        <span class="sim-metric-badge" style="background: rgba(192, 57, 43, 0.35); color: #ff8a80;"><i class="bi bi-shield-x" style="margin-right: 4px;"></i> Courage: 0/10 (Peer Conformity)</span>
        <span class="sim-metric-badge" style="background: rgba(192, 57, 43, 0.35); color: #ff8a80;"><i class="bi bi-exclamation-octagon-fill" style="margin-right: 4px;"></i> RA 11313: Criminal Violation</span>
      `;
    } else if (choice === 'B') {
      titleEl.innerHTML = '<i class="bi bi-exclamation-triangle-fill" style="color: var(--color-warning); font-size: 1.15rem; margin-right: 6px;"></i> <span style="color: #ffd54f;">Passive Bystander: Deficiency in Moral Courage</span>';
      bodyEl.innerHTML = '<strong>Analysis:</strong> While you avoided actively forwarding the harmful content, passive silence allows the digital viral chain to proceed unchecked. In Catholic moral theology, omitting rightful action when dignity is threatened makes one a passive accomplice. Empirical research on campus bystander behavior (Harmsen et al., 2016) shows that cyber harassment thrives when the majority stays silent. Prudence is not cowardice; right reason demands proactive measures to protect the victim.';
      scoreBar.innerHTML = `
        <span class="sim-metric-badge" style="background: rgba(184, 134, 11, 0.35); color: #ffd54f;"><i class="bi bi-exclamation-circle-fill" style="margin-right: 4px;"></i> Prudence: 4/10 (Incomplete)</span>
        <span class="sim-metric-badge" style="background: rgba(184, 134, 11, 0.35); color: #ffd54f;"><i class="bi bi-eye-slash-fill" style="margin-right: 4px;"></i> Courage: 2/10 (Silent Observer)</span>
        <span class="sim-metric-badge" style="background: rgba(184, 134, 11, 0.35); color: #ffd54f;"><i class="bi bi-arrow-repeat" style="margin-right: 4px;"></i> Campus Impact: Chain Continues</span>
      `;
    } else if (choice === 'C') {
      titleEl.innerHTML = '<i class="bi bi-check-circle-fill" style="color: var(--color-success); font-size: 1.15rem; margin-right: 6px;"></i> <span style="color: #a7f3d0;">Exemplary Moral Action: Prudence and Sacred Reverence</span>';
      bodyEl.innerHTML = '<strong>Analysis:</strong> This choice embodies the pinnacle of virtue! You exercised <strong>Prudence</strong> ("right reason applied to practice", Gray &amp; Martin, Ch. 2) by halting the spread without creating volatile group hostility. By privately confronting the sender with legal and moral boundaries, and by reaching out to Ana with authentic empathy, you honored feminine sensitivity and dignity (von Hildebrand, Part VII) while creating a safe campus space.';
      scoreBar.innerHTML = `
        <span class="sim-metric-badge" style="background: rgba(26, 122, 74, 0.35); color: #a7f3d0;"><i class="bi bi-patch-check-fill" style="margin-right: 4px;"></i> Prudence: 10/10 (Charioteer of Virtues)</span>
        <span class="sim-metric-badge" style="background: rgba(26, 122, 74, 0.35); color: #a7f3d0;"><i class="bi bi-shield-check" style="margin-right: 4px;"></i> Courage: 10/10 (Rightful Resistance)</span>
        <span class="sim-metric-badge" style="background: rgba(26, 122, 74, 0.35); color: #a7f3d0;"><i class="bi bi-check2-all" style="margin-right: 4px;"></i> Safe Spaces: Fully Upheld</span>
      `;
    }

    // Show AI button after choice
    if (aiBtn) { aiBtn.style.display = 'flex'; }

    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  window.resetSim = function () {
    currentSimChoice = null;
    var feedbackBox = document.getElementById('sim-feedback');
    if (feedbackBox) feedbackBox.classList.remove('active');

    var aiBtn = document.getElementById('sim-ai-btn');
    if (aiBtn) { aiBtn.style.display = 'none'; }

    var aiPanel = document.getElementById('sim-ai-panel');
    if (aiPanel) { aiPanel.style.display = 'none'; }

    var buttons = document.querySelectorAll('.sim-choice-btn');
    buttons.forEach(function (btn) {
      btn.style.opacity = '1';
      btn.style.borderColor = 'rgba(255, 255, 255, 0.18)';
    });
  };

  window.requestAIAnalysis = function () {
    if (!currentSimChoice) return;

    var aiBtn = document.getElementById('sim-ai-btn');
    var aiPanel = document.getElementById('sim-ai-panel');
    var aiLoading = document.getElementById('sim-ai-loading');
    var aiResponse = document.getElementById('sim-ai-response');
    var aiError = document.getElementById('sim-ai-error');
    var aiProvider = document.getElementById('sim-ai-provider');

    if (!aiPanel) return;

    // Show panel and loading
    aiPanel.style.display = 'block';
    aiLoading.style.display = 'flex';
    aiResponse.textContent = '';
    aiError.style.display = 'none';
    aiError.textContent = '';
    aiProvider.textContent = '';
    if (aiBtn) { aiBtn.disabled = true; aiBtn.innerHTML = '<i class="bi bi-hourglass-split" style="margin-right:6px;"></i> Analyzing…'; }

    fetch('/api/virtue-eval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'choice', choice: currentSimChoice })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      aiLoading.style.display = 'none';
      if (data.error) {
        aiError.style.display = 'block';
        aiError.textContent = '⚠ ' + data.error;
      } else {
        aiResponse.textContent = data.response || '';
        if (data.provider) {
          aiProvider.textContent = data.provider;
        }
      }
    })
    .catch(function (err) {
      aiLoading.style.display = 'none';
      aiError.style.display = 'block';
      if (window.location.protocol === 'file:') {
        aiError.innerHTML = '⚠ <strong>File Protocol Detected:</strong> Ang browser ay naka-<code>file:///</code> kaya hindi maabot ang <code>/api/virtue-eval</code>. Patakbuhin ang <code>node dev-server.js</code> sa terminal at buksan ang <a href="http://localhost:3000" target="_blank" style="color:var(--color-secondary);text-decoration:underline;font-weight:bold;">http://localhost:3000</a>, o i-deploy sa Vercel.';
      } else {
        aiError.textContent = '⚠ Network error. Siguraduhing may valid API key sa .env.local (o Vercel Environment Variables).';
      }
    })
    .finally(function () {
      if (aiBtn) {
        aiBtn.disabled = false;
        aiBtn.innerHTML = '<i class="bi bi-cpu-fill" style="margin-right:6px;"></i> Refresh AI Analysis';
      }
    });
  };

  window.submitCustomDilemma = function () {
    var input = document.getElementById('custom-dilemma-input');
    var resultBox = document.getElementById('custom-ai-result');
    var loading = document.getElementById('custom-ai-loading');
    var response = document.getElementById('custom-ai-response');
    var error = document.getElementById('custom-ai-error');
    var provider = document.getElementById('custom-ai-provider');
    var submitBtn = document.getElementById('custom-submit-btn');

    if (!input || !input.value.trim() || input.value.trim().length < 20) {
      input.style.borderColor = 'var(--color-error)';
      setTimeout(function () { input.style.borderColor = ''; }, 2000);
      return;
    }

    resultBox.style.display = 'block';
    loading.style.display = 'flex';
    response.textContent = '';
    error.style.display = 'none';
    error.textContent = '';
    provider.textContent = '';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split" style="margin-right:6px;"></i> Analyzing…';

    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    fetch('/api/virtue-eval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'custom', customDilemma: input.value.trim() })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      loading.style.display = 'none';
      if (data.error) {
        error.style.display = 'block';
        if (data.offTopic) {
          // Off-topic: no AI credits were used — show a friendly info message
          error.innerHTML = '🚫 <strong>Hindi Related sa Ethics</strong> — Walang AI credits na nagastos.<br><br>' +
            data.error.replace(/\n/g, '<br>');
        } else {
          error.textContent = '⚠ ' + data.error;
        }
      } else {
        response.textContent = data.response || '';
        if (data.provider) { provider.textContent = data.provider; }
      }
    })
    .catch(function () {
      loading.style.display = 'none';
      error.style.display = 'block';
      if (window.location.protocol === 'file:') {
        error.innerHTML = '⚠ <strong>File Protocol Detected:</strong> Ang browser ay naka-<code>file:///</code> kaya hindi maabot ang <code>/api/virtue-eval</code>. Patakbuhin ang <code>node dev-server.js</code> sa terminal at buksan ang <a href="http://localhost:3000" target="_blank" style="color:var(--color-secondary);text-decoration:underline;font-weight:bold;">http://localhost:3000</a>, o i-deploy sa Vercel.';
      } else {
        error.textContent = '⚠ Network error. Siguraduhing may valid API key sa .env.local (o Vercel Environment Variables).';
      }
    })
    .finally(function () {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-send-fill" style="margin-right:6px;"></i> Analyze with AI';
    });
  };

  /* ── 5. Evidence Matrix Filtering ────────────────────────────── */
  window.filterMatrix = function (category) {
    var filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function (btn) {
      btn.classList.remove('active');
    });

    var activeBtn = document.getElementById('filter-btn-' + category);
    if (activeBtn) activeBtn.classList.add('active');

    // Filter table rows (Desktop)
    var tableRows = document.querySelectorAll('.matrix-table tbody tr');
    tableRows.forEach(function (row) {
      if (category === 'all' || row.getAttribute('data-category') === category) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    // Filter cards (Mobile)
    var mobileCards = document.querySelectorAll('.matrix-card-item');
    mobileCards.forEach(function (card) {
      if (category === 'all' || card.getAttribute('data-category') === category) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  };

  /* ── 6. Floating Back to Top Button ──────────────────────────── */
  function initBackToTop() {
    var btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── 7. DOMContentLoaded Event Listeners ──────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // Theme toggle is handled via inline onclick="toggleTheme()" in HTML
    // Do NOT add another addEventListener here — it would double-fire and cancel out

    // Mobile drawer backdrop overlay click
    var overlay = document.getElementById('drawerOverlay');
    if (overlay) {
      overlay.addEventListener('click', closeMobileDrawer);
    }

    // Keyboard ESC key closes drawer
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMobileDrawer();
      }
    });

    // System theme change listener
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    initBackToTop();
    initHeroSlider();
    initHeaderScroll();
    initCustomDilemmaCounter();
  });

  function initCustomDilemmaCounter() {
    var textarea = document.getElementById('custom-dilemma-input');
    var counter = document.getElementById('custom-char-count');
    if (!textarea || !counter) return;
    textarea.addEventListener('input', function () {
      counter.textContent = textarea.value.length + ' / 800';
    });
  }


  /* ── 8. Hero Banner Slider (UMak LayerSlider Style) ─────────────── */
  var currentHeroSlide = 0;
  var heroSlideTimer = null;

  function showHeroSlide(index) {
    var slides = document.querySelectorAll('.hero-slide');
    var dots = document.querySelectorAll('.slider-dot');
    if (!slides.length) return;

    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    currentHeroSlide = index;

    slides.forEach(function (slide, i) {
      if (i === currentHeroSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach(function (dot, i) {
      if (i === currentHeroSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function moveHeroSlide(delta) {
    showHeroSlide(currentHeroSlide + delta);
    resetHeroSlideTimer();
  }

  function setHeroSlide(index) {
    showHeroSlide(index);
    resetHeroSlideTimer();
  }

  function startHeroSlideTimer() {
    heroSlideTimer = setInterval(function () {
      showHeroSlide(currentHeroSlide + 1);
    }, 7000);
  }

  function resetHeroSlideTimer() {
    if (heroSlideTimer) {
      clearInterval(heroSlideTimer);
      startHeroSlideTimer();
    }
  }

  function initHeroSlider() {
    startHeroSlideTimer();

    // Pause on hover
    var heroBanner = document.querySelector('.hero-banner');
    if (heroBanner) {
      heroBanner.addEventListener('mouseenter', function () {
        if (heroSlideTimer) clearInterval(heroSlideTimer);
      });
      heroBanner.addEventListener('mouseleave', function () {
        startHeroSlideTimer();
      });
    }
  }

  /* ── 9. Header Scroll State (Transparent to Solid Navy) ─────────── */
  function initHeaderScroll() {
    var header = document.querySelector('.main-header');
    if (!header) return;

    function handleScroll() {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  window.moveHeroSlide = moveHeroSlide;
  window.setHeroSlide = setHeroSlide;
})();
