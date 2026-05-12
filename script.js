let currentUser = null;

let users = [
  {
    user_id: 1,
    name: "John Smith",
    email: "john@umbc.edu",
    role: "member",
    password: "password123"
  },
  {
    user_id: 2,
    name: "Sarah Johnson",
    email: "sarah@umbc.edu",
    role: "member",
    password: "password123"
  },
  {
    user_id: 3,
    name: "Michael Brown",
    email: "michael@umbc.edu",
    role: "officer",
    password: "admin123"
  }
];

let events = [
  {
    event_id: 1,
    event_name: "Welcome Event",
    event_date: "2026-04-10",
    event_location: "Student Center",
    created_by: 3
  },
  {
    event_id: 2,
    event_name: "Networking Night",
    event_date: "2026-04-20",
    event_location: "Library Hall",
    created_by: 3
  }
];

let rsvps = [
  {
    rsvp_id: 1,
    user_id: 1,
    event_id: 1,
    rsvp_status: "Going"
  },
  {
    rsvp_id: 2,
    user_id: 2,
    event_id: 1,
    rsvp_status: "Going"
  }
];

let attendance = [
  {
    attendance_id: 1,
    user_id: 1,
    event_id: 1,
    attended: true
  },
  {
    attendance_id: 2,
    user_id: 2,
    event_id: 1,
    attended: true
  }
];

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
  });

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active-page");

  const activeButton = document.querySelector(`[data-page="${pageId}"]`);
  if (activeButton) {
    activeButton.classList.add("active");
  }
}

document.querySelectorAll(".nav-btn").forEach(button => {
  button.addEventListener("click", function () {
    const pageId = this.getAttribute("data-page");
    showPage(pageId);
  });
});

function updateDashboard() {
  document.getElementById("userCount").textContent = users.length;
  document.getElementById("eventCount").textContent = events.length;
  document.getElementById("rsvpCount").textContent = rsvps.length;
  document.getElementById("attendanceCount").textContent = attendance.length;
}

function renderTables() {
  const usersTable = document.getElementById("usersTable");
  const eventsTable = document.getElementById("eventsTable");
  const rsvpsTable = document.getElementById("rsvpsTable");
  const attendanceTable = document.getElementById("attendanceTable");

  usersTable.innerHTML = "";
  eventsTable.innerHTML = "";
  rsvpsTable.innerHTML = "";
  attendanceTable.innerHTML = "";

  users.forEach(user => {
    usersTable.innerHTML += `
      <tr>
        <td>${user.user_id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
      </tr>
    `;
  });

  events.forEach(event => {
    eventsTable.innerHTML += `
      <tr>
        <td>${event.event_id}</td>
        <td>${event.event_name}</td>
        <td>${event.event_date}</td>
        <td>${event.event_location}</td>
        <td>${event.created_by}</td>
      </tr>
    `;
  });

  rsvps.forEach(rsvp => {
    rsvpsTable.innerHTML += `
      <tr>
        <td>${rsvp.rsvp_id}</td>
        <td>${rsvp.user_id}</td>
        <td>${rsvp.event_id}</td>
        <td>${rsvp.rsvp_status}</td>
      </tr>
    `;
  });

  attendance.forEach(record => {
    attendanceTable.innerHTML += `
      <tr>
        <td>${record.attendance_id}</td>
        <td>${record.user_id}</td>
        <td>${record.event_id}</td>
        <td>${record.attended ? "Yes" : "No"}</td>
      </tr>
    `;
  });

  updateDashboard();
}

document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("loginName").value;
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const role = document.getElementById("loginRole").value;

  const newUser = {
    user_id: users.length + 1,
    name: name,
    email: email,
    role: role,
    password: password
  };

  users.push(newUser);
  currentUser = newUser;

  document.getElementById("currentUserBadge").textContent =
    `${newUser.name} (${newUser.role})`;

  document.getElementById("loginMessage").textContent =
    `Logged in successfully as ${newUser.name}. Your User ID is ${newUser.user_id}.`;

  this.reset();
  renderTables();
  showPage("dashboardPage");
});

document.getElementById("eventForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const createdBy = currentUser ? currentUser.user_id : 3;

  const newEvent = {
    event_id: events.length + 1,
    event_name: document.getElementById("eventName").value,
    event_date: document.getElementById("eventDate").value,
    event_location: document.getElementById("eventLocation").value,
    created_by: createdBy
  };

  events.push(newEvent);

  document.getElementById("eventMessage").textContent =
    `Event created successfully. Event ID is ${newEvent.event_id}.`;

  this.reset();
  renderTables();
  showPage("reportPage");
});

document.getElementById("rsvpForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const newRsvp = {
    rsvp_id: rsvps.length + 1,
    user_id: Number(document.getElementById("rsvpUserId").value),
    event_id: Number(document.getElementById("rsvpEventId").value),
    rsvp_status: document.getElementById("rsvpStatus").value
  };

  rsvps.push(newRsvp);

  document.getElementById("rsvpMessage").textContent =
    `RSVP submitted successfully. RSVP ID is ${newRsvp.rsvp_id}.`;

  this.reset();
  renderTables();
  showPage("reportPage");
});

document.getElementById("attendanceForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const newAttendance = {
    attendance_id: attendance.length + 1,
    user_id: Number(document.getElementById("attendanceUserId").value),
    event_id: Number(document.getElementById("attendanceEventId").value),
    attended: document.getElementById("attended").value === "true"
  };

  attendance.push(newAttendance);

  document.getElementById("attendanceMessage").textContent =
    `Attendance recorded successfully. Attendance ID is ${newAttendance.attendance_id}.`;

  this.reset();
  renderTables();
  showPage("reportPage");
});

renderTables();