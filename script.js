/* =========================================================
   AKSHAR DOJO: MOUSE-REACTIVE INTERACTIVE SQUARE NET
   ========================================================= */
(function initInteractiveNet() {
  const canvas = document.getElementById("motion-net-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let points = [];
  const SPACING = 55;
  const MOUSE_RADIUS = 130;

  const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

  window.addEventListener("mousemove", (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX;
      mouse.targetY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    mouse.targetX = -1000;
    mouse.targetY = -1000;
  });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initGrid();
  }

  function initGrid() {
    points = [];
    const cols = Math.ceil(width / SPACING) + 2;
    const rows = Math.ceil(height / SPACING) + 2;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const ox = c * SPACING;
        const oy = r * SPACING;
        points.push({
          x: ox,
          y: oy,
          origX: ox,
          origY: oy,
          vx: 0,
          vy: 0,
          col: c,
          row: r
        });
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    mouse.x += (mouse.targetX - mouse.x) * 0.15;
    mouse.y += (mouse.targetY - mouse.y) * 0.15;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * 35;
        const angle = Math.atan2(dy, dx);
        p.vx -= Math.cos(angle) * force * 0.08;
        p.vy -= Math.sin(angle) * force * 0.08;
      }

      p.vx += (p.origX - p.x) * 0.05;
      p.vy += (p.origY - p.y) * 0.05;

      p.vx *= 0.82;
      p.vy *= 0.82;

      p.x += p.vx;
      p.y += p.vy;
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];

      for (let j = i + 1; j < points.length; j++) {
        const p2 = points[j];
        const isNeighbor =
          (p1.col === p2.col && Math.abs(p1.row - p2.row) === 1) ||
          (p1.row === p2.row && Math.abs(p1.col - p2.col) === 1);

        if (isNeighbor) {
          const mDist = Math.sqrt((mouse.x - p1.x) ** 2 + (mouse.y - p1.y) ** 2);
          const alpha = mDist < MOUSE_RADIUS ? 0.28 : 0.08;

          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(animate);
})();

/* =========================================================
   AUTHENTICATION: ONLY admin1235 / Admin1235
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
  if (passField) {
    passField.value = "";
  }

  const emailField = document.getElementById("admin-login-email");
  if (emailField) {
    emailField.value = "";
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
