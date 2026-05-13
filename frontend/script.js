// === Campus Club Event Management System ===
// Frontend talks to the Express API at /api on port 3000.

const API_BASE = "http://localhost:3000/api";

// Auth state. Token persists to localStorage so refresh keeps you logged in.
let currentUser = null;
let token = localStorage.getItem("ccems_token");
const storedUser = localStorage.getItem("ccems_user");
if (storedUser) {
  try { currentUser = JSON.parse(storedUser); } catch { currentUser = null; }
}

// === Utility: fetch wrapper that adds JWT and parses errors ===
async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// === Page navigation ===
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active-page"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(pageId).classList.add("active-page");
  const btn = document.querySelector(`[data-page="${pageId}"]`);
  if (btn) btn.classList.add("active");
  if (pageId === "dashboardPage") loadSummary();
  if (pageId === "reportPage") loadReports();
  if (pageId === "rsvpPage" || pageId === "attendancePage") loadEventDropdowns();
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.getAttribute("data-page")));
});

// === Auth: login/register toggle ===
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showLoginBtn = document.getElementById("showLoginBtn");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const authTitle = document.getElementById("authTitle");
const authMessage = document.getElementById("authMessage");
const logoutBtn = document.getElementById("logoutBtn");

showLoginBtn.addEventListener("click", () => {
  loginForm.style.display = "";
  registerForm.style.display = "none";
  showLoginBtn.classList.add("active");
  showRegisterBtn.classList.remove("active");
  authTitle.textContent = "Login";
});

showRegisterBtn.addEventListener("click", () => {
  loginForm.style.display = "none";
  registerForm.style.display = "";
  showRegisterBtn.classList.add("active");
  showLoginBtn.classList.remove("active");
  authTitle.textContent = "Register";
});

// === Login ===
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";
  try {
    const result = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
      }),
    });
    token = result.token;
    currentUser = result.user;
    localStorage.setItem("ccems_token", token);
    localStorage.setItem("ccems_user", JSON.stringify(currentUser));
    updateUserBadge();
    authMessage.textContent = `Logged in as ${currentUser.name}.`;
    loginForm.reset();
    showPage("dashboardPage");
  } catch (err) {
    authMessage.textContent = `Login failed: ${err.message}`;
  }
});

// === Register ===
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";
  try {
    await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: document.getElementById("registerName").value,
        email: document.getElementById("registerEmail").value,
        password: document.getElementById("registerPassword").value,
        role: document.getElementById("registerRole").value,
      }),
    });
    authMessage.textContent = "Account created. You can now log in.";
    registerForm.reset();
    showLoginBtn.click();
  } catch (err) {
    authMessage.textContent = `Registration failed: ${err.message}`;
  }
});

// === Logout ===
logoutBtn.addEventListener("click", () => {
  token = null;
  currentUser = null;
  localStorage.removeItem("ccems_token");
  localStorage.removeItem("ccems_user");
  updateUserBadge();
  authMessage.textContent = "Logged out.";
  showPage("loginPage");
});

function updateUserBadge() {
  const badge = document.getElementById("currentUserBadge");
  if (currentUser) {
    badge.textContent = `${currentUser.name} (${currentUser.role})`;
    logoutBtn.style.display = "";
  } else {
    badge.textContent = "Not logged in";
    logoutBtn.style.display = "none";
  }
}

// === Create Event ===
document.getElementById("eventForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("eventMessage");
  msg.textContent = "";
  if (!token) { msg.textContent = "Log in as an officer to create events."; return; }
  try {
    const result = await api("/events", {
      method: "POST",
      body: JSON.stringify({
        club_id: currentUser.club_id || 1,
        event_name: document.getElementById("eventName").value,
        event_date: document.getElementById("eventDate").value,
        event_location: document.getElementById("eventLocation").value,
      }),
    });
    msg.textContent = `Event created. Event ID is ${result.event_id}.`;
    e.target.reset();
    showPage("reportPage");
  } catch (err) {
    msg.textContent = `Error: ${err.message}`;
  }
});

// === RSVP ===
document.getElementById("rsvpForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("rsvpMessage");
  msg.textContent = "";
  if (!token) { msg.textContent = "You must log in to RSVP."; return; }
  try {
    const result = await api("/rsvps", {
      method: "POST",
      body: JSON.stringify({
        event_id: Number(document.getElementById("rsvpEventId").value),
        rsvp_status: document.getElementById("rsvpStatus").value,
      }),
    });
    msg.textContent = `RSVP recorded as "${result.rsvp_status}".`;
    e.target.reset();
    showPage("reportPage");
  } catch (err) {
    msg.textContent = `Error: ${err.message}`;
  }
});

// === Attendance ===
document.getElementById("attendanceForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("attendanceMessage");
  msg.textContent = "";
  if (!token) { msg.textContent = "Officers only. Please log in."; return; }
  try {
    const result = await api("/attendance", {
      method: "POST",
      body: JSON.stringify({
        user_id: Number(document.getElementById("attendanceUserId").value),
        event_id: Number(document.getElementById("attendanceEventId").value),
        attended: document.getElementById("attended").value === "true",
      }),
    });
    msg.textContent = `Attendance recorded (ID ${result.attendance_id}).`;
    e.target.reset();
    showPage("reportPage");
  } catch (err) {
    msg.textContent = `Error: ${err.message}`;
  }
});

// === Dashboard summary ===
async function loadSummary() {
  try {
    const s = await api("/reports/summary");
    document.getElementById("userCount").textContent = s.total_users;
    document.getElementById("eventCount").textContent = s.total_events;
    document.getElementById("rsvpCount").textContent = s.total_going;
    document.getElementById("attendanceCount").textContent = s.total_attended;
  } catch (err) {
    console.error("Summary load failed:", err);
  }
}

// === Reports tables ===
async function loadReports() {
  try {
    const [users, events, rsvps, attendance] = await Promise.all([
      api("/reports/users"),
      api("/events"),
      api("/rsvps"),
      api("/attendance"),
    ]);
    fillTable("usersTable", users, u =>
      `<tr><td>${u.user_id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td></tr>`
    );
    fillTable("eventsTable", events, e =>
      `<tr><td>${e.event_id}</td><td>${e.event_name}</td><td>${formatDate(e.event_date)}</td><td>${e.event_location ?? ""}</td><td>${e.creator_name ?? ""}</td></tr>`
    );
    fillTable("rsvpsTable", rsvps, r =>
      `<tr><td>${r.rsvp_id}</td><td>${r.user_name}</td><td>${r.event_name}</td><td>${r.rsvp_status}</td></tr>`
    );
    fillTable("attendanceTable", attendance, a =>
      `<tr><td>${a.attendance_id}</td><td>${a.user_name}</td><td>${a.event_name}</td><td>${a.attended ? "Yes" : "No"}</td></tr>`
    );
  } catch (err) {
    console.error("Reports load failed:", err);
  }
}

function fillTable(tbodyId, rows, rowHtml) {
  const tbody = document.getElementById(tbodyId);
  tbody.innerHTML = rows.map(rowHtml).join("");
}

function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toISOString().slice(0, 10);
}

// === Event dropdown for RSVP page ===
async function loadEventDropdowns() {
  try {
    const events = await api("/events");
    const select = document.getElementById("rsvpEventId");
    if (select) {
      const current = select.value;
      select.innerHTML = `<option value="">Select event</option>` +
        events.map(e => `<option value="${e.event_id}">${e.event_name} (${formatDate(e.event_date)})</option>`).join("");
      select.value = current;
    }
  } catch (err) {
    console.error("Event dropdown load failed:", err);
  }
}

// === Init ===
updateUserBadge();
loadSummary();