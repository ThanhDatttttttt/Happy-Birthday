// ========= CONFIG =========
const CORRECT_PASSWORD = "17/01/2006";

const loginScreen = document.getElementById("login-screen");
const birthdayScreen = document.getElementById("birthday-screen");
const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("password");
const togglePassBtn = document.getElementById("toggle-pass");
const errorMsg = document.getElementById("error-msg");
const backBtn = document.getElementById("back-btn");
const celebrateBtn = document.getElementById("celebrate-btn");
const toggleFxBtn = document.getElementById("toggle-fx");

const bubblesContainer = document.getElementById("bubbles-container");
const heartsContainer = document.getElementById("hearts-container");
const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

// ========= STATE =========
let fxEnabled = !reduceMotion;
let bubbleTimer = null;
let heartTimer = null;

let confettiRunning = false;
let confettiPieces = [];
let rafId = null;

// ========= BACKGROUND DYNAMIC (MỚI) =========
let bgPhase = 0;
function updateBackground() {
  bgPhase += 0.008;
  const hue1 = (290 + Math.sin(bgPhase) * 20 + 360) % 360;
  const hue2 = (320 + Math.sin(bgPhase * 1.3) * 25 + 360) % 360;
  
  document.body.style.background = `
    radial-gradient(1200px 600px at ${Math.sin(bgPhase*0.7)*20+50}% ${Math.cos(bgPhase*0.5)*15+50}%, 
      hsl(${hue1}, 65%, 88%), transparent 50%),
    radial-gradient(800px 400px at ${Math.cos(bgPhase)*30+50}% ${Math.sin(bgPhase*1.1)*25+30}%, 
      hsl(${hue2}, 60%, 92%), transparent 45%),
    linear-gradient(135deg, 
      hsl(${hue1}, 60%, 92%) 0%, 
      hsl(${Math.sin(bgPhase*0.8)*15+310}, 55%, 94%) 25%,
      hsl(${hue2}, 58%, 93%) 55%, 
      hsl(${Math.cos(bgPhase*0.6)*20+340}, 62%, 95%) 85%,
      hsl(${hue1}, 55%, 97%) 100%)
  `;
  
  requestAnimationFrame(updateBackground);
}

// ========= HELPERS =========
function setError(text) {
  errorMsg.textContent = text;
  passwordInput.setAttribute("aria-invalid", text ? "true" : "false");
}

function showBirthday() {
  loginScreen.classList.add("hidden");
  birthdayScreen.classList.remove("hidden");
  setError("");
  if (fxEnabled) burst();
  if (fxEnabled) shootConfetti(160);
}

function showLogin() {
  birthdayScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  setError("");
  passwordInput.value = "";
  passwordInput.focus();
}

function shake(el) {
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "shake .35s ease";
}

// ========= LOGIN =========
function handleLogin() {
  const value = passwordInput.value.trim();
  if (value === CORRECT_PASSWORD) {
    showBirthday();
  } else {
    setError("❌ Sai mật khẩu rồi đó, thử lại nha 💔");
    passwordInput.value = "";
    passwordInput.focus();
    shake(loginScreen);
  }
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleLogin();
});

togglePassBtn.addEventListener("click", () => {
  const isPass = passwordInput.type === "password";
  passwordInput.type = isPass ? "text" : "password";
  togglePassBtn.textContent = isPass ? "🙈" : "👁";
});

// ========= BONG BÓNG (GIỮ NGUYÊN MÀU) =========
const bubbleColors = [
  "rgba(255, 220, 245, 0.55)",
  "rgba(230, 210, 255, 0.55)",
  "rgba(210, 230, 255, 0.55)",
  "rgba(220, 255, 245, 0.55)",
  "rgba(255, 235, 220, 0.55)",
];

function createBubble() {
  if (!fxEnabled) return;
  const b = document.createElement("div");
  b.className = "bubble";

  // GIỮ NGUYÊN kích thước TO + màu pastel
  const size = Math.random() * 75 + 45;        
  const left = Math.random() * 100;
  const duration = Math.random() * 6 + 8;      
  const drift = (Math.random() - 0.5) * 200;
  const color = bubbleColors[(Math.random() * bubbleColors.length) | 0];

  b.style.left = left + "vw";
  b.style.width = size + "px";
  b.style.height = size + "px";
  b.style.animationDuration = duration + "s";
  b.style.setProperty("--drift", drift + "px");
  b.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,.95), ${color})`;
  b.style.border = "2px solid rgba(255,255,255,0.85)";

  bubblesContainer.appendChild(b);
  setTimeout(() => b.remove(), duration * 1000 + 100);
}

// ========= HEARTS =========
const heartChars = ["❤", "💗", "💖", "💕", "💞"];
const heartColors = ["#ff78c4", "#ff9ed8", "#c78bff", "#ffa5d8", "#ff8fb8"];

function createHeart() {
  if (!fxEnabled) return;
  const h = document.createElement("span");
  h.className = "heart";
  h.textContent = heartChars[(Math.random() * heartChars.length) | 0];

  const size = Math.random() * 18 + 16;
  const left = Math.random() * 100;
  const duration = Math.random() * 4 + 6;
  const rotation = (Math.random() - 0.5) * 360;
  const color = heartColors[(Math.random() * heartColors.length) | 0];

  h.style.left = left + "vw";
  h.style.fontSize = size + "px";
  h.style.animationDuration = duration + "s";
  h.style.setProperty("--rotation", rotation + "deg");
  h.style.color = color;

  heartsContainer.appendChild(h);
  setTimeout(() => h.remove(), duration * 1000 + 50);
}

function startAmbientFx() {
  stopAmbientFx();
  if (!fxEnabled) return;
  bubbleTimer = setInterval(createBubble, 380);
  heartTimer = setInterval(createHeart, 360);

  for (let i = 0; i < 10; i++) setTimeout(createBubble, i * 160);
  for (let i = 0; i < 12; i++) setTimeout(createHeart, i * 140);
}

function stopAmbientFx() {
  if (bubbleTimer) clearInterval(bubbleTimer);
  if (heartTimer) clearInterval(heartTimer);
  bubbleTimer = null;
  heartTimer = null;
}

function burst() {
  for (let i = 0; i < 35; i++) setTimeout(createBubble, i * 35);
  for (let i = 0; i < 40; i++) setTimeout(createHeart, i * 30);
}

// ========= CONFETTI =========
function resizeCanvas() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  confettiCanvas.width = Math.floor(window.innerWidth * dpr);
  confettiCanvas.height = Math.floor(window.innerHeight * dpr);
  confettiCanvas.style.width = window.innerWidth + "px";
  confettiCanvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function rand(min, max) { return Math.random() * (max - min) + min; }

function shootConfetti(count = 140) {
  if (!fxEnabled) return;
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: rand(0, window.innerWidth),
      y: rand(-30, -window.innerHeight * 0.4),
      w: rand(6, 12),
      h: rand(8, 16),
      vx: rand(-1.2, 1.2),
      vy: rand(2.2, 5.2),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.12, 0.12),
      color: `hsl(${rand(290, 360)}, ${rand(70, 95)}%, ${rand(55, 70)}%)`,
      alpha: rand(0.85, 1),
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    tickConfetti();
  }
}

function tickConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  confettiPieces = confettiPieces.filter(p => p.y < window.innerHeight + 40);
  for (const p of confettiPieces) {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }

  if (confettiPieces.length === 0) {
    confettiRunning = false;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    return;
  }

  rafId = requestAnimationFrame(tickConfetti);
}

// ========= BUTTONS =========
backBtn.addEventListener("click", () => {
  showLogin();
});

celebrateBtn.addEventListener("click", () => {
  burst();
  shootConfetti(220);
});

toggleFxBtn.addEventListener("click", () => {
  fxEnabled = !fxEnabled;
  toggleFxBtn.setAttribute("aria-pressed", fxEnabled ? "true" : "false");
  toggleFxBtn.textContent = fxEnabled ? "Hiệu ứng: Bật" : "Hiệu ứng: Tắt";

  if (fxEnabled) {
    startAmbientFx();
  } else {
    stopAmbientFx();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    confettiPieces = [];
    bubblesContainer.innerHTML = "";
    heartsContainer.innerHTML = "";
  }
});

// ========= INIT =========
updateBackground();  // ⭐ MỚI: Background động
startAmbientFx();
