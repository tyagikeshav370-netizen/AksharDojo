// ==========================================
// AKSHAR DOJO - COMPLETE MONOCHROME NEURAL ENGINE
// ==========================================

const UPI_ID = "8178615663@ibl";
const ACADEMY_NAME = "Akshar Karate Academy";
const WHATSAPP_NUM = "918178615663";
const ADMIN_PIN = "1234";

// --- STATE MANAGEMENT ---
let students = JSON.parse(localStorage.getItem("akshar_students")) || [
  { id: 1, name: "Aarav Sharma", phone: "9876543210", belt: "Yellow", classes: 14, fee: "PAID", gold: 1, silver: 0, bronze: 1, certs: [] },
  { id: 2, name: "Kabir Verma", phone: "9876543211", belt: "Green", classes: 28, fee: "PAID", gold: 2, silver: 1, bronze: 0, certs: [] }
];

let currentStudent = null;
let timerInterval = null;
let timeLeft = 180;
let isTimerRunning = false;
let selectedPlan = null;

function saveStudents() {
  localStorage.setItem("akshar_students", JSON.stringify(students));
}

// --- ROUTER & VIEW CONTROLLER ---
function switchView(viewId) {
  document.querySelectorAll(".view-panel").forEach(el => el.classList.add("hidden"));
  const target = document.getElementById(viewId);
  if (target) target.classList.remove("hidden");

  const btnGateway = document.getElementById("btn-nav-gateway");
  const btnLogout = document.getElementById("btn-nav-logout");

  if (viewId === "view-gateway") {
    btnGateway.classList.remove("hidden");
    btnLogout.classList.add("hidden");
  } else {
    btnGateway.classList.add("hidden");
    btnLogout.classList.remove("hidden");
  }
}

function showGateway() {
  currentStudent = null;
  switchView("view-gateway");
}

function openStudentLogin() {
  switchView("view-student-login");
}

function openAdminLogin() {
  switchView("view-admin-login");
}

// --- STUDENT LOGIN ---
document.getElementById("form-student-login")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("stu-login-name").value.trim().toLowerCase();
  const phone = document.getElementById("stu-login-phone").value.trim();
  const err = document.getElementById("stu-login-err");

  const found = students.find(s => s.name.toLowerCase() === name && s.phone === phone);
  if (found) {
    currentStudent = found;
    err.innerText = "";
    loadStudentPortal();
    switchView("view-student-portal");
  } else {
    err.innerText = "Cadre record not found. Check name and phone or ask Sensei.";
  }
});

// --- ADMIN LOGIN ---
document.getElementById("form-admin-login")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const pass = document.getElementById("admin-login-pass").value;
  const err = document.getElementById("admin-login-err");

  if (pass === ADMIN_PIN) {
    err.innerText = "";
    loadAdminPortal();
    switchView("view-admin-portal");
  } else {
    err.innerText = "Invalid instructor passcode!";
  }
});

// --- STUDENT PORTAL LOGIC ---
function loadStudentPortal() {
  if (!currentStudent) return;
  document.getElementById("stu-portal-name").innerText = currentStudent.name.toUpperCase();
  document.getElementById("stu-portal-rank").innerText = `${currentStudent.belt.toUpperCase()} BELT // ${currentStudent.classes} SESSIONS LOGGED`;
  document.getElementById("stu-portal-belt-initial").innerText = currentStudent.belt.charAt(0).toUpperCase();

  const feeBadge = document.getElementById("stu-portal-fee");
  feeBadge.innerText = currentStudent.fee;
  feeBadge.className = `fee-badge ${currentStudent.fee}`;

  document.getElementById("count-gold").innerText = currentStudent.gold || 0;
  document.getElementById("count-silver").innerText = currentStudent.silver || 0;
  document.getElementById("count-bronze").innerText = currentStudent.bronze || 0;

  renderCertificates();
  checkDojoPlan();
  renderTournamentUI();
}

function recordStudentCheckin() {
  if (!currentStudent) return;
  currentStudent.classes = (currentStudent.classes || 0) + 1;
  saveStudents();
  loadStudentPortal();
  alert("Attendance logged for today's session!");
}

// Certificate Upload (Local Image Store)
document.getElementById("cert-upload-input")?.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file || !currentStudent) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    if (!currentStudent.certs) currentStudent.certs = [];
    currentStudent.certs.push(evt.target.result);
    saveStudents();
    renderCertificates();
  };
  reader.readAsDataURL(file);
});

function renderCertificates() {
  const gallery = document.getElementById("certificate-gallery");
  if (!gallery || !currentStudent) return;
  gallery.innerHTML = "";

  (currentStudent.certs || []).forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "6px";
    img.style.border = "1px solid #444";
    gallery.appendChild(img);
  });
}

// --- ADMIN CONSOLE LOGIC ---
function loadAdminPortal() {
  renderRoster();
  renderTournamentUI();
}

document.getElementById("btn-toggle-register")?.addEventListener("click", () => {
  document.getElementById("register-drawer")?.classList.toggle("hidden");
});

document.getElementById("btn-confirm-register")?.addEventListener("click", () => {
  const name = document.getElementById("reg-name").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const belt = document.getElementById("reg-belt").value;

  if (!name || !phone) {
    alert("Please fill name and phone.");
    return;
  }

  const newStu = {
    id: Date.now(),
    name,
    phone,
    belt,
    classes: 0,
    fee: "DUE",
    gold: 0,
    silver: 0,
    bronze: 0,
    certs: []
  };

  students.push(newStu);
  saveStudents();
  renderRoster();

  document.getElementById("reg-name").value = "";
  document.getElementById("reg-phone").value = "";
  document.getElementById("register-drawer")?.classList.add("hidden");
  alert(`Enrolled ${name} successfully!`);
});

document.getElementById("admin-search")?.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  renderRoster(term);
});

function renderRoster(filter = "") {
  const cluster = document.getElementById("admin-roster-cluster");
  if (!cluster) return;
  cluster.innerHTML = "";

  const list = students.filter(s => s.name.toLowerCase().includes(filter) || s.belt.toLowerCase().includes(filter));

  list.forEach(stu => {
    const card = document.createElement("div");
    card.className = "bio-capsule";
    card.style.justifyContent = "space-between";
    card.style.alignItems = "center";
    card.style.marginBottom = "10px";

    card.innerHTML = `
      <div>
        <h4 style="margin: 0; color: #fff;">${stu.name} (${stu.belt})</h4>
        <small style="color: #888;">📱 ${stu.phone} | Sessions: ${stu.classes}</small>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="oval-btn" onclick="adminToggleFee(${stu.id})">${stu.fee}</button>
        <button class="oval-btn primary" onclick="adminAddClass(${stu.id})">+1 Class</button>
      </div>
    `;
    cluster.appendChild(card);
  });
}

function adminToggleFee(id) {
  const stu = students.find(s => s.id === id);
  if (stu) {
    stu.fee = stu.fee === "PAID" ? "DUE" : "PAID";
    saveStudents();
    renderRoster();
  }
}

function adminAddClass(id) {
  const stu = students.find(s => s.id === id);
  if (stu) {
    stu.classes += 1;
    saveStudents();
    renderRoster();
  }
}

// --- UPI QR & AT-HOME FEE ENGINE ---
function showUPIPayment(amount, planName, days) {
  selectedPlan = { amount, planName, days };
  const box = document.getElementById("upi-payment-box");
  const title = document.getElementById("upi-pay-title");
  const qr = document.getElementById("upi-qr-image");
  const deepLink = document.getElementById("upi-deep-link");
  const wa = document.getElementById("whatsapp-receipt-link");

  title.innerText = `Pay ₹${amount} for ${planName}`;
  const upiUri = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(ACADEMY_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(planName)}`;

  // Public QR Code Generator API
  qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;
  deepLink.href = upiUri;

  const msg = `Hello Sensei, I have paid ₹${amount} for ${planName}. Please find my payment screenshot attached.`;
  wa.href = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`;

  box.style.display = "block";
}

function adminManuallyGrantPlan(planName, days) {
  const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);
  localStorage.setItem("dojo_plan", planName);
  localStorage.setItem("dojo_plan_expiry", expiry.toString());
  alert(`Granted ${planName} for ${days} days!`);
  checkDojoPlan();
}

function checkDojoPlan() {
  const badge = document.getElementById("current-plan-badge");
  const plan = localStorage.getItem("dojo_plan") || "Basic";
  const expiry = parseInt(localStorage.getItem("dojo_plan_expiry") || "0", 10);

  if (plan !== "Basic" && Date.now() > expiry) {
    localStorage.setItem("dojo_plan", "Basic");
    localStorage.removeItem("dojo_plan_expiry");
    alert("Notice: Subscription plan has expired. Degraded to Basic plan.");
    if (badge) badge.innerText = "Basic (Expired)";
  } else if (badge) {
    badge.innerText = plan;
  }
}

// --- TOURNAMENT BROADCASTER (ADMIN & CADRE) ---
function adminAddTournament() {
  const name = prompt("Enter Tournament Name & Venue:");
  if (!name) return;
  const photo = prompt("Poster Image URL (leave blank if none):") || "";

  const tourney = { name, photo, date: new Date().toLocaleDateString() };
  localStorage.setItem("upcoming_tournament", JSON.stringify(tourney));
  alert(`Tournament "${name}" published!`);
  renderTournamentUI();
}

function adminClearTournament() {
  if (confirm("Remove the active tournament announcement?")) {
    localStorage.removeItem("upcoming_tournament");
    renderTournamentUI();
  }
}

function renderTournamentUI() {
  const studentBox = document.getElementById("student-tournament-display");
  const adminBox = document.getElementById("admin-tournament-display");
  const data = localStorage.getItem("upcoming_tournament");

  const content = !data 
    ? "<p style='color: #666; font-size: 0.8rem;'>No tournaments currently scheduled.</p>"
    : (() => {
        const t = JSON.parse(data);
        return `
          <div style="background: rgba(255,255,255,0.04); padding: 10px; border-radius: 6px; margin: 6px 0;">
            <h4 style="margin: 0 0 6px 0; color: #fff;">🥋 ${t.name}</h4>
            ${t.photo ? `<img src="${t.photo}" style="max-width: 100%; border-radius: 4px; margin: 6px 0;" />` : ''}
            <div><small style="color: #888;">Posted: ${t.date}</small></div>
          </div>
        `;
      })();

  if (studentBox) studentBox.innerHTML = content;
  if (adminBox) adminBox.innerHTML = content;
}

// --- SPARRING TIMER ---
const timerDigits = document.getElementById("chrono-digits");
const btnToggleTimer = document.getElementById("btn-toggle-round");
const btnResetTimer = document.getElementById("btn-reset-round");

function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  if (timerDigits) {
    timerDigits.innerText = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
}

btnToggleTimer?.addEventListener("click", () => {
  if (isTimerRunning) {
    clearInterval(timerInterval);
    isTimerRunning = false;
    btnToggleTimer.innerText = "RESUME";
  } else {
    isTimerRunning = true;
    btnToggleTimer.innerText = "PAUSE";
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        isTimerRunning = false;
        alert("Bout Finished! Round complete.");
        btnToggleTimer.innerText = "ENGAGE";
      }
    }, 1000);
  }
});

btnResetTimer?.addEventListener("click", () => {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timeLeft = 180;
  updateTimerDisplay();
  if (btnToggleTimer) btnToggleTimer.innerText = "ENGAGE";
});

// --- 3D GYROSCOPIC CANVAS BACKGROUND NET ---
const canvas = document.getElementById("motion-net-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let width, height;
  let points = [];

  function resizeNet() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    points = [];
    for (let i = 0; i < 35; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8
      });
    }
  }

  function drawNet() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";

    for (let i = 0; i < points.length; i++) {
      let p = points[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < points.length; j++) {
        let p2 = points[j];
        let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawNet);
  }

  window.addEventListener("resize", resizeNet);
  resizeNet();
  drawNet();
}

// Initial checks on launch
window.addEventListener("DOMContentLoaded", () => {
  checkDojoPlan();
  renderTournamentUI();
});
