document.addEventListener('DOMContentLoaded', () => {

  // 1. Header scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Global Level Switching (Header Tabs)
  const headerTabs = document.querySelectorAll('.header-level-tab');
  const pageViews = document.querySelectorAll('.page-view');
  const trackDropdown = document.getElementById('track');
  const enrollSection = document.getElementById('enroll');

  function switchLevel(levelId) {
    // Update header tabs UI
    headerTabs.forEach(tab => {
      if (tab.getAttribute('data-level') === levelId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update main page views visibility
    pageViews.forEach(view => {
      if (view.getAttribute('id') === `view-${levelId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Synchronize enrollment form dropdown
    if (trackDropdown) {
      trackDropdown.value = levelId;
    }

    // Toggle main enrollment form description or behavior depending on selection
    if (enrollSection) {
      const enrollDesc = enrollSection.querySelector('.enroll-desc');
      if (levelId === 'level2') {
        enrollDesc.textContent = 'Completează formularul de înscriere pentru Nivelul 2 (Exploratori).';
      } else {
        const lvlName = levelId === 'level1' ? 'Nivelul 1' : 'Nivelul 3';
        enrollDesc.textContent = `Completează formularul de mai jos pentru a te înscrie în lista de așteptare pentru ${lvlName}.`;
      }
    }
  }

  headerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const levelId = tab.getAttribute('data-level');
      switchLevel(levelId);
    });
  });

  // Bidirectional sync: when changing dropdown, switch the active header tab / page view
  if (trackDropdown) {
    trackDropdown.addEventListener('change', (e) => {
      const levelId = e.target.value;
      if (levelId) {
        switchLevel(levelId);
      }
    });
  }

  // 3. Main Enrollment Form Submission Handler
  const applyForm = document.getElementById('apply-form');
  const mainFormMsg = document.getElementById('form-msg');

  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const track = document.getElementById('track').value;
      const message = document.getElementById('message').value.trim();

      if (name === '' || email === '' || track === '' || message === '') {
        showFeedback(mainFormMsg, 'Vă rugăm să completați toate câmpurile corect.', 'error');
        return;
      }

      let lvlName = 'Curs';
      if (track === 'level1') lvlName = 'Nivelul 1 (Începători)';
      else if (track === 'level2') lvlName = 'Nivelul 2 (Exploratori)';
      else if (track === 'level3') lvlName = 'Nivelul 3 (Avansați)';

      const submitBtn = applyForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Se trimite înscrierea...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        let feedbackText = '';
        if (track === 'level2') {
          feedbackText = `Vă mulțumim, ${name}! Cererea dvs. de înscriere la Nivelul 2 a fost înregistrată. Vă vom trimite confirmarea pe adresa ${email} în cel mai scurt timp.`;
        } else {
          feedbackText = `Vă mulțumim, ${name}! Ați fost înscris în lista de așteptare pentru ${lvlName}. Vă vom notifica la adresa ${email} când dăm startul.`;
        }
        
        showFeedback(mainFormMsg, feedbackText, 'success');
        applyForm.reset();
        
        // Retain selection after reset
        trackDropdown.value = track;
      }, 1200);
    });
  }



  // 5. Interactive Curriculum Accordion Logic
  const accordionPanels = document.querySelectorAll('.accordion-panel');

  function syncVideos() {
    accordionPanels.forEach(p => {
      const video = p.querySelector('.panel-bg-video');
      if (video) {
        if (p.classList.contains('active')) {
          video.play().catch(err => {
            // Handle browser autoplay policy restriction if any
            console.log("Autoplay check: ", err);
          });
        } else {
          video.pause();
        }
      }
    });
  }

  if (accordionPanels.length > 0) {
    // Initial active panel video playback
    syncVideos();

    accordionPanels.forEach(panel => {
      panel.addEventListener('click', () => {
        // Do nothing if the panel is already active
        if (panel.classList.contains('active')) return;

        // Remove active class from all other panels
        accordionPanels.forEach(p => p.classList.remove('active'));

        // Add active class to clicked panel
        panel.classList.add('active');

        // Sync playback states
        syncVideos();
      });
    });
  }


  function showFeedback(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = `form-message ${type}`;
    element.style.display = 'block';

    setTimeout(() => {
      element.style.transition = 'opacity 1s ease';
      element.style.opacity = '0';
      setTimeout(() => {
        element.style.display = 'none';
        element.style.opacity = '1';
      }, 1000);
    }, 8000);
  }

  // 6. Dynamic Relocation of Mentor Card for Mobile Layout
  function relocateMentorCard() {
    const mentorCard = document.querySelector('.mentor-card');
    const heroVisual = document.querySelector('.hero-visual-content');
    const mobileContainer = document.getElementById('mobile-mentor-placeholder');

    if (!mentorCard || !heroVisual || !mobileContainer) return;

    if (window.innerWidth <= 768) {
      if (mentorCard.parentElement !== mobileContainer) {
        mobileContainer.appendChild(mentorCard);
      }
    } else {
      if (mentorCard.parentElement !== heroVisual) {
        heroVisual.appendChild(mentorCard);
      }
    }
  }

  window.addEventListener('resize', relocateMentorCard);
  // Relocate immediately after initialization
  relocateMentorCard();

});
