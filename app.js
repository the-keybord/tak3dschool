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
      const phone = document.getElementById('phone').value.trim();

      if (name === '' || email === '' || track === '' || phone === '') {
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


  // 7. Interactive 3D STL Viewer using Three.js
  function initStlViewer() {
    const container = document.getElementById('stl-viewer');
    if (!container) return;

    const spinner = container.querySelector('.stl-loader-spinner');

    // Shuffle helper to randomize the models queue
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // We will preload these models and alternate them every 4 seconds in random order
    const files = shuffleArray(['clopotel.stl', 'arculUmf.stl', 'cizz.stl', 'romanita.stl', 'pika.stl']);
    const meshes = [];
    let loadedCount = 0;
    let currentModelRadius = 50;

    // Create scene, camera and renderer
    const scene = new THREE.Scene();

    // We will initialize a dummy camera here, then update its frustum once the model geometry loads
    let aspect = container.clientWidth / container.clientHeight;
    let frustumSize = 100;
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );

    // Isometric camera positioning (equal x, y, and z offsets looking at center)
    camera.position.set(100, 100, 100);
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Add natural soft lighting (sunlight colors)
    // Ambient fill using a soft white/warm mix
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    // Warm main sun-like light from top-right-front
    const dirLight1 = new THREE.DirectionalLight(0xfffaf0, 0.85);
    dirLight1.position.set(120, 150, 100);
    scene.add(dirLight1);

    // Cool blue-grey sky bounce fill light from top-left-back
    const dirLight2 = new THREE.DirectionalLight(0xdbe5f5, 0.4);
    dirLight2.position.set(-100, 100, -100);
    scene.add(dirLight2);

    // Neutral fill light from below to soften bottom shadows
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.3);
    keyLight.position.set(0, -100, 50);
    scene.add(keyLight);

    const loader = new THREE.STLLoader();

    // Helper to select one of 3 distinct, beautiful brand orange shades
    function getRandomOrangeColor() {
      const orangeShades = [
        0xff5722, // Vibrant primary orange
        0xff9100, // Golden bright orange
        0xe64a19  // Deep rich coral orange
      ];
      const randomIndex = Math.floor(Math.random() * orangeShades.length);
      return new THREE.Color(orangeShades[randomIndex]);
    }

    let targetFrustumSize = 100;
    let currentFrustumSize = 100;
    let spinVelocity = 0.015;

    files.forEach((file, index) => {
      loader.load(file, function (geometry) {
        geometry.center();
        geometry.computeBoundingSphere();

        // Create a unique material with a random brand-aligned orange shade for each model
        const material = new THREE.MeshStandardMaterial({
          color: getRandomOrangeColor(),
          roughness: 0.35, // Smooth plastic feel
          metalness: 0.1,  // Non-metallic plastic
          flatShading: false // Smooth shading for natural look
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Orient the mesh using the user's preferred orientation (-140 on X)
        mesh.rotation.x = THREE.MathUtils.degToRad(-140);
        mesh.rotation.y = THREE.MathUtils.degToRad(0);

        // Center the model in the canvas
        mesh.position.x = 0;

        mesh.visible = (index === 0); // Show only the first model initially
        mesh.targetScale = (index === 0) ? 1.0 : 0.0;

        if (index !== 0) {
          mesh.scale.set(0, 0, 0);
        }

        scene.add(mesh);

        meshes[index] = mesh;
        loadedCount++;

        // Once both models are loaded, start loop and setup intervals
        if (loadedCount === files.length) {
          if (spinner) {
            spinner.style.display = 'none';
          }

          // Set initial camera fit bounds for the first model
          const radius = meshes[0].geometry.boundingSphere.radius;
          currentModelRadius = radius;
          targetFrustumSize = radius * 2.0;
          currentFrustumSize = targetFrustumSize;
          aspect = container.clientWidth / container.clientHeight;
          camera.left = currentFrustumSize * aspect / -2;
          camera.right = currentFrustumSize * aspect / 2;
          camera.top = currentFrustumSize / 2;
          camera.bottom = currentFrustumSize / -2;
          camera.updateProjectionMatrix();

          // Setup swap interval (every 2 seconds)
          let activeIndex = 0;
          setInterval(() => {
            const oldIndex = activeIndex;
            activeIndex = (activeIndex + 1) % files.length;

            // Set scale targets for transition
            meshes[oldIndex].targetScale = 0.0;

            meshes[activeIndex].visible = true;
            meshes[activeIndex].scale.set(0, 0, 0); // Reset scale to 0 to grow
            meshes[activeIndex].targetScale = 1.0;

            // Update target camera bounds to fit new model radius
            const activeRadius = meshes[activeIndex].geometry.boundingSphere.radius;
            currentModelRadius = activeRadius;
            targetFrustumSize = activeRadius * 2.0;

            // Trigger a high-speed spin burst (twist effect)
            spinVelocity = 0.18;
          }, 2000);

          // Animate loop
          function animate() {
            requestAnimationFrame(animate);

            // 1. Decay the spin velocity back to default slow spin
            spinVelocity = THREE.MathUtils.lerp(spinVelocity, 0.015, 0.1);

            // 2. Rotate all loaded models so the background/hidden one is already spinning when swapped
            meshes.forEach(m => {
              m.rotation.z += spinVelocity;
            });

            // 3. Lerp scale of all meshes towards their targetScale
            meshes.forEach(m => {
              m.scale.x = THREE.MathUtils.lerp(m.scale.x, m.targetScale, 0.2);
              m.scale.y = THREE.MathUtils.lerp(m.scale.y, m.targetScale, 0.2);
              m.scale.z = THREE.MathUtils.lerp(m.scale.z, m.targetScale, 0.2);

              // Visibility optimization: hide completely when scale is tiny
              if (m.targetScale === 0 && m.scale.x < 0.01) {
                m.visible = false;
              } else {
                m.visible = true;
              }
            });

            // 4. Lerp camera frustum size for smooth zooming
            currentFrustumSize = THREE.MathUtils.lerp(currentFrustumSize, targetFrustumSize, 0.12);
            const currentAspect = container.clientWidth / container.clientHeight;
            camera.left = currentFrustumSize * currentAspect / -2;
            camera.right = currentFrustumSize * currentAspect / 2;
            camera.top = currentFrustumSize / 2;
            camera.bottom = currentFrustumSize / -2;
            camera.updateProjectionMatrix();

            renderer.render(scene, camera);
          }
          animate();
        }
      }, undefined, function (error) {
        console.error("Error loading STL file:", file, error);
        if (spinner) {
          spinner.innerHTML = "<span style='color: var(--primary); font-size: 0.85rem;'>Eroare încărcare modele 3D</span>";
        }
      });
    });

    window.addEventListener('resize', () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      aspect = width / height;

      // Update camera projection on resize
      if (typeof currentModelRadius !== 'undefined') {
        targetFrustumSize = currentModelRadius * 2.0;
      }
      renderer.setSize(width, height);
    });
  }

  // Initialize STL Viewer
  initStlViewer();

});
