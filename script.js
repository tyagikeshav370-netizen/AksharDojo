/* ==========================================================================
   AKSHAR DOJO // NEURAL CADRE & SENSEI ENGINE [MK-2035 COMPLETE]
   ========================================================================== */

// 1. MASTER SENSEI CREDENTIALS
const SENSEI_EMAIL = "tyagikeshav370@gmail.com";
const SENSEI_PASS = "admin1235";

// Belt Requirements (Attendance threshold to qualify for belt testing)
const BELT_REQS = {
  White: 20,
  Yellow: 35,
  Orange: 50,
  Green: 70,
  Blue: 95,
  Purple: 125,
  Brown: 160,
  Black: 250
};

// Seed Cadres
const DEFAULT_CADRE = [
  {
    id: 1,
    name: "Aarav Sharma",
    phone: "919876543210",
    belt: "Yellow",
    attendance: 24,
    feeStatus: "PAID",
    isBanned: false,
    medals: { gold: 1, silver: 2, bronze: 0 },
    certs: []
  },
  {
    id: 2,
    name: "Rhea Verma",
    phone: "919811223344",
    belt: "Green",
    attendance: 52,
    feeStatus: "DUE",
    isBanned: false,
    medals: { gold: 3, silver: 1, bronze: 2 },
    certs: []
  },
  {
    id: 3,
    name: "Kabir Patel",
    phone: "919822334455",
    belt: "White",
    attendance: 14,
    feeStatus: "PAID",
    isBanned: false,
    medals: { gold: 0, silver: 1, bronze: 1 },
    certs: []
  },
  {
    id: 4,
    name: "Ananya Gupta",
    phone: "919833445566",
    belt: "Orange",
    attendance: 38,
    feeStatus: "PAID",
    isBanned: false,
    medals: { gold: 2, silver: 0, bronze: 1 },
    certs: []
  },
  {
    id: 5,
    name: "Devansh Singh",
    phone: "919844556677",
    belt: "Brown",
    attendance: 142,
    feeStatus: "DUE",
    isBanned: false,
    medals: { gold: 4, silver: 3, bronze: 2 },
    certs: []
  }
];

let students = JSON.parse(localStorage.getItem("akshar_students")) || DEFAULT_CADRE;
let currentStudent = null;
let isAdminAuthenticated = false;

// DOM View Panels
const viewGateway = document.getElementById("view-gateway");
const viewStudentLogin = document.getElementById("view-student-login");
const viewAdminLogin = document.getElementById("view-admin-login");
const viewStudentPortal = document.getElementById("view-student-portal");
const viewAdminPortal = document.getElementById("view-admin-portal");

const btnNavGateway = document.getElementById("btn-nav-gateway");
const btnNavLogout = document.getElementById("btn-nav-logout");

function saveCadreData() {
  localStorage.setItem("akshar_students", JSON.stringify(students));
  if (currentStudent) {
    currentStudent = students.find(s => s.id === currentStudent.id) || null;
    if (currentStudent) renderStudentDashboard();
  }
  if (isAdminAuthenticated) renderAdminRoster();
}

function switchView(target) {
  [viewGateway, viewStudentLogin, viewAdminLogin, viewStudentPortal, viewAdminPortal].forEach(v => {
    if (v) v.classList.add("hidden");
  });
  if (target) target.classList.remove("hidden");

  if (target === viewGateway) {
    if (btnNavGateway) btnNavGateway.classList.remove("hidden");
    if (btnNavLogout) btnNavLogout.classList.add("hidden");
  } else {
    if (btnNavGateway) btnNavGateway.classList.add("hidden");
    if (btnNavLogout) btnNavLogout.classList.remove("hidden");
  }
}

window.showGateway = function() {
  currentStudent = null;
  isAdminAuthenticated = false;
  switchView(viewGateway);
};

if (btnNavGateway) btnNavGateway.addEventListener("click", showGateway);
if (btnNavLogout) btnNavLogout.addEventListener("click", showGateway);

const cardPickStudent = document.getElementById("card-pick-student");
if (cardPickStudent) {
  cardPickStudent.addEventListener("click", () => switchView(viewStudentLogin));
}

const cardPickAdmin = document.getElementById("card-pick-admin");
if (cardPickAdmin) {
  cardPickAdmin.addEventListener("click", () => switchView(viewAdminLogin));
}

// ==========================================================================
// 1. SENSEI COMMAND CONSOLE LOGIN
// ==========================================================================
const formAdminLogin = document.getElementById("form-admin-login");
if (formAdminLogin) {
  formAdminLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const rawEmail = document.getElementById("admin-login-email").value || "";
    const rawPass = document.getElementById("admin-login-pass").value || "";
    
    const emailClean = rawEmail.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().toLowerCase();
    const passClean = rawPass.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().toLowerCase();
    const err = document.getElementById("admin-login-err");

    if (emailClean === SENSEI_EMAIL.toLowerCase() && passClean === SENSEI_PASS) {
      isAdminAuthenticated = true;
      document.getElementById("admin-login-email").value = "";
      document.getElementById("admin-login-pass").value = "";
      if (err) err.textContent = "";
      renderAdminRoster();
      switchView(viewAdminPortal);
    } else {
      if (err) err.textContent = "[!] REJECTED: INVALID COMMAND CLEARANCE";
    }
  });
}

// ==========================================================================
// 2. STUDENT LOGIN
// ==========================================================================
const formStudentLogin = document.getElementById("form-student-login");
if (formStudentLogin) {
  formStudentLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("stu-login-name").value.trim().toLowerCase();
    const phoneInput = document.getElementById("stu-login-phone").value.trim().replace(/[^0-9]/g, "");
    const err = document.getElementById("stu-login-err");

    const match = students.find(s => {
      const sName = s.name.toLowerCase().trim();
      const sPhone = (s.phone || "").replace(/[^0-9]/g, "");
      const phoneMatches = sPhone.includes(phoneInput) || phoneInput.includes(sPhone);
      const nameMatches = sName.includes(nameInput) || nameInput.includes(sName);
      return nameMatches && phoneMatches;
    });

    if (!match) {
      err.textContent = "[!] STUDENT NOT FOUND. ENSURE NAME AND PHONE NUMBER MATCH.";
      return;
    }

    if (match.isBanned) {
      err.textContent = "[!] CADRE ACCESS SUSPENDED. CONTACT SENSEI NIKHIL SHARMA.";
      return;
    }

    err.textContent = "";
    currentStudent = match;
    document.getElementById("stu-login-name").value = "";
    document.getElementById("stu-login-phone").value = "";
    renderStudentDashboard();
    switchView(viewStudentPortal);
  });
}

function renderStudentDashboard() {
  if (!currentStudent) return;
  const s = currentStudent;

  const nameEl = document.getElementById("stu-portal-name");
  if (nameEl) nameEl.textContent = s.name.toUpperCase();

  const req = BELT_REQS[s.belt] || 100;
  const progress = Math.min(100, Math.round((s.attendance / req) * 100));
  const offset = 157 - (157 * progress / 100);

  const rankEl = document.getElementById("stu-portal-rank");
  if (rankEl) {
    rankEl.textContent = `${s.belt.toUpperCase()} BELT // ${s.attendance} CLASSES LOGGED (${progress}% TO TEST)`;
  }
  
  const arcEl = document.getElementById("stu-portal-belt-arc");
  if (arcEl) arcEl.style.strokeDashoffset = offset;
  
  const initEl = document.getElementById("stu-portal-belt-initial");
  if (initEl) initEl.textContent = s.belt[0];

  const feeBadge = document.getElementById("stu-portal-fee");
  if (feeBadge) {
    feeBadge.textContent = s.feeStatus;
    feeBadge.className = `fee-badge ${s.feeStatus}`;
  }

  const gEl = document.getElementById("count-gold");
  const sEl = document.getElementById("count-silver");
  const bEl = document.getElementById("count-bronze");

  if (gEl) gEl.textContent = s.medals ? s.medals.gold || 0 : 0;
  if (sEl) sEl.textContent = s.medals ? s.medals.silver || 0 : 0;
  if (bEl) bEl.textContent = s.medals ? s.medals.bronze || 0 : 0;

  renderCertificates();
}

window.recordStudentCheckin = function() {
  if (!currentStudent) return;
  currentStudent.attendance += 1;
  saveCadreData();
  alert(`OSS! Session check-in logged for ${currentStudent.name}. Total attendance: ${currentStudent.attendance} classes.`);
};

// Certificate Upload
const certUploadInput = document.getElementById("cert-upload-input");
if (certUploadInput) {
  certUploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file || !currentStudent) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert("Image exceeds memory size limit. Please select an image under 2.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      if (!currentStudent.certs) currentStudent.certs = [];
      currentStudent.certs.push(evt.target.result);
      saveCadreData();
      renderCertificates();
    };
    reader.readAsDataURL(file);
  });
}

function renderCertificates() {
  const gallery = document.getElementById("certificate-gallery");
  if (!gallery) return;
  if (!currentStudent || !currentStudent.certs || currentStudent.certs.length === 0) {
    gallery.innerHTML = `<span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim); grid-column: 1/-1;">NO CERTIFICATES ARCHIVED YET. TAP '+ UPLOAD' TO ADD.</span>`;
    return;
  }

  gallery.innerHTML = currentStudent.certs.map((c, i) => `
    <div class="cert-thumb">
      <img src="${c}" alt="Certificate" onclick="viewFullCert('${c}')">
      <button type="button" class="delete-cert" onclick="deleteCert(${i})">×</button>
    </div>
  `).join("");
}

window.deleteCert = function(idx) {
  if (confirm("Permanently delete this certificate from your profile?")) {
    currentStudent.certs.splice(idx, 1);
    saveCadreData();
    renderCertificates();
  }
};

window.viewFullCert = function(src) {
  const win = window.open("");
  win.document.write(`<body style="background:#000000;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${src}" style="max-width:95vw;max-height:95vh;border-radius:8px;box-shadow:0 0 30px rgba(255,255,255,0.5);"></body>`);
};

// ==========================================================================
// 3. ADMIN ROSTER MANAGEMENT & DIRECT ATTENDANCE EDITING
// ==========================================================================
function renderAdminRoster() {
  const cluster = document.getElementById("admin-roster-cluster");
  if (!cluster) return;
  const searchEl = document.getElementById("admin-search");
  const q = searchEl ? searchEl.value.toLowerCase().trim() : "";
  const filtered = students.filter(s => s.name.toLowerCase().includes(q) || s.belt.toLowerCase().includes(q));

  if (filtered.length === 0) {
    cluster.innerHTML = `<div style="text-align:center; padding:20px; font-family:var(--font-mono); color:var(--text-dim);">NO CADRE RECORDS MATCH YOUR FILTER.</div>`;
    return;
  }

  cluster.innerHTML = filtered.map(s => {
    const gold = s.medals ? s.medals.gold || 0 : 0;
    const silver = s.medals ? s.medals.silver || 0 : 0;
    const bronze = s.medals ? s.medals.bronze || 0 : 0;

    return `
      <div class="bio-capsule ${s.isBanned ? 'banned' : ''}">
        <div class="bio-profile">
          <div class="student-identity">
            <h3>${s.name} ${s.isBanned ? '<span class="ban-tag">BANNED</span>' : ''}</h3>
            <span>${s.belt.toUpperCase()} BELT // Ph: ${s.phone || 'N/A'}</span>
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--laser-white); margin-top: 4px;">
              HONORS: 🥇 ${gold} | 🥈 ${silver} | 🥉 ${bronze}
            </div>
          </div>
        </div>

        <div class="telemetry-actions">
          <!-- Stepper and Directly Editable Attendance Input -->
          <div class="pill-counter">
            <button type="button" class="count-step-btn" title="Decrease class count" onclick="stepAttendance(${s.id}, -1)">-</button>
            <input type="number" class="count-input" value="${s.attendance}" min="0" title="Click to manually edit attendance number" onchange="setAttendance(${s.id}, this.value)">
            <button type="button" class="count-step-btn" title="Increase class count" onclick="stepAttendance(${s.id}, 1)">+</button>
          </div>

          <button type="button" class="oval-btn" title="Award Gold Medal" onclick="awardMedal(${s.id}, 'gold')">🥇+</button>
          <button type="button" class="oval-btn" title="Award Silver Medal" onclick="awardMedal(${s.id}, 'silver')">🥈+</button>
          <button type="button" class="oval-btn" title="Award Bronze Medal" onclick="awardMedal(${s.id}, 'bronze')">🥉+</button>

          <div class="fee-badge ${s.feeStatus}" title="Toggle fee status" onclick="toggleFee(${s.id})">${s.feeStatus}</div>

          <button type="button" class="oval-btn ${s.isBanned ? 'primary' : 'danger'}" onclick="toggleBan(${s.id})">
            ${s.isBanned ? 'UNBAN' : 'BAN'}
          </button>

          <button type="button" class="icon-pill-btn" title="Send WhatsApp alert" onclick="routeWhatsApp(${s.id})">WA</button>
          <button type="button" class="oval-btn danger" title="Delete record" onclick="deleteStudent(${s.id})">DEL</button>
        </div>
      </div>
    `;
  }).join("");
}

// Micro-step (+1 / -1)
window.stepAttendance = function(id, delta) {
  const s = students.find(item => item.id === id);
  if (s) {
    s.attendance = Math.max(0, s.attendance + delta);
    saveCadreData();
  }
};

// Direct Numeric Override by Sensei
window.setAttendance = function(id, value) {
  const s = students.find(item => item.id === id);
  if (s) {
    const num = parseInt(value, 10);
    s.attendance = isNaN(num) || num < 0 ? 0 : num;
    saveCadreData();
  }
};

window.awardMedal = function(id, type) {
  const s = students.find(item => item.id === id);
  if (s) {
    if (!s.medals) s.medals = { gold: 0, silver: 0, bronze: 0 };
    s.medals[type] = (s.medals[type] || 0) + 1;
    saveCadreData();
  }
};

window.toggleFee = function(id) {
  const s = students.find(item => item.id === id);
  if (s) {
    s.feeStatus = s.feeStatus === "PAID" ? "DUE" : "PAID";
    saveCadreData();
  }
};

window.toggleBan = function(id) {
  const s = students.find(item => item.id === id);
  if (s) {
    s.isBanned = !s.isBanned;
    saveCadreData();
  }
};

window.deleteStudent = function(id) {
  if (confirm("Are you sure you want to permanently delete this student record?")) {
    students = students.filter(s => s.id !== id);
    saveCadreData();
  }
};

window.routeWhatsApp = function(id) {
  const s = students.find(item => item.id === id);
  if (!s || !s.phone) return alert("No phone linked to this cadre.");
  const cleanPhone = s.phone.replace(/[^0-9]/g, "");
  const msg = s.feeStatus === "DUE" 
    ? `OSS! Formal notice from Sensei Nikhil Sharma (Akshar Karate Academy): ${s.name}'s monthly training fee is currently pending. Please arrange clearance at the next session.`
    : `OSS! Akshar Karate Academy progress report: Cadre ${s.name} has completed ${s.attendance} sessions and is advancing toward their next belt test!`;
  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
};

// Register Drawer
const btnToggleRegister = document.getElementById("btn-toggle-register");
if (btnToggleRegister) {
  btnToggleRegister.addEventListener("click", () => {
    const drawer = document.getElementById("register-drawer");
    if (drawer) drawer.classList.toggle("hidden");
  });
}

const btnConfirmRegister = document.getElementById("btn-confirm-register");
if (btnConfirmRegister) {
  btnConfirmRegister.addEventListener("click", () => {
    const name = document.getElementById("reg-name").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const belt = document.getElementById("reg-belt").value;

    if (!name || !phone) return alert("Please enter both student name and WhatsApp phone.");

    const newStudent = {
      id: Date.now(),
      name,
      phone,
      belt,
      attendance: 1,
      feeStatus: "PAID",
      isBanned: false,
      medals: { gold: 0, silver: 0, bronze: 0 },
      certs: []
    };

    students.unshift(newStudent);
    saveCadreData();

    document.getElementById("reg-name").value = "";
    document.getElementById("reg-phone").value = "";
    const drawer = document.getElementById("register-drawer");
    if (drawer) drawer.classList.add("hidden");
  });
}

const adminSearch = document.getElementById("admin-search");
if (adminSearch) adminSearch.addEventListener("input", renderAdminRoster);

// ==========================================================================
// 4. SPARRING ROUND CHRONOMETER
// ==========================================================================
let timerTotalSec = 180;
let timerCurSec = 180;
let timerTimer = null;
let isTimerRunning = false;

const timerArc = document.getElementById("timer-arc");
const chronoDigits = document.getElementById("chrono-digits");
const toggleRoundBtn = document.getElementById("btn-toggle-round");
const resetRoundBtn = document.getElementById("btn-reset-round");

function updateChronometerUI() {
  if (!chronoDigits || !timerArc) return;
  const m = Math.floor(timerCurSec / 60).toString().padStart(2, "0");
  const s = (timerCurSec % 60).toString().padStart(2, "0");
  chronoDigits.textContent = `${m}:${s}`;
  const offset = 785 - (785 * timerCurSec / timerTotalSec);
  timerArc.style.strokeDashoffset = offset;
}

if (toggleRoundBtn) {
  toggleRoundBtn.addEventListener("click", () => {
    if (isTimerRunning) {
      clearInterval(timerTimer);
      isTimerRunning = false;
      toggleRoundBtn.textContent = "ENGAGE";
    } else {
      isTimerRunning = true;
      toggleRoundBtn.textContent = "HALT";
      timerTimer = setInterval(() => {
        timerCurSec--;
        updateChronometerUI();
        if (timerCurSec <= 0) {
          clearInterval(timerTimer);
          isTimerRunning = false;
          toggleRoundBtn.textContent = "ENGAGE";
          alert("ROUND COMPLETE // TIME EXPIRED");
        }
      }, 1000);
    }
  });
}

if (resetRoundBtn) {
  resetRoundBtn.addEventListener("click", () => {
    clearInterval(timerTimer);
    isTimerRunning = false;
    timerCurSec = timerTotalSec;
    if (toggleRoundBtn) toggleRoundBtn.textContent = "ENGAGE";
    updateChronometerUI();
  });
}
updateChronometerUI();

// ==========================================================================
// 5. 3D GYROSCOPIC MOTION NET (STABLE CURSOR & REPEL PHYSICS)
// ==========================================================================
(function initMotionNet() {
  const canvas = document.getElementById("motion-net-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createNet();
  });

  const spacing = 55;
  let cols = Math.ceil(width / spacing) + 2;
  let rows = Math.ceil(height / spacing) + 2;
  let points = [];

  let tiltX = 0, tiltY = 0, targetTiltX = 0, targetTiltY = 0;
  let mouseX = -9999, mouseY = -9999;
  let isPointerActive = false;

  function createNet() {
    cols = Math.ceil(width / spacing) + 2;
    rows = Math.ceil(height / spacing) + 2;
    points = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        points.push({
          baseX: (c - 1) * spacing,
          baseY: (r - 1) * spacing,
          x: (c - 1) * spacing,
          y: (r - 1) * spacing,
          r,
          c
        });
      }
    }
  }
  createNet();

  // Mobile Device Orientation
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma !== null && e.beta !== null) {
        targetTiltX = (e.gamma / 45) * 20;
        targetTiltY = ((e.beta - 40) / 45) * 20;
      }
    }, { passive: true });
  }

  // Mouse Tracking
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isPointerActive = true;
    targetTiltX = ((e.clientX - width / 2) / (width / 2)) * 18;
    targetTiltY = ((e.clientY - height / 2) / (height / 2)) * 18;
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    isPointerActive = false;
    mouseX = -9999;
    mouseY = -9999;
  });

  // Touch Support
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      isPointerActive = true;
    }
  }, { passive: true });

  window.addEventListener("touchend", () => {
    isPointerActive = false;
    mouseX = -9999;
    mouseY = -9999;
  });

  let time = 0;
  function renderNet() {
    ctx.clearRect(0, 0, width, height);

    // Smooth inertia
    tiltX += (targetTiltX - tiltX) * 0.05;
    tiltY += (targetTiltY - tiltY) * 0.05;
    time += 0.02;

    const radius = 120; // Smooth repel boundary

    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      // Ambient lattice wave
      const wave = Math.sin(time + (p.r * 0.5) + (p.c * 0.3)) * 3;

      let targetX = p.baseX + tiltX * (1 + p.r * 0.03);
      let targetY = p.baseY + tiltY * (1 + p.c * 0.03) + wave;

      // Cursor repel calculation
      if (isPointerActive) {
        const dx = mouseX - targetX;
        const dy = mouseY - targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius && dist > 0) {
          const force = (1 - dist / radius) * 28;
          targetX -= (dx / dist) * force;
          targetY -= (dy / dist) * force;
        }
      }

      // Spring-damper smoothing
      p.x += (targetX - p.x) * 0.15;
      p.y += (targetY - p.y) * 0.15;
    }

    // Render Grid Connections
    ctx.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const p = points[idx];

        // Horizontal links
        if (c < cols - 1) {
          const nextRight = points[idx + 1];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nextRight.x, nextRight.y);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
          ctx.stroke();
        }

        // Vertical links
        if (r < rows - 1) {
          const nextDown = points[idx + cols];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nextDown.x, nextDown.y);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(renderNet);
  }

  renderNet();
})();