// TAK RoboMaker - Client JavaScript (LEGO Robotics cu Florin Cazac)
document.addEventListener('DOMContentLoaded', () => {
  console.log('TAK RoboMaker Initialized (LEGO Robotics)');

  // ==========================================
  // 1. LEVEL SWITCHING LOGIC & DEEP LINKING (#start, #pro, #challenge)
  // ==========================================
  const levelTabs = document.querySelectorAll('.header-level-tab');
  const pageViews = document.querySelectorAll('.page-view');

  function switchLevel(levelId, updateHistory = true) {
    levelTabs.forEach(tab => {
      if (tab.getAttribute('data-level') === levelId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    pageViews.forEach(view => {
      if (view.getAttribute('id') === `view-${levelId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    if (updateHistory && history.replaceState) {
      history.replaceState(null, null, `#${levelId}`);
    }

    setTimeout(updateRoadmapProgress, 100);
  }

  function initLevelFromURL() {
    const rawHash = window.location.hash.toLowerCase().replace('#', '');
    const urlParams = new URLSearchParams(window.location.search);
    const rawQuery = urlParams.get('level') ? urlParams.get('level').toLowerCase() : null;
    const targetKey = rawHash || rawQuery;

    if (!targetKey) return;

    let targetLevel = null;
    if (targetKey === 'start' || targetKey === 'level1' || targetKey === '1') {
      targetLevel = 'start';
    } else if (targetKey === 'pro' || targetKey === 'level2' || targetKey === '2') {
      targetLevel = 'pro';
    } else if (targetKey === 'challenge' || targetKey === 'level3' || targetKey === '3') {
      targetLevel = 'challenge';
    }

    if (targetLevel) {
      switchLevel(targetLevel, false);
    }
  }

  levelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetLevel = tab.getAttribute('data-level');
      switchLevel(targetLevel);
    });
  });

  initLevelFromURL();
  window.addEventListener('hashchange', initLevelFromURL);

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.startsWith('#start') || targetId.startsWith('#pro') || targetId.startsWith('#challenge')) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ==========================================
  // 2. SCROLL-DRIVEN ROADMAP PROGRESS & ACTIVE STEP OPENING
  // ==========================================
  const roadmapTimeline = document.querySelector('.roadmap-timeline');
  const roadmapProgressBar = document.querySelector('.roadmap-progress-bar');
  const roadmapItems = document.querySelectorAll('.roadmap-item');

  function updateRoadmapProgress() {
    if (!roadmapTimeline || !roadmapProgressBar || roadmapItems.length === 0) return;

    const timelineRect = roadmapTimeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Trigger point at 65% down the screen
    const triggerY = windowHeight * 0.65;
    const progressStart = timelineRect.top - triggerY;
    const totalDist = timelineRect.height;

    let progressRatio = (-progressStart) / totalDist;
    progressRatio = Math.max(0, Math.min(1, progressRatio));

    // Fill progress bar height
    roadmapProgressBar.style.height = `${progressRatio * 100}%`;

    // Activate/open items as scroll passes them
    roadmapItems.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      if (itemRect.top <= triggerY) {
        item.classList.add('active');
        item.classList.add('completed');
      } else {
        if (index === 0 && timelineRect.top <= triggerY) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
          item.classList.remove('completed');
        }
      }
    });
  }

  // Click on point node to scroll smoothly to that step
  roadmapItems.forEach(item => {
    const point = item.querySelector('.roadmap-point');
    if (point) {
      point.addEventListener('click', () => {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  });

  window.addEventListener('scroll', updateRoadmapProgress, { passive: true });
  window.addEventListener('resize', updateRoadmapProgress, { passive: true });
  setTimeout(updateRoadmapProgress, 100);
});
