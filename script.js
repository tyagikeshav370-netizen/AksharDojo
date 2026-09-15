/* =========================================================
   AKSHAR DOJO: SMOOTH GYROSCOPIC MOTION NET (NO SCRAMBLE)
   ========================================================= */
(function initCanvasNet() {
  const canvas = document.getElementById("motion-net-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let points = [];
  const SPACING = 65; // Balanced grid spacing to stop distortion

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    points = [];
    const cols = Math.ceil(width / SPACING) + 1;
    const rows = Math.ceil(height / SPACING) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        points.push({
          x: i * SPACING,
          y: j * SPACING,
          baseX: i * SPACING,
          baseY: j * SPACING,
          phase: Math.random() * Math.PI * 2,
          speed: 0.015 + Math.random() * 0.01
        });
      }
    }
  }

  function render(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
    ctx.lineWidth = 1;

    // Smooth harmonic floating motion
    for (let i = 0; i < points.length; i++) {
      let p = points[i];
      p.x = p.baseX + Math.sin(time * 0.001 * p.speed + p.phase) * 12;
      p.y = p.baseY + Math.cos(time * 0.001 * p.speed + p.phase) * 12;
    }

    // Connect neighbor nodes cleanly
    for (let i = 0; i < points.length; i++) {
      let p = points[i];
      for (let j = i + 1; j < points.length; j++) {
        let p2 = points[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let distSq = dx * dx + dy * dy;

        if (distSq < SPACING * SPACING * 1.8) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
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
   SECURITY & PASSCODE VERIFICATION
   ========================================================= */
function checkSenseiPass(input) {
  // Only admin1235 and Admin1235 are accepted
  return input === "admin1235" || input === "Admin1235";
}

/* =========================================================
   UPI & SUBSCRIPTION ENGINE
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

  const msg = `Hello Sensei, I have paid ₹${amount} for ${planName}. Here is the payment screenshot.`;
  if (wa) wa.href = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`;

  if (box) box.style.display = "block";
}

function confirmPlanActivation() {
  if (!selectedPlan) return;
  openAdminModal("Enter Sensei Passcode to Activate Plan", (pass) => {
    if (!checkSenseiPass(pass)) {
      alert("Invalid Sensei Credentials!");
      return;
    }
    const expiry = Date.now() + (selectedPlan.days * 24 * 60 * 60 * 1000);
    localStorage.setItem("dojo_plan", selectedPlan.planName);
    localStorage.setItem("dojo_plan_expiry", expiry.toString());
    alert(`Success: Activated ${selectedPlan.planName}`);
    const box = document.getElementById("upi-payment-box");
    if (box) box.style.display = "none";
    checkDojoPlan();
  });
}

function checkDojoPlan() {
  const badge = document.getElementById("current-plan-badge");
  const plan = localStorage.getItem("dojo_plan") || "Basic";
  const expiry = parseInt(localStorage.getItem("dojo_plan_expiry") || "0", 10);

  if (plan !== "Basic" && Date.now() > expiry) {
    localStorage.setItem("dojo_plan", "Basic");
    localStorage.removeItem("dojo_plan_expiry");
    alert("Alert: Membership plan has expired. Reverted to Basic.");
    if (badge) badge.innerText = "Basic (Expired)";
  } else if (badge) {
    badge.innerText = plan;
  }
}

function adminAddTournament() {
  openAdminModal("Enter Sensei Passcode for Tournaments", (pass) => {
    if (!checkSenseiPass(pass)) {
      alert("Unauthorized Access!");
      return;
    }
    const name = prompt("Enter Tournament Name & Venue:");
    if (!name) return;
    const photo = prompt("Poster Image URL (optional):") || "";
    localStorage.setItem("upcoming_tournament", JSON.stringify({ name, photo, date: new Date().toLocaleDateString() }));
    renderTournamentUI();
  });
}

function renderTournamentUI() {
  const container = document.getElementById("tournament-display");
  if (!container) return;
  const data = localStorage.getItem("upcoming_tournament");
  if (!data) {
    container.innerHTML = "<p style='color:#666; font-size:0.8rem;'>No upcoming tournaments announced yet.</p>";
    return;
  }
  const t = JSON.parse(data);
  container.innerHTML = `
    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; margin: 8px 0;">
      <h4 style="margin: 0 0 6px 0; color: #fff;">🥋 ${t.name}</h4>
      ${t.photo ? `<img src="${t.photo}" style="max-width:100%; border-radius:4px; margin:6px 0;" />` : ''}
      <small style="color:#888;">Announced: ${t.date}</small>
    </div>
  `;
}

/* =========================================================
   SECURE MASKED PASSCODE MODAL
   ========================================================= */
let modalCallback = null;

function openAdminModal(title, callback) {
  modalCallback = callback;
  let modal = document.getElementById("sensei-auth-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "sensei-auth-modal";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:99999;";
    modal.innerHTML = `
      <div style="background:#111; border:1px solid #333; border-radius:8px; padding:20px; width:90%; max-width:320px; text-align:center;">
        <h4 id="auth-modal-title" style="color:#fff; margin:0 0 12px 0; font-size:0.9rem;">SENSEI VERIFICATION</h4>
        <input type="password" id="auth-modal-input" placeholder="••••••••" style="width:100%; padding:10px; border-radius:6px; border:1px solid #444; background:#000; color:#fff; font-size:16px; text-align:center; box-sizing:border-box;" />
        <div style="margin-top:14px; display:flex; gap:8px; justify-content:center;">
          <button id="auth-modal-submit" style="background:#0078d4; color:#fff; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">SUBMIT</button>
          <button id="auth-modal-cancel" style="background:#222; color:#aaa; border:1px solid #444; padding:8px 16px; border-radius:4px; cursor:pointer;">CANCEL</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("auth-modal-submit").addEventListener("click", () => {
      const val = document.getElementById("auth-modal-input").value;
      modal.style.display = "none";
      document.getElementById("auth-modal-input").value = "";
      if (modalCallback) modalCallback(val);
    });

    document.getElementById("auth-modal-cancel").addEventListener("click", () => {
      modal.style.display = "none";
      document.getElementById("auth-modal-input").value = "";
    });
  }

  document.getElementById("auth-modal-title").innerText = title;
  modal.style.display = "flex";
  const inp = document.getElementById("auth-modal-input");
  inp.value = "";
  inp.focus();
}

/* =========================================================
   LOGIN SCREEN WIRING & CLEARING DEFAULT INPUT
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  checkDojoPlan();
  renderTournamentUI();

  // Clear any cached/default values from login form
  const passField = document.getElementById("admin-login-pass");
  if (passField) {
    passField.value = "";
    passField.setAttribute("type", "password");
  }

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
        if (errBox) errBox.innerText = "ACCESS DENIED: INVALID SENSEI PASSCODE";
      }
    });
  }
});
