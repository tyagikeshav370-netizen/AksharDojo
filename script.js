/* =========================================================
   AKSHAR DOJO: ZERO-SCRAMBLE GEOMETRIC WARP MESH
   ========================================================= */
(function() {
  const canvas = document.getElementById("motion-net-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0, height = 0;
  let cols = 0, rows = 0;
  const GAP = 55;
  const RADIUS = 180;
  const STRENGTH = 38;

  const cursor = { x: -9999, y: -9999, targetX: -9999, targetY: -9999, active: false };

  window.addEventListener("pointermove", (e) => {
    cursor.targetX = e.clientX;
    cursor.targetY = e.clientY;
    cursor.active = true;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      cursor.targetX = e.touches[0].clientX;
      cursor.targetY = e.touches[0].clientY;
      cursor.active = true;
    }
  }, { passive: true });

  window.addEventListener("pointerleave", () => { cursor.active = false; cursor.targetX = -9999; cursor.targetY = -9999; });
  window.addEventListener("touchend", () => { cursor.active = false; cursor.targetX = -9999; cursor.targetY = -9999; });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cols = Math.ceil(width / GAP) + 2;
    rows = Math.ceil(height / GAP) + 2;
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    if (cursor.active) {
      cursor.x += (cursor.targetX - cursor.x) * 0.18;
      cursor.y += (cursor.targetY - cursor.y) * 0.18;
    } else {
      cursor.x = -9999;
      cursor.y = -9999;
    }

    const matrix = [];
    for (let c = 0; c < cols; c++) {
      matrix[c] = [];
      const originX = c * GAP;

      for (let r = 0; r < rows; r++) {
        const originY = r * GAP;
        let posX = originX;
        let posY = originY;
        let dist = 9999;

        if (cursor.active) {
          const dx = cursor.x - originX;
          const dy = cursor.y - originY;
          dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < RADIUS && dist > 0.001) {
            const pull = (1 - dist / RADIUS) * STRENGTH;
            posX += (dx / dist) * pull;
            posY += (dy / dist) * pull;
          }
        }

        matrix[c][r] = { x: posX, y: posY, dist: dist };
      }
    }

    ctx.lineWidth = 1;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const p = matrix[c][r];
        const alpha = p.dist < RADIUS ? 0.35 : 0.08;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;

        if (c + 1 < cols) {
          const pRight = matrix[c + 1][r];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pRight.x, pRight.y);
          ctx.stroke();
        }

        if (r + 1 < rows) {
          const pBottom = matrix[c][r + 1];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pBottom.x, pBottom.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(render);
})();

/* =========================================================
   SECURITY & SENSEI PASSCODE
   ========================================================= */
function checkSenseiPass(input) {
  return input === "admin1235" || input === "Admin1235";
}

/* =========================================================
   STUDENT ROSTER DATA STORE
   ========================================================= */
const DEFAULT_STUDENTS = [
  { id: "1", name: "Aarav Sharma", phone: "9876543210", belt: "Yellow", classes: 14, gold: 1, silver: 0, bronze: 1, banned: false, plan: "1 Month", planExpiry: Date.now() + 25 * 86400000 },
  { id: "2", name: "Rohan Verma", phone: "8765432109", belt: "Green", classes: 28, gold: 2, silver: 1, bronze: 0, banned: false, plan: "1 Year", planExpiry: Date.now() + 300 * 86400000 },
  { id: "3", name: "Priya Tyagi", phone: "9123456780", belt: "White", classes: 4, gold: 0, silver: 0, bronze: 0, banned: false, plan: "Basic", planExpiry: 0 }
];

function getStudents() {
  const data = localStorage.getItem("dojo_roster");
  if (!data) {
    localStorage.setItem("dojo_roster", JSON.stringify(DEFAULT_STUDENTS));
    return DEFAULT_STUDENTS;
  }
  return JSON.parse(data);
}

function saveStudents(students) {
  localStorage.setItem("dojo_roster", JSON.stringify(students));
}

let activeStudent = null;

/* =========================================================
   SENSEI ROSTER CONTROLS: ATTENDANCE, MEDALS, BELTS, BAN, DELETE
   ========================================================= */
function renderAdminRoster() {
  const container = document.getElementById("admin-roster-list");
  if (!container) return;

  const students = getStudents();
  const countSpan = document.getElementById("roster-count");
  if (countSpan) countSpan.innerText = students.length;

  const query = (document.getElementById("roster-search")?.value || "").toLowerCase();
  const filtered = students.filter(s => s.name.toLowerCase().includes(query) || s.phone.includes(query) || s.belt.toLowerCase().includes(query));

  if (filtered.length === 0) {
    container.innerHTML = "<p style='color:#777; font-size:0.85rem;'>No students match your query.</p>";
    return;
  }

  const BELTS = ["White", "Yellow", "Orange", "Green", "Blue", "Purple", "Brown", "Black"];

  container.innerHTML = filtered.map(s => {
    const isExpired = s.planExpiry > 0 && Date.now() > s.planExpiry;
    const planDisplay = isExpired ? "Basic (Expired)" : s.plan;
    const isSubscribed = (s.plan === "1 Month" || s.plan === "1 Year") && !isExpired;

    return `
      <div class="roster-card ${s.banned ? 'banned' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div>
            <strong style="font-size:1rem; color:#fff;">${s.name}</strong> 
            ${s.banned ? '<span class="badge-banned">BANNED</span>' : ''}
            <div style="color:#888; font-size:0.75rem; margin-top:2px;">
              📱 ${s.phone} | Plan: <strong style="color:${isSubscribed ? '#4caf50' : '#ff9800'};">${planDisplay}</strong>
            </div>
          </div>
          <button class="btn-action" style="color:#f44336; border-color:#f44336;" onclick="deleteStudent('${s.id}')">Delete</button>
        </div>

        <!-- Attendance & Belts -->
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin:10px 0; font-size:0.8rem;">
          <div>
            <span>Belt: </span>
            <select class="btn-action" onchange="changeBelt('${s.id}', this.value)">
              ${BELTS.map(b => `<option value="${b}" ${s.belt === b ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>
          <div>
            <span>Classes: <strong>${s.classes}</strong></span>
            <button class="btn-action" style="color:#4caf50;" onclick="adjustAttendance('${s.id}', 1)">+ Mark Present</button>
            <button class="btn-action" onclick="adjustAttendance('${s.id}', -1)">- 1</button>
          </div>
        </div>

        <!-- Medals -->
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:10px; font-size:0.8rem;">
          <span>Medals:</span>
          <span>🥇 ${s.gold} <button class="btn-action" onclick="adjustMedal('${s.id}', 'gold', 1)">+</button><button class="btn-action" onclick="adjustMedal('${s.id}', 'gold', -1)">-</button></span>
          <span>🥈 ${s.silver} <button class="btn-action" onclick="adjustMedal('${s.id}', 'silver', 1)">+</button><button class="btn-action" onclick="adjustMedal('${s.id}', 'silver', -1)">-</button></span>
          <span>🥉 ${s.bronze} <button class="btn-action" onclick="adjustMedal('${s.id}', 'bronze', 1)">+</button><button class="btn-action" onclick="adjustMedal('${s.id}', 'bronze', -1)">-</button></span>
        </div>

        <!-- Subscription Clearance Grant & Ban Toggle -->
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
          <button class="btn-action" style="${s.plan === 'Basic' ? 'background:#333; color:#aaa;' : ''}" onclick="setStudentPlan('${s.id}', 'Basic', 0)">Set Basic (Lock QR)</button>
          <button class="btn-action" style="color:#4caf50;" onclick="setStudentPlan('${s.id}', '1 Month', 30)">Grant 1-Mo (₹50)</button>
          <button class="btn-action" style="color:#64b5f6;" onclick="setStudentPlan('${s.id}', '1 Year', 365)">Grant 1-Yr (₹95)</button>
          <button class="btn-action" style="${s.banned ? 'color:#4caf50;' : 'color:#ff9800;'}" onclick="toggleBanStudent('${s.id}')">
            ${s.banned ? 'Unban' : 'Ban'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function adminEnrollStudent() {
  const name = document.getElementById("new-stu-name").value.trim();
  const phone = document.getElementById("new-stu-phone").value.trim();
  const belt = document.getElementById("new-stu-belt").value;
  const plan = document.getElementById("new-stu-plan").value;

  if (!name || !phone) {
    alert("Please enter student name and phone!");
    return;
  }

  let days = 0;
  if (plan === "1 Month") days = 30;
  if (plan === "1 Year") days = 365;

  const students = getStudents();
  students.push({
    id: Date.now().toString(),
    name,
    phone,
    belt,
    classes: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
    banned: false,
    plan: plan,
    planExpiry: days > 0 ? Date.now() + (days * 86400000) : 0
  });

  saveStudents(students);
  document.getElementById("new-stu-name").value = "";
  document.getElementById("new-stu-phone").value = "";
  document.getElementById("enroll-drawer").classList.add("hidden");
  renderAdminRoster();
  alert(`Cadre Enrolled: ${name} with ${plan} plan.`);
}

function adjustAttendance(id, delta) {
  const students = getStudents();
  const s = students.find(x => x.id === id);
  if (!s) return;
  s.classes = Math.max(0, (s.classes || 0) + delta);
  saveStudents(students);
  renderAdminRoster();
}

function changeBelt(id, newBelt) {
  const students = getStudents();
  const s = students.find(x => x.id === id);
  if (!s) return;
  s.belt = newBelt;
  saveStudents(students);
  renderAdminRoster();
}

function adjustMedal(id, type, delta) {
  const students = getStudents();
  const s = students.find(x => x.id === id);
  if (!s) return;
  s[type] = Math.max(0, (s[type] || 0) + delta);
  saveStudents(students);
  renderAdminRoster();
}

function toggleBanStudent(id) {
  const students = getStudents();
  const s = students.find(x => x.id === id);
  if (!s) return;
  s.banned = !s.banned;
  saveStudents(students);
  renderAdminRoster();
  alert(s.banned ? `${s.name} is now BANNED from session check-ins.` : `${s.name} has been UNBANNED.`);
}

function deleteStudent(id) {
  if (!confirm("Are you sure you want to completely remove this student profile?")) return;
  let students = getStudents();
  students = students.filter(x => x.id !== id);
  saveStudents(students);
  renderAdminRoster();
}

function setStudentPlan(id, planName, days) {
  const students = getStudents();
  const s = students.find(x => x.id === id);
  if (!s) return;
  s.plan = planName;
  s.planExpiry = days > 0 ? Date.now() + (days * 86400000) : 0;
  saveStudents(students);
  renderAdminRoster();
  alert(`Updated subscription for ${s.name} to: ${planName}`);
}

/* =========================================================
   CADRE / STUDENT LOGIN & SUBSCRIPTION LOCK ENGINE
   ========================================================= */
function submitStudentLogin() {
  const name = document.getElementById("stu-login-name").value.trim().toLowerCase();
  const phone = document.getElementById("stu-login-phone").value.trim();

  const students = getStudents();
  const student = students.find(s => s.name.toLowerCase() === name || s.phone === phone);

  if (!student) {
    alert("Cadre record not found! Please ask Sensei to enroll you.");
    return;
  }

  activeStudent = student;
  loadStudentDashboard();
  document.querySelectorAll('.view-panel').forEach(el => el.classList.add('hidden'));
  document.getElementById('view-student-portal').classList.remove('hidden');
}

function loadStudentDashboard() {
  if (!activeStudent) return;
  document.getElementById("stu-portal-name").innerText = activeStudent.name.toUpperCase();
  document.getElementById("stu-portal-belt").innerText = activeStudent.belt;
  document.getElementById("stu-portal-classes").innerText = activeStudent.classes;
  document.getElementById("stu-gold").innerText = activeStudent.gold;
  document.getElementById("stu-silver").innerText = activeStudent.silver;
  document.getElementById("stu-bronze").innerText = activeStudent.bronze;

  // Subscription verification
  const isExpired = activeStudent.planExpiry > 0 && Date.now() > activeStudent.planExpiry;
  const currentPlan = isExpired ? "Basic (Expired)" : activeStudent.plan;
  const badge = document.getElementById("current-plan-badge");
  badge.innerText = currentPlan;

  // ACCESS GATE: Determine if QR Code & Payment can be shown
  const isEligible = (activeStudent.plan === "1 Month" || activeStudent.plan === "1 Year") && !isExpired;
  const lockedNotice = document.getElementById("upi-locked-notice");
  const unlockedSection = document.getElementById("upi-unlocked-section");

  if (isEligible) {
    unlockedSection.classList.remove("hidden");
    lockedNotice.classList.add("hidden");
    badge.style.color = "#4caf50";
  } else {
    unlockedSection.classList.add("hidden");
    lockedNotice.classList.remove("hidden");
    badge.style.color = "#ff9800";
  }

  const checkinBtn = document.getElementById("stu-checkin-btn");
  if (activeStudent.banned) {
    checkinBtn.disabled = true;
    checkinBtn.innerText = "CLEARANCE FROZEN (BANNED)";
    checkinBtn.style.background = "#555";
  } else {
    checkinBtn.disabled = false;
    checkinBtn.innerText = "SESSION CHECK-IN";
    checkinBtn.style.background = "";
  }
}

function recordStudentCheckin() {
  if (!activeStudent) return;
  if (activeStudent.banned) {
    alert("Clearance frozen! Contact Sensei.");
    return;
  }

  const students = getStudents();
  const s = students.find(x => x.id === activeStudent.id);
  if (!s) return;

  s.classes = (s.classes || 0) + 1;
  saveStudents(students);
  activeStudent = s;
  loadStudentDashboard();
  alert(`Oss! Check-in recorded. Total sessions: ${s.classes}`);
}

/* =========================================================
   UPI PAYMENTS AT HOME (LOCKED FOR BASIC)
   ========================================================= */
const UPI_ID = "8178615663@ibl";
const ACADEMY_NAME = "Akshar Karate Academy";
const WHATSAPP_NUM = "918178615663";
let selectedPlan = null;

function showUPIPayment(amount, planName, days) {
  selectedPlan = { amount, planName, days };
  const box = document.getElementById("upi-payment-box");
  const title = document.getElementById("upi-pay-title");
  const qr = document.getElementById("upi-qr-image");
  const deepLink = document.getElementById("upi-deep-link");
  const wa = document.getElementById("whatsapp-receipt-link");

  if (title) title.innerText = `Pay ₹${amount} for ${planName}`;
  const upiUri = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(ACADEMY_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(planName)}`;

  if (qr) qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;
  if (deepLink) deepLink.href = upiUri;

  const stuName = activeStudent ? activeStudent.name : "Cadre Member";
  const msg = `Hello Sensei, I (${stuName}) have paid ₹${amount} for ${planName}. Attached is my payment screenshot.`;
  if (wa) wa.href = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`;

  if (box) box.style.display = "block";
}

/* =========================================================
   TOURNAMENTS LOGIC
   ========================================================= */
function adminAddTournament() {
  const pass = prompt("Enter Sensei Passcode:");
  if (!checkSenseiPass(pass)) {
    alert("Unauthorized!");
    return;
  }
  const name = prompt("Enter Tournament Name & Venue:");
  if (!name) return;
  const photo = prompt("Poster Image URL (optional):") || "";
  localStorage.setItem("upcoming_tournament", JSON.stringify({ name, photo, date: new Date().toLocaleDateString() }));
  renderTournamentUI();
}

function renderTournamentUI() {
  const containerAdmin = document.getElementById("tournament-display");
  const containerStu = document.getElementById("student-tournament-display");
  const data = localStorage.getItem("upcoming_tournament");

  const html = !data
    ? "<p style='color:#777; font-size:0.8rem;'>No tournaments scheduled.</p>"
    : (() => {
        const t = JSON.parse(data);
        return `
          <div style="background: rgba(255,255,255,0.06); padding: 10px; border-radius: 6px; margin: 8px 0;">
            <h4 style="margin: 0 0 6px 0; color: #fff;">🥋 ${t.name}</h4>
            ${t.photo ? `<img src="${t.photo}" style="max-width:100%; border-radius:4px; margin:6px 0;" />` : ''}
            <small style="color:#888;">Announced: ${t.date}</small>
          </div>
        `;
      })();

  if (containerAdmin) containerAdmin.innerHTML = html;
  if (containerStu) containerStu.innerHTML = html;
}

/* =========================================================
   INITIALIZATION
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  renderTournamentUI();

  const passField = document.getElementById("admin-login-pass");
  if (passField) passField.value = "";

  const adminForm = document.getElementById("form-admin-login");
  if (adminForm) {
    adminForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const errBox = document.getElementById("admin-login-err");
      if (checkSenseiPass(passField.value)) {
        if (errBox) errBox.innerText = "";
        document.querySelectorAll('.view-panel').forEach(el => el.classList.add('hidden'));
        document.getElementById('view-admin-portal').classList.remove('hidden');
        renderAdminRoster();
      } else {
        if (errBox) errBox.innerText = "ACCESS DENIED: INVALID PASSCODE";
      }
    });
  }
});
