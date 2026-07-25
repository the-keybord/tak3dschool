// TAK Robot Factory - Client JavaScript
document.addEventListener('DOMContentLoaded', () => {
  console.log('TAK Robot Factory Level 1 Initialized');

  // ==========================================
  // 1. LEVEL SWITCHING LOGIC (LEVEL 1, LEVEL 2, PRO)
  // ==========================================
  const levelTabs = document.querySelectorAll('.header-level-tab');
  const pageViews = document.querySelectorAll('.page-view');

  levelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetLevel = tab.getAttribute('data-level');

      // Deactivate all tabs & views
      levelTabs.forEach(t => t.classList.remove('active'));
      pageViews.forEach(v => v.classList.remove('active'));

      // Activate clicked tab
      tab.classList.add('active');

      // Activate target view
      const targetView = document.getElementById(`view-${targetLevel}`);
      if (targetView) {
        targetView.classList.add('active');
      }
    });
  });

  // ==========================================
  // 2. HARDWARE & TEHNOLOGIE COMPONENT INSPECTOR
  // ==========================================
  const componentData = {
    microbit: {
      title: "Placa BBC micro:bit v2 (Noutatea Anului!)",
      desc: "Platforma principală pe care lucrăm în acest an! Conține procesor ARM, matrice de 25 LED-uri, accelerometru, busolă, senzor de lumină/temperatură și difuzor integrat.",
      specs: [
        { label: "Procesor", val: "Nordic nRF52833 ARM" },
        { label: "Display", val: "5x5 LED Matrix" },
        { label: "Senzori", val: "Accelerometru, Busolă, Temp" },
        { label: "Programare", val: "MakeCode Blocks & MicroPython" }
      ],
      codeSnippet: `// Exemplu MakeCode / MicroPython pentru BBC micro:bit
basic.showIcon(IconNames.Heart)
input.onButtonPressed(Button.A, function () {
    basic.showString("ROBOT READY!")
    pins.digitalWritePin(DigitalPin.P0, 1)
})`
    },

    fusion: {
      title: "Autodesk Fusion 360 (Modelează)",
      desc: "Software profesional de proiectare CAD 3D. Elevii învață să schițeze corpul robotului, suporturile de senzori și piesele mecanice personalizate.",
      specs: [
        { label: "Tip Software", val: "Parametric CAD 3D" },
        { label: "Export", val: "Format STL / 3MF pentru printat" },
        { label: "Aplicație", val: "Proiectat șasiu & roti" },
        { label: "Licențiere", val: "Educațională Gratuită" }
      ],
      codeSnippet: `// Fusion 360 Slicing & Printing Parameters
Layer Height: 0.2mm
Infill Density: 20% Gyroid
Nozzle Temp: 210°C (PLA Plastic)
Bed Temp: 60°C`
    },

    motors: {
      title: "Motoare DC & Servo (Deplasare & Brațe)",
      desc: "Motoare electrice cu reductor mecanic de cuplu pentru tracțiune și servomotoare de precizie pentru mecanisme mobile și steering.",
      specs: [
        { label: "Tensiune", val: "3V - 6V DC" },
        { label: "Reductor", val: "1:48 cuplu sporit" },
        { label: "Control", val: "PWM prin micro:bit" },
        { label: "Rotire Servo", val: "0 - 180 grade" }
      ],
      codeSnippet: `// Control viteză motoare DC
servos.P1.setAngle(90) // Pozitionează servo pe centru
pins.analogWritePin(AnalogPin.P2, 800) // Viteză 80% motor`
    },

    ultrasonic: {
      title: "Senzor Ultrasonic & Optic (Reacție la Mediu)",
      desc: "Senzori de distanță HC-SR04 și senzori infraroșu pentru ca robotul să ocolească obstacolele și să urmărească trasee cu linie neagră.",
      specs: [
        { label: "Distanță Măsurare", val: "2 cm - 400 cm" },
        { label: "Unghi Ecou", val: "15 grade" },
        { label: "Senzor IR", val: "Reflexie opticală linie" },
        { label: "Răspuns", val: "< 10 microsecunde" }
      ],
      codeSnippet: `let distance = sonar.ping(DigitalPin.P8, DigitalPin.P9, PingUnit.Centimeters)
if (distance < 15) {
    // Frână automată și viraj
    carTurnRight()
}`
    },

    soldering: {
      title: "Lipit Flit (Soldering) & Asamblare Mecanică",
      desc: "Copiii învață tehnici sigure de lipit cu pistolul de flit, izolarea firelor și montarea mecanică cu șuruburi și piulițe autoblocante.",
      specs: [
        { label: "Echipament", val: "Pistol flit termostatat" },
        { label: "Aliaj", val: "Flit Fără Plumb (Safe)" },
        { label: "Protecție", val: "Tub termocontractabil" },
        { label: "Mecanică", val: "Șuruburi M3 / Piulițe" }
      ],
      codeSnippet: `// Ghid de asamblare mecanică
1. Lipire cabluri pe motoare cu flit
2. Montare motoare pe șasiul printat 3D
3. Fixare placă micro:bit și conectare senzori`
    }
  };

  const compDisplayContainer = document.getElementById('comp-display');
  const compButtons = document.querySelectorAll('.comp-btn');

  function renderComponent(key) {
    const data = componentData[key];
    if (!data || !compDisplayContainer) return;

    let specsHTML = '';
    data.specs.forEach(spec => {
      specsHTML += `
        <div class="spec-box">
          <span class="spec-label">${spec.label}</span>
          <span class="spec-val">${spec.val}</span>
        </div>
      `;
    });

    compDisplayContainer.innerHTML = `
      <div class="comp-display-header">
        <h3 class="comp-display-title">${data.title}</h3>
      </div>
      <div class="comp-display-body">
        <p>${data.desc}</p>
        <div class="comp-specs">
          ${specsHTML}
        </div>
        <div style="margin-top: 1rem;">
          <span class="spec-label" style="margin-bottom: 0.4rem; display:block;">Exemplu de cod / Proiectare:</span>
          <pre class="code-snippet"><code>${escapeHTML(data.codeSnippet)}</code></pre>
        </div>
      </div>
    `;
  }

  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  compButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      compButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const compKey = btn.getAttribute('data-comp');
      renderComponent(compKey);
    });
  });

  // Render initial component (microbit)
  renderComponent('microbit');

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

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
  // 3. SCROLL-DRIVEN ROADMAP PROGRESS & ACTIVE STEP OPENING
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
