/* =========================================================
   AKSHAR DOJO: 3D GYROSCOPIC MOTION NET ENGINE
   ========================================================= */
const canvas = document.getElementById("motion-net-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let width, height;
  let points = [];
  const SPACING = 45;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initPoints();
  }

  function initPoints() {
    points = [];
    const cols = Math.ceil(width / SPACING) + 2;
    const rows = Math.ceil(height / SPACING) + 2;
    for (let i = -1; i < cols; i++) {
      for (let j = -1; j < rows; j++) {
        points.push({
          x: i * SPACING,
          y: j * SPACING,
          origX: i * SPACING,
          origY: j * SPACING,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4
        });
      }
    }
  }

  function drawNet() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;

    for (let i = 0; i < points.length; i++) {
      let p = points[i];
      p.x += p.vx;
      p.y += p.vy;

      if (Math.abs(p.x - p.origX) > 12) p.vx *= -1;
      if (Math.abs(p.y - p.origY) > 12) p.vy *= -1;

      for (let j = i + 1; j < points.length; j++) {
        let p2 = points[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < SPACING * 1.25) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawNet);
  }

  window.addEventListener("resize", resize);
  resize();
  drawNet();
}

/* =========================================================
   UPI PAYMENTS, TOURNAMENTS & SUBSCRIPTION ENGINE
   ========================================================= */
const UPI_ID = "8178615663@ibl";
const ACADEMY_NAME = "Akshar Karate Academy";
const WHATSAPP_NUM = "918178615663";

// Both password variations accepted
function verifyAdminPass(input) {
  return input === "admin1235" || input === "Admin1235";
}

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
  
  const msg = `Hello Sensei, I have paid ₹${amount} for ${planName}. Here is the screenshot.`;
  if (wa) wa.href = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`;
  
  if (box) box.style.display = "block";
}

// Hidden Masked Passcode Modal for Admin Activation
function confirmPlanActivation() {
  if (!selectedPlan) return;
  openAdminModal("Enter Admin Passcode to Activate Plan", (pass) => {
    if (!verifyAdminPass(pass)) {
      alert("Unauthorized: Incorrect Passcode");
      return;
    }
    const expiry = Date.now() + (selectedPlan.days * 24 * 60 * 60 * 1000);
    localStorage.setItem("dojo_plan", selectedPlan.planName);
    localStorage.setItem("dojo_plan_expiry", expiry.toString());
    alert(`Plan Activated: ${selectedPlan.planName}`);
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
    alert("Plan expired. Degraded to Basic plan.");
    if (badge) badge.innerText = "Basic (Expired)";
  } else if (badge) {
    badge.innerText = plan;
  }
}

// Hidden Masked Passcode for Adding Tournament
function adminAddTournament() {
  openAdminModal("Enter Admin Passcode to Update Tournament", (pass) => {
    if (!verifyAdminPass(pass)) {
      alert("Unauthorized: Incorrect Passcode");
      return;
    }
    const name = prompt("Tournament Name & Venue:");
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
    container.innerHTML = "<p style='color:#666; font-size:0.8rem;'>No tournaments scheduled.</p>";
    return;
  }
  const t = JSON.parse(data);
  container.innerHTML = `
    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; margin: 8px 0;">
      <h4 style="margin: 0 0 6px 0; color: #fff;">${t.name}</h4>
      ${t.photo ? `<img src="${t.photo}" style="max-width:100%; border-radius:4px; margin:6px 0;" />` : ''}
      <small style="color:#888;">Posted: ${t.date}</small>
    </div>
  `;
}

/* =========================================================
   SECURE MASKED PASSWORD MODAL
   ========================================================= */
let adminModalCallback = null;

function openAdminModal(headingText, callback) {
  adminModalCallback = callback;
  let modal = document.getElementById("secure-admin-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "secure-admin-modal";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:99999;";
    modal.innerHTML = `
      <div style="background:#111; border:1px solid #333; border-radius:8px; padding:20px; width:90%; max-width:320px; text-align:center;">
        <h4 id="admin-modal-title" style="color:#fff; margin:0 0 12px 0; font-size:0.9rem;">ENTER ADMIN PASSCODE</h4>
        <input type="password" id="admin-modal-input" placeholder="••••••••" style="width:100%; padding:10px; border-radius:6px; border:1px solid #444; background:#000; color:#fff; font-size:16px; box-sizing:border-box; text-align:center;" />
        <div style="margin-top:14px; display:flex; gap:8px; justify-content:center;">
          <button id="admin-modal-submit" style="background:#0078d4; color:#fff; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">SUBMIT</button>
          <button id="admin-modal-cancel" style="background:#222; color:#aaa; border:1px solid #444; padding:8px 16px; border-radius:4px; cursor:pointer;">CANCEL</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("admin-modal-submit").addEventListener("click", () => {
      const val = document.getElementById("admin-modal-input").value;
      modal.style.display = "none";
      document.getElementById("admin-modal-input").value = "";
      if (adminModalCallback) adminModalCallback(val);
    });

    document.getElementById("admin-modal-cancel").addEventListener("click", () => {
      modal.style.display = "none";
      document.getElementById("admin-modal-input").value = "";
    });
  }

  document.getElementById("admin-modal-title").innerText = headingText;
  modal.style.display = "flex";
  document.getElementById("admin-modal-input").focus();
}

/* =========================================================
   LOGIN SCREEN FORM LISTENER
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  checkDojoPlan();
  renderTournamentUI();

  // Wire up existing Admin Terminal Login Form
  const adminForm = document.getElementById("form-admin-login");
  if (adminForm) {
    adminForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const passField = document.getElementById("admin-login-pass");
      const errBox = document.getElementById("admin-login-err");
      if (verifyAdminPass(passField.value)) {
        if (errBox) errBox.innerText = "";
        document.querySelectorAll('.view-panel').forEach(el => el.classList.add('hidden'));
        document.getElementById('view-admin-portal').classList.remove('hidden');
      } else {
        if (errBox) errBox.innerText = "INVALID CREDENTIALS";
      }
    });
  }
});
