(function() {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initHeader() {
    var header = document.querySelector('.header');
    if (!header) return;

    var scrollThreshold = 50;

    function updateHeader() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  function initServiceFilter() {
    var filters = document.querySelectorAll('.service-filter');
    var cards = document.querySelectorAll('.service-card');

    filters.forEach(function(filter) {
      filter.addEventListener('click', function() {
        var selectedFilter = this.getAttribute('data-filter');

        filters.forEach(function(f) {
          f.classList.remove('active');
          f.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        var visibleCards = [];
        cards.forEach(function(card) {
          var tags = card.getAttribute('data-tags') || '';
          var shouldShow = selectedFilter === 'all' || tags.indexOf(selectedFilter) !== -1;

          if (shouldShow) {
            card.classList.remove('hidden');
            visibleCards.push(card);
          } else {
            card.classList.add('hidden');
            card.classList.remove('animating');
          }
        });

        if (!reducedMotion) {
          visibleCards.forEach(function(card, index) {
            card.classList.remove('animating');
            void card.offsetWidth;
            card.style.animationDelay = (index * 0.08) + 's';
            card.classList.add('animating');
          });
        }
      });
    });

    cards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        if (reducedMotion) return;
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
      });
    });
  }

  function initBreathingOrb() {
    var orb = document.querySelector('.breathing-orb');
    var pauseBtn = orb ? orb.querySelector('.breathing-orb__pause') : null;
    var label = orb ? orb.querySelector('.breathing-orb__label') : null;
    var countEl = orb ? orb.querySelector('.breathing-orb__count') : null;

    if (!pauseBtn || !orb) return;

    var phases = [
      { text: 'Breathe in...', duration: 4000 },
      { text: 'Hold...', duration: 4000 },
      { text: 'Breathe out...', duration: 4000 },
      { text: 'Hold...', duration: 4000 }
    ];

    var phaseIndex = 0;
    var countdown = 4;
    var phaseInterval;
    var countInterval;
    var isPaused = false;

    function tickCount() {
      if (countEl) {
        countEl.classList.add('tick');
        setTimeout(function() {
          countEl.classList.remove('tick');
        }, 150);
      }
    }

    function updateCountdown() {
      countdown--;
      if (countdown < 1) {
        countdown = 4;
      }
      if (countEl && !reducedMotion) {
        countEl.textContent = countdown;
        tickCount();
      }
    }

    function updatePhase() {
      phaseIndex = (phaseIndex + 1) % phases.length;
      countdown = 4;

      if (label && !reducedMotion) {
        label.style.opacity = '0';
        setTimeout(function() {
          label.textContent = phases[phaseIndex].text;
          label.style.opacity = '1';
        }, 150);
      }

      if (countEl && !reducedMotion) {
        countEl.textContent = '4';
        tickCount();
      }
    }

    function startBreathing() {
      if (reducedMotion) return;

      if (label) {
        label.textContent = phases[phaseIndex].text;
      }
      if (countEl) {
        countEl.textContent = '4';
      }

      countInterval = setInterval(updateCountdown, 1000);
      phaseInterval = setInterval(updatePhase, 4000);
    }

    function stopBreathing() {
      clearInterval(countInterval);
      clearInterval(phaseInterval);
    }

    function resetBreathing() {
      phaseIndex = 0;
      countdown = 4;
    }

    if (!reducedMotion) {
      startBreathing();
    } else {
      if (label) label.textContent = 'Breathe';
      if (countEl) countEl.style.display = 'none';
    }

    pauseBtn.addEventListener('click', function() {
      isPaused = !isPaused;
      orb.classList.toggle('paused', isPaused);
      pauseBtn.setAttribute('aria-label', isPaused ? 'Resume breathing animation' : 'Pause breathing animation');

      if (isPaused) {
        stopBreathing();
        if (label) label.textContent = 'Paused';
        if (countEl) countEl.textContent = '–';
      } else {
        resetBreathing();
        startBreathing();
      }
    });
  }

  function initStepsAnimation() {
    var steps = document.querySelectorAll('.step');
    var lineFill = document.querySelector('.steps__line-fill');

    if (reducedMotion) {
      steps.forEach(function(step) {
        step.classList.add('active');
      });
      if (lineFill) lineFill.style.height = '100%';
      return;
    }

    var stepsSection = document.querySelector('.how-it-works');
    if (!stepsSection || !steps.length || !lineFill) return;

    var hasAnimated = false;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          animateSteps();
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -5% 0px'
    });

    observer.observe(stepsSection);

    function animateSteps() {
      var totalSteps = steps.length;
      var baseDelay = 600;

      steps.forEach(function(step, index) {
        setTimeout(function() {
          step.classList.add('active');
          var progress = ((index + 1) / totalSteps) * 100;
          lineFill.style.height = progress + '%';
        }, baseDelay * (index + 1));
      });
    }
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var headerOffset = 80;
          var elementPosition = target.getBoundingClientRect().top;
          var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: reducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    });
  }

  function init() {
    initHeader();
    initServiceFilter();
    initBreathingOrb();
    initStepsAnimation();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
