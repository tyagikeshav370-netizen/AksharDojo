/* =========================================================
   AKSHAR DOJO: RESPONSIVE INTERACTIVE KINETIC MESH
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

  const cursor = {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    active: false
  };

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

  window.addEventListener("pointerleave", () => {
    cursor.active = false;
    cursor.targetX = -9999;
    cursor.targetY = -9999;
  });

  window.addEventListener("touchend", () => {
    cursor.active = false;
    cursor.targetX = -9999;
    cursor.targetY = -9999;
  });

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
   SECURITY & SENSEI AUTHENTICATION
   ========================================================= */
function checkSenseiPass(input) {
  return input === "admin1235" || input === "Admin1235";
}

/* =========================================================
   DATA STORAGE & STUDENT ROSTER ENGINE
   ========================================================= */
function getStudents() {
  const data = localStorage.getItem("dojo_students");
  if (!data) {
    // Initial sample student roster if none exists
    const initial = [
      { id: "stu_1", name: "Aarav Sharma", phone: "9876543210", belt: "Yellow Belt", classes: 12, gold: 1, silver: 0, bronze: 1, banned: false },
      { id: "stu_2", name: "Pooja Verma", phone: "9811122233", belt: "Orange Belt", classes: 24, gold: 2, silver: 1, bronze: 0, banned: false }
    ];
    localStorage.setItem("dojo_students", JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function saveStudents(list) {
  localStorage.setItem("dojo_students", JSON.stringify(list));
  renderAdminRoster();
}

function toggleEnrollForm() {
  const drawer = document.getElementById("enroll-drawer");
  if (drawer) drawer.classList.toggle("hidden");
}

function confirmEnrollStudent() {
  const nameInput = document.getElementById("new-stu-name");
  const phoneInput = document.getElementById("new-stu-phone");
  const beltSelect = document.getElementById("new-stu-belt");

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const belt = beltSelect.value;

  if (!name || !phone) {
    alert("Please enter full name and phone number!");
    return;
  }

  const students = getStudents();
  const newStudent = {
    id: "stu_" + Date.now(),
    name: name,
    phone: phone,
    belt: belt,
    classes: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
    banned: false
  };

  students.push(newStudent);
  saveStudents(students);

  nameInput.value = "";
  phoneInput.value = "";
  document.getElementById("enroll-drawer").classList.add("hidden");
  alert(`Student Enrolled: ${name}`);
}

/* =========================================================
   ADMIN ROSTER MANAGEMENT (ATTENDANCE, BELT, MEDALS, BAN, DELETE)
   ========================================================= */
function renderAdminRoster() {
  const cluster = document.getElementById("admin-roster-cluster");
  const countBadge = document.getElementById("roster-count-badge");
  if (!cluster) return;

  const students = getStudents();
  const search = (document.getElementById("admin-roster-search")?.value || "").toLowerCase();

  const filtered = students.filter(s => s.name.toLowerCase().includes(search) || s.belt.toLowerCase().includes(search));

  if (countBadge) countBadge.innerText = `${filtered.length} Cadre Enrolled`;

  if (filtered.length === 0) {
    cluster.innerHTML = "<p style='color:#777; font-size:0.85rem; padding:10px 0;'>No students found matching query.</p>";
    return;
  }

  let html = "";
  filtered.forEach((s) => {
    html += `
      <div class="roster-card ${s.banned ? 'banned' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h4 style="margin:0 0 4px 0; color:#fff; font-size:1rem;">
              ${s.name} ${s.banned ? '<span style="color:#ff5252; font-size:0.75rem;">[BANNED]</span>' : ''}
            </h4>
            <div style="color:#aaa; font-size:0.8rem;">📞 ${s.phone} | 🥋 <strong>${s.belt}</strong></div>
            <div style="color:#888; font-size:0.8rem; margin-top:2px;">
              Attendance: <strong>${s.classes} Classes</strong> | 🥇 ${s.gold} | 🥈 ${s.silver} | 🥉 ${s.bronze}
            </div>
          </div>
        </div>

        <!-- Controls Grid -->
        <div style="margin-top:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.06); display:flex; flex-wrap:wrap; gap:4px;">
          <!-- Attendance -->
          <button type="button" class="action-btn success" onclick="adjustAttendance('${s.id}', 1)">+ Attendance</button>
          <button type="button" class="action-btn" onclick="adjustAttendance('${s.id}', -1)">- Attendance</button>

          <!-- Belt Change -->
          <button type="button" class="action-btn" onclick="changeStudentBelt('${s.id}')">🥋 Change Belt</button>

          <!-- Medals -->
          <button type="button" class="action-btn" onclick="awardMedal('${s.id}', 'gold')">+ 🥇 Gold</button>
          <button type="button" class="action-btn" onclick="awardMedal('${s.id}', 'silver')">+ 🥈 Silver</button>
          <button type="button" class="action-btn" onclick="awardMedal('${s.id}', 'bronze')">+ 🥉 Bronze</button>

          <!-- Ban / Unban -->
          <button type="button" class="action-btn ${s.banned ? 'success' : 'danger'}" onclick="toggleBanStudent('${s.id}')">
            ${s.banned ? '✅ Unban Student' : '⛔ Ban Student'}
          </button>

          <!-- Delete -->
          <button type="button" class="action-btn danger" onclick="deleteStudent('${s.id}')">🗑️ Delete</button>
        </div>
      </div>
    `;
  });

  cluster.innerHTML = html;
}

function adjustAttendance(id, delta) {
  const students = getStudents();
  const s = students.find(x => x.id === id);
  if (s) {
    s.classes = Math.max(0, (s.classes || 0) + delta);
    saveStudents(students);
  }
}

function changeStudentBelt(id) {
  const belts = ["White Belt", "Yellow Belt", "Orange Belt", "Green Belt", "Blue Belt", "Purple Belt", "Brown Belt", "Black Belt"];
  const students = getStudents();
  const s = students.find(x => x.id === id);
  if (!s) return;

  const currentIdx = belts.indexOf(s.belt);
  const nextBelt = prompt(`Current Belt: ${s.belt}\nType new belt name (e.g. Yellow Belt, Green Belt, Black Belt):`, s.belt);
  if (nextBelt && nextBelt.trim()) {
    s.belt = nextBelt.trim();
    saveStudents(students);
  }
}

function awardMedal(id, type) {
  const students = getStudents();
  const s = students.find(x => x.id === id);
  if (!s) return;
  s[type] = (s[type] || 0) + 1;
  saveStudents(students);
}

function toggleBanStudent(id) {
  const students = getStudents();
  const s = students.find(x => x.id === id);
  if (!s) return;
  s.banned = !s.banned;
  saveStudents(students);
}

function deleteStudent(id) {
  if (!confirm("Are you sure you want to permanently delete this student record?")) return;
  let students = getStudents();
  students = students.filter(x => x.id !== id);
  saveStudents(students);
}

/* =========================================================
   STUDENT PORTAL RECOGNITION & ACTIONS
   ========================================================= */
let activeStudent = null;

function setupStudentPortalLogin() {
  const form = document.getElementById("form-student-login");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("stu-login-name").value.trim().toLowerCase();
    const phone = document.getElementById("stu-login-phone").value.trim();
    const err = document.getElementById("stu-login-err");

    const students = getStudents();
    const match = students.find(s => s.name.toLowerCase() === name || s.phone === phone);

    if (!match) {
      err.innerText = "Cadre profile not found. Please contact Sensei.";
      return;
    }

    if (match.banned) {
      err.innerText = "ACCESS RESTRICTED: Your cadre access is currently banned.";
      return;
    }

    activeStudent = match;
    err.innerText = "";
    document.querySelectorAll('.view-panel').forEach(el => el.classList.add('hidden'));
    document.getElementById('view-student-portal').classList.remove('hidden');

    // Populate dashboard
    document.getElementById("stu-portal-name").innerText = match.name;
    document.getElementById("stu-portal-rank").innerText = `${match.belt} // ${match.classes} Classes Logged`;
    document.getElementById("stu-gold-count").innerText = match.gold || 0;
    document.getElementById("stu-silver-count").innerText = match.silver || 0;
    document.getElementById("stu-bronze-count").innerText = match.bronze || 0;
  });
}

function studentSelfCheckin() {
  if (!activeStudent) return;
  const students = getStudents();
  const s = students.find(x => x.id === activeStudent.id);
  if (s) {
    s.classes = (s.classes || 0) + 1;
    saveStudents(students);
    activeStudent = s;
    document.getElementById("stu-portal-rank").innerText = `${s.belt} // ${s.classes} Classes Logged`;
    alert("Attendance logged for today's session!");
  }
}

/* =========================================================
   UPI FEES & SUBSCRIPTIONS
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

  const msg = `Hello Sensei, I have paid ₹${amount} for ${planName}. Attached is my payment screenshot.`;
  if (wa) wa.href = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`;

  if (box) box.style.display = "block";
}

function adminActivatePlanDirect(planName, days) {
  const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);
  localStorage.setItem("dojo_plan", planName);
  localStorage.setItem("dojo_plan_expiry", expiry.toString());
  alert(`Plan Activated: ${planName}`);
  checkDojoPlan();
}

function adminResetPlanToBasic() {
  localStorage.setItem("dojo_plan", "Basic");
  localStorage.removeItem("dojo_plan_expiry");
  alert("Dojo status reverted to Basic.");
  checkDojoPlan();
}

function checkDojoPlan() {
  const badge = document.getElementById("current-plan-badge");
  const plan = localStorage.getItem("dojo_plan") || "Basic";
  const expiry = parseInt(localStorage.getItem("dojo_plan_expiry") || "0", 10);

  if (plan !== "Basic" && Date.now() > expiry) {
    localStorage.setItem("dojo_plan", "Basic");
    localStorage.removeItem("dojo_plan_expiry");
    if (badge) badge.innerText = "Basic (Expired)";
  } else if (badge) {
    badge.innerText = plan;
  }
}

/* =========================================================
   TOURNAMENTS LOGIC
   ========================================================= */
function adminAddTournament() {
  const pass = prompt("Enter Sensei Passcode to Update Tournament:");
  if (!checkSenseiPass(pass)) {
    alert("Unauthorized: Incorrect Passcode!");
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
            ${t.photo ? `<img src="${t.photo}" style="max-width:100%; border-radius:4px; margin:6px 0; display:block;" />` : ''}
            <small style="color:#888;">Announced: ${t.date}</small>
          </div>
        `;
      })();

  if (containerAdmin) containerAdmin.innerHTML = html;
  if (containerStu) containerStu.innerHTML = html;
}

/* =========================================================
   INITIALIZATION ON DOM LOAD
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  checkDojoPlan();
  renderTournamentUI();
  renderAdminRoster();
  setupStudentPortalLogin();

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
        if (errBox) errBox.innerText = "ACCESS DENIED: INVALID SENSEI PASSCODE";
      }
    });
  }
});
