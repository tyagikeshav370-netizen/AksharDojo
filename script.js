/* =========================================================
   AKSHAR DOJO: ROCK-SOLID KINETIC NET (STABLE & FLUID)
   ========================================================= */
(function() {
  const canvas = document.getElementById("motion-net-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0, height = 0;
  let cols = 0, rows = 0;
  const GAP = 55; // Grid cell dimension
  const RADIUS = 180; // Pull radius around cursor
  const STRENGTH = 38; // Max movement distance

  // Global mouse tracker (listens to root window)
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

    // Smooth cursor interpolation
    if (cursor.active) {
      cursor.x += (cursor.targetX - cursor.x) * 0.18;
      cursor.y += (cursor.targetY - cursor.y) * 0.18;
    } else {
      cursor.x = -9999;
      cursor.y = -9999;
    }

    // Allocate 2D displaced matrix
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

          // Pure displacement curve: zero scrambling, zero physics overshoot
          if (dist < RADIUS && dist > 0.001) {
            const pull = (1 - dist / RADIUS) * STRENGTH;
            posX += (dx / dist) * pull;
            posY += (dy / dist) * pull;
          }
        }

        matrix[c][r] = { x: posX, y: posY, dist: dist };
      }
    }

    // Render strictly orthogonal grid lines
    ctx.lineWidth = 1;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const p = matrix[c][r];

        // Soft glow near cursor, clean faint line elsewhere
        const alpha = p.dist < RADIUS ? 0.35 : 0.08;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;

        // Horizontal neighbor line
        if (c + 1 < cols) {
          const pRight = matrix[c + 1][r];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pRight.x, pRight.y);
          ctx.stroke();
        }

        // Vertical neighbor line
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
   SECURITY & PASSCODE LOGIC (admin1235 / Admin1235)
   ========================================================= */
function checkSenseiPass(input) {
  return input === "admin1235" || input === "Admin1235";
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

function confirmPlanActivationManual() {
  const pass = prompt("Enter Sensei Passcode to Authorize:");
  if (!checkSenseiPass(pass)) {
    alert("Unauthorized!");
    return;
  }

  const planType = prompt("Enter plan: 'month' (₹50) or 'year' (₹95):");
  if (!planType) return;

  const days = planType.toLowerCase() === "year" ? 365 : 30;
  const planName = planType.toLowerCase() === "year" ? "1 Year Elite (₹95)" : "1 Month Premium (₹50)";
  const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);

  localStorage.setItem("dojo_plan", planName);
  localStorage.setItem("dojo_plan_expiry", expiry.toString());
  alert(`Activated: ${planName}`);
  checkDojoPlan();
}

function checkDojoPlan() {
  const badge = document.getElementById("current-plan-badge");
  const plan = localStorage.getItem("dojo_plan") || "Basic";
  const expiry = parseInt(localStorage.getItem("dojo_plan_expiry") || "0", 10);

  if (plan !== "Basic" && Date.now() > expiry) {
    localStorage.setItem("dojo_plan", "Basic");
    localStorage.removeItem("dojo_plan_expiry");
    alert("Alert: Plan has expired. Reverted to Basic.");
    if (badge) badge.innerText = "Basic (Expired)";
  } else if (badge) {
    badge.innerText = plan;
  }
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
            ${t.photo ? `<img src="${t.photo}" style="max-width:100%; border-radius:4px; margin:6px 0; display:block;" />` : ''}
            <small style="color:#888;">Announced: ${t.date}</small>
          </div>
        `;
      })();

  if (containerAdmin) containerAdmin.innerHTML = html;
  if (containerStu) containerStu.innerHTML = html;
}

/* =========================================================
   LOGIN SCREEN INITIALIZATION
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  checkDojoPlan();
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
      } else {
        if (errBox) errBox.innerText = "ACCESS DENIED: INVALID PASSCODE";
      }
    });
  }
});
