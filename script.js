/* =========================================================
   AKSHAR DOJO: ZERO-SCRAMBLE GEOMETRIC WARP MESH
   ========================================================= */
(function initWarpMesh() {
  const canvas = document.getElementById("motion-net-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0, height = 0;
  const SPACING = 45; // Grid cell size
  const RADIUS = 160; // Interaction radius
  const MAX_PULL = 35; // Maximum pull towards cursor

  let mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999 };

  // Track globally on window so HTML elements don't block input
  window.addEventListener("pointermove", (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX;
      mouse.targetY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    mouse.targetX = -9999;
    mouse.targetY = -9999;
  });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Smooth cursor interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.15;
    mouse.y += (mouse.targetY - mouse.y) * 0.15;

    const cols = Math.ceil(width / SPACING) + 1;
    const rows = Math.ceil(height / SPACING) + 1;

    // Calculate displaced point coordinates on the fly (prevents scrambling)
    const points = [];
    for (let c = 0; c < cols; c++) {
      points[c] = [];
      for (let r = 0; r < rows; r++) {
        const ox = c * SPACING;
        const oy = r * SPACING;

        const dx = mouse.x - ox;
        const dy = mouse.y - oy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let px = ox;
        let py = oy;

        // Smooth Gaussian warp toward pointer
        if (dist < RADIUS) {
          const factor = Math.cos((dist / RADIUS) * (Math.PI / 2)) * MAX_PULL;
          const angle = Math.atan2(dy, dx);
          px += Math.cos(angle) * factor;
          py += Math.sin(angle) * factor;
        }

        points[c][r] = { x: px, y: py, dist: dist };
      }
    }

    // Render cleanly connected orthogonal lines
    ctx.lineWidth = 1;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const p = points[c][r];

        // Highlight cells close to the mouse
        const alpha = p.dist < RADIUS ? 0.35 : 0.08;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;

        // Horizontal line
        if (c + 1 < cols) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(points[c + 1][r].x, points[c + 1][r].y);
          ctx.stroke();
        }

        // Vertical line
        if (r + 1 < rows) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(points[c][r + 1].x, points[c][r + 1].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
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
            ${t.photo ? `<img src="${t.photo}" style="max-width:100%; border-radius:4px; margin:6px 0;" />` : ''}
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
