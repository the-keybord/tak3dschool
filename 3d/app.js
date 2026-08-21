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

  function switchLevel(levelId, updateHistory = true) {
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

    // Update URL hash for shareable direct links
    if (updateHistory && history.replaceState) {
      history.replaceState(null, null, `#${levelId}`);
    }

    // Trigger resize after DOM display update so Three.js canvases recalculate dimensions
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  }

  // Parse direct link from URL (e.g., #junior, #start, #pro, #level1, #level2, #level3)
  function initLevelFromURL() {
    const rawHash = window.location.hash.toLowerCase().replace('#', '');
    const urlParams = new URLSearchParams(window.location.search);
    const rawQuery = urlParams.get('level') ? urlParams.get('level').toLowerCase() : null;
    const targetKey = rawHash || rawQuery;

    if (!targetKey) return;

    let targetLevel = null;
    if (targetKey === 'junior' || targetKey === 'level1' || targetKey === '1') {
      targetLevel = 'junior';
    } else if (targetKey === 'start' || targetKey === 'level2' || targetKey === '2') {
      targetLevel = 'start';
    } else if (targetKey === 'pro' || targetKey === 'level3' || targetKey === '3') {
      targetLevel = 'pro';
    }

    if (targetLevel) {
      switchLevel(targetLevel, false);
    }
  }

  headerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const levelId = tab.getAttribute('data-level');
      switchLevel(levelId);
    });
  });

  // Check URL on load and on hashchange
  initLevelFromURL();
  window.addEventListener('hashchange', initLevelFromURL);



  // 5. Interactive Curriculum Accordion Logic (Scoped per section)
  const accordionSections = document.querySelectorAll('.accordion-section');
  accordionSections.forEach(section => {
    const panels = section.querySelectorAll('.accordion-panel');

    function syncSectionVideos() {
      panels.forEach(p => {
        const video = p.querySelector('.panel-bg-video');
        if (video) {
          if (p.classList.contains('active')) {
            video.play().catch(err => {
              console.log("Autoplay check: ", err);
            });
          } else {
            video.pause();
          }
        }
      });
    }

    if (panels.length > 0) {
      syncSectionVideos();

      panels.forEach(panel => {
        panel.addEventListener('click', () => {
          if (panel.classList.contains('active')) return;
          panels.forEach(p => p.classList.remove('active'));
          panel.classList.add('active');
          syncSectionVideos();
        });
      });
    }
  });


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


  // 7. Interactive 3D STL Viewer using Three.js (Level 2: Start - Rotating)
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

          // Setup swap interval (faster swap: every 1.5 seconds)
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
            spinVelocity = 0.22;
          }, 1500);

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

    function handleResizeLevel2() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width > 0 && height > 0) {
        aspect = width / height;
        if (typeof currentModelRadius !== 'undefined') {
          targetFrustumSize = currentModelRadius * 2.0;
        }
        renderer.setSize(width, height);
        camera.left = currentFrustumSize * aspect / -2;
        camera.right = currentFrustumSize * aspect / 2;
        camera.top = currentFrustumSize / 2;
        camera.bottom = currentFrustumSize / -2;
        camera.updateProjectionMatrix();
      }
    }

    window.addEventListener('resize', handleResizeLevel2);
    setTimeout(handleResizeLevel2, 100);
  }

  // 8. Interactive 3D STL Viewer using Three.js (Level 3: Pro - Floating levitation, NO ROTATION)
  function initStlViewerPro() {
    const container = document.getElementById('stl-viewer-pro');
    if (!container) return;

    const spinner = container.querySelector('.stl-loader-spinner');

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    const files = shuffleArray(['clopotel.stl', 'arculUmf.stl', 'cizz.stl', 'romanita.stl', 'pika.stl']);
    const meshes = [];
    let loadedCount = 0;
    let currentModelRadius = 50;

    const scene = new THREE.Scene();

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

    camera.position.set(100, 100, 100);
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfffaf0, 0.85);
    dirLight1.position.set(120, 150, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xdbe5f5, 0.45);
    dirLight2.position.set(-100, 100, -100);
    scene.add(dirLight2);

    const loader = new THREE.STLLoader();

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

    files.forEach((file, index) => {
      loader.load(file, function (geometry) {
        geometry.center();
        geometry.computeBoundingSphere();

        const material = new THREE.MeshStandardMaterial({
          color: getRandomOrangeColor(),
          roughness: 0.3,
          metalness: 0.15,
          flatShading: false
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Fixed orientation - NO CONTINUOUS ROTATION
        mesh.rotation.x = THREE.MathUtils.degToRad(-140);
        mesh.rotation.y = THREE.MathUtils.degToRad(0);
        mesh.rotation.z = THREE.MathUtils.degToRad(45);

        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 0;

        mesh.visible = (index === 0);
        mesh.currentOffsetY = (index === 0) ? 0 : -100;
        mesh.targetOffsetY = (index === 0) ? 0 : -100;
        mesh.scale.set(1, 1, 1);

        scene.add(mesh);
        meshes[index] = mesh;
        loadedCount++;

        if (loadedCount === files.length) {
          if (spinner) {
            spinner.style.display = 'none';
          }

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

          // Setup swap interval for Pro level: outgoing slides UP, incoming slides in from DOWN
          let activeIndex = 0;
          const slideDistance = radius * 2.5;

          setInterval(() => {
            const oldIndex = activeIndex;
            activeIndex = (activeIndex + 1) % files.length;

            const slideDist = currentModelRadius * 2.5;

            // Outgoing model slides UP out of frame
            meshes[oldIndex].targetOffsetY = slideDist;

            // Incoming model starts DOWN below frame and slides UP to 0
            meshes[activeIndex].currentOffsetY = -slideDist;
            meshes[activeIndex].targetOffsetY = 0;
            meshes[activeIndex].visible = true;

            const activeRadius = meshes[activeIndex].geometry.boundingSphere.radius;
            currentModelRadius = activeRadius;
            targetFrustumSize = activeRadius * 2.0;
          }, 2000);

          let startTime = Date.now();

          function animate() {
            requestAnimationFrame(animate);

            const elapsedTime = (Date.now() - startTime) * 0.0015;

            // FLOATING LEVITATION MOVEMENT
            const floatOffset = Math.sin(elapsedTime * 2.0) * (currentModelRadius * 0.08);
            const pulseScale = 1 + Math.sin(elapsedTime * 1.5) * 0.02;

            meshes.forEach(m => {
              // Smooth lerp for vertical slide position
              m.currentOffsetY = THREE.MathUtils.lerp(m.currentOffsetY || 0, m.targetOffsetY, 0.12);

              // Set combined Y position (floating levitation + vertical slide offset)
              m.position.y = floatOffset + m.currentOffsetY;

              // Apply pulse scale
              m.scale.set(pulseScale, pulseScale, pulseScale);

              // Hide model when it has slid completely out of frame at the top
              if (m.targetOffsetY > 0 && Math.abs(m.currentOffsetY - m.targetOffsetY) < 2) {
                m.visible = false;
              }
            });

            currentFrustumSize = THREE.MathUtils.lerp(currentFrustumSize, targetFrustumSize, 0.1);
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
        console.error("Error loading STL file for Pro viewer:", file, error);
        if (spinner) {
          spinner.innerHTML = "<span style='color: var(--primary); font-size: 0.85rem;'>Eroare încărcare modele 3D</span>";
        }
      });
    });

    function handleResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width > 0 && height > 0) {
        aspect = width / height;
        if (typeof currentModelRadius !== 'undefined') {
          targetFrustumSize = currentModelRadius * 2.0;
        }
        renderer.setSize(width, height);
        camera.left = currentFrustumSize * aspect / -2;
        camera.right = currentFrustumSize * aspect / 2;
        camera.top = currentFrustumSize / 2;
        camera.bottom = currentFrustumSize / -2;
        camera.updateProjectionMatrix();
      }
    }

    window.addEventListener('resize', handleResize);
    // Initial call after loading completes
    setTimeout(handleResize, 100);
  }

  // Initialize STL Viewers
  initStlViewer();
  initStlViewerPro();

});

