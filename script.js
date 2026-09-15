/* =========================================================
   AKSHAR DOJO: HIGH-RESPONSIVE KINETIC MOUSE GRID
   ========================================================= */
(function initReactiveGrid() {
  const canvas = document.getElementById("motion-net-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let cols = 0, rows = 0;
  let grid = [];
  const SPACING = 50; // Grid square size
  const MOUSE_RADIUS = 160; // Interaction radius

  const mouse = { x: -9999, y: -9999, active: false };

  // Listen for mouse & touch globally
  function updatePointer(clientX, clientY) {
    mouse.x = clientX;
    mouse.y = clientY;
    mouse.active = true;
  }

  window.addEventListener("pointermove", (e) => updatePointer(e.clientX, e.clientY));
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener("pointerleave", () => { mouse.active = false; });
  window.addEventListener("touchend", () => { mouse.active = false; });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cols = Math.ceil(width / SPACING) + 1;
    rows = Math.ceil(height / SPACING) + 1;
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

  function render() {
    ctx.clearRect(0, 0, width, height);

    // 1. Calculate physics deformation
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const p = grid[c][r];

        if (mouse.active) {
          const dx = mouse.x - p.origX;
          const dy = mouse.y - p.origY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_RADIUS) {
            // Visible magnetic pull towards mouse cursor
            const force = (1 - dist / MOUSE_RADIUS);
            const targetX = p.origX + dx * force * 0.45;
            const targetY = p.origY + dy * force * 0.45;

            p.vx += (targetX - p.x) * 0.18;
            p.vy += (targetY - p.y) * 0.18;
          } else {
            // Spring back home
            p.vx += (p.origX - p.x) * 0.08;
            p.vy += (p.origY - p.y) * 0.08;
          }
        } else {
          p.vx += (p.origX - p.x) * 0.08;
          p.vy += (p.origY - p.y) * 0.08;
        }

        // Friction damping
        p.vx *= 0.78;
        p.vy *= 0.78;

        p.x += p.vx;
        p.y += p.vy;
      }
    }

    // 2. Render clean square grid lines
    ctx.lineWidth = 1;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const p = grid[c][r];

        // Highlight line intensity near cursor
        const mDist = mouse.active ? Math.sqrt((mouse.x - p.x) ** 2 + (mouse.y - p.y) ** 2) : 999;
        const alpha = mDist < MOUSE_RADIUS ? 0.35 : 0.10;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;

        // Connect right neighbor
        if (c + 1 < cols) {
          const right = grid[c + 1][r];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(right.x, right.y);
          ctx.stroke();
        }

        // Connect bottom neighbor
        if (r + 1 < rows) {
          const bottom = grid[c][r + 1];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(bottom.x, bottom.y);
          ctx.stroke();
        }

        // Direct web link to cursor if close
        if (mouse.active && mDist < MOUSE_RADIUS * 0.6) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - mDist / (MOUSE_RADIUS * 0.6)) * 0.25})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
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
   SECURITY & AUTHENTICATION (admin1235 / Admin1235)
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
  const planType = prompt("Enter plan to activate: 'month' (₹50) or 'year' (₹95):");
  if (!planType) return;

  const days = planType.toLowerCase() === "year" ? 365 : 30;
  const planName = planType.toLowerCase() === "year" ? "1 Year Elite (₹95)" : "1 Month Premium (₹50)";
  const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);

  localStorage.setItem("dojo_plan", planName);
  localStorage.setItem("dojo_plan_expiry", expiry.toString());
  alert(`Plan Activated: ${planName}`);
  checkDojoPlan();
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

/* =========================================================
   TOURNAMENTS LOGIC
   ========================================================= */
function adminAddTournament() {
  openAdminModal("Enter Sensei Passcode for Tournament Update", (pass) => {
    if (!checkSenseiPass(pass)) {
      alert("Unauthorized: Incorrect Passcode!");
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
  const containerAdmin = document.getElementById("tournament-display");
  const containerStu = document.getElementById("student-tournament-display");
  const data = localStorage.getItem("upcoming_tournament");

  const html = !data
    ? "<p style='color:#666; font-size:0.8rem;'>No tournaments scheduled.</p>"
    : (() => {
        const t = JSON.parse(data);
        return `
          <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; margin: 8px 0;">
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
   LOGIN SCREEN INITIALIZATION
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  checkDojoPlan();
  renderTournamentUI();

  const passField = document.getElementById("admin-login-pass");
  if (passField) passField.value = "";

  const emailField = document.getElementById("admin-login-email");
  if (emailField) emailField.value = "";

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
