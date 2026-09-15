/* =========================================================
   AKSHAR DOJO: RESPONSIVE DYNAMIC SQUARE NET (MOUSE + TOUCH)
   ========================================================= */
(function initReactiveGrid() {
  const canvas = document.getElementById("motion-net-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0, height = 0;
  let cols = 0, rows = 0;
  let grid = [];
  const SPACING = 48;
  const RADIUS = 140;

  let pointer = { x: -9999, y: -9999, active: false };

  // Listen on window so events are never blocked by HTML buttons/cards
  window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      pointer.x = e.touches[0].clientX;
      pointer.y = e.touches[0].clientY;
      pointer.active = true;
    }
  }, { passive: true });

  window.addEventListener("pointerleave", () => { pointer.active = false; });
  window.addEventListener("touchend", () => { pointer.active = false; });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cols = Math.floor(width / SPACING) + 2;
    rows = Math.floor(height / SPACING) + 2;
    grid = [];

    for (let c = 0; c < cols; c++) {
      grid[c] = [];
      for (let r = 0; r < rows; r++) {
        const ox = c * SPACING;
        const oy = r * SPACING;
        grid[c][r] = {
          x: ox,
          y: oy,
          origX: ox,
          origY: oy,
          vx: 0,
          vy: 0
        };
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    // 1. Point physics update
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const p = grid[c][r];

        // Interaction with pointer
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < RADIUS && dist > 0) {
            const force = (1 - dist / RADIUS) * 12;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 0.15;
            p.vy += Math.sin(angle) * force * 0.15;
          }
        }

        // Spring back to base position
        p.vx += (p.origX - p.x) * 0.08;
        p.vy += (p.origY - p.y) * 0.08;

        // Damping to eliminate infinite vibration / scrambling
        p.vx *= 0.75;
        p.vy *= 0.75;

        p.x += p.vx;
        p.y += p.vy;
      }
    }

    // 2. Draw square grid connections
    ctx.lineWidth = 1;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const p = grid[c][r];

        // Highlight lines near the cursor
        const pDist = pointer.active ? Math.sqrt((pointer.x - p.x) ** 2 + (pointer.y - p.y) ** 2) : 999;
        const alpha = pDist < RADIUS ? 0.35 : 0.09;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;

        // Connect right node
        if (c + 1 < cols) {
          const right = grid[c + 1][r];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(right.x, right.y);
          ctx.stroke();
        }

        // Connect bottom node
        if (r + 1 < rows) {
          const bottom = grid[c][r + 1];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(bottom.x, bottom.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(loop);
})();

/* =========================================================
   SECURITY & PASSCODE LOGIC (admin1235 / Admin1235 only)
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
