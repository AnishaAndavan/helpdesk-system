document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (role !== "Admin") {
    alert("Access denied. Admins only.");
    window.location.href = "login.html";
    return;
  }

  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  });

  document.querySelectorAll(".sidebar ul li a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".sidebar ul li a").forEach((a) => a.classList.remove("active"));
      link.classList.add("active");
      document.querySelectorAll(".content-section").forEach((sec) => sec.classList.remove("active"));

      const text = link.textContent.trim();
      switch (text) {
        case "Dashboard":
          document.getElementById("dashboard-section").classList.add("active");
          loadDashboard();
          break;
        case "Manage Users":
          document.getElementById("manage-users-section").classList.add("active");
          loadUsers();
          break;
        case "All Tickets":
          document.getElementById("tickets-section").classList.add("active");
          loadAllTickets();
          break;
        case "Reports":
          document.getElementById("reports-section").classList.add("active");
          break;
        case "Settings":
          document.getElementById("settings-section").classList.add("active");
          break;
      }
    });
  });

  async function loadDashboard() {
    try {
      // Fetch stats
      const statsRes = await fetch("/api/tickets/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const stats = await statsRes.json();

      document.getElementById("total-tickets").textContent = stats.total || 0;
      document.getElementById("open-tickets").textContent = stats.open || 0;
      document.getElementById("assigned-tickets").textContent = stats.assigned || 0;
      document.getElementById("inprogress-tickets").textContent = stats.inProgress || 0;
      document.getElementById("resolved-tickets").textContent = stats.resolved || 0;

      const recentRes = await fetch("/api/tickets/recent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recentTickets = await recentRes.json();

      const tbody = document.getElementById("recentTicketsTableBody");
      tbody.innerHTML = "";

      if (!recentTickets.length) {
        tbody.innerHTML = "<tr><td colspan='5'>No recent tickets.</td></tr>";
        return;
      }

      recentTickets.forEach((t) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${t.id}</td>
          <td>${t.subject}</td>
          <td>${t.created_by_name || "Unknown"}</td>
          <td>${t.status}</td>
          <td>${new Date(t.created_at).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  }

  async function loadUsers() {
    try {
      const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } });
      const users = await res.json();
      const tbody = document.getElementById("usersTableBody");
      tbody.innerHTML = "";

      if (!users.length) {
        tbody.innerHTML = "<tr><td colspan='6'>No users found.</td></tr>";
        return;
      }

      users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.user_id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${new Date(user.created_at).toLocaleDateString()}</td>
          <td>
            <button class="delete-btn" data-id="${user.user_id}">Delete</button>
            ${user.role !== "Admin" ? `<button class="promote-btn" data-id="${user.user_id}">Promote</button>` : ""}
          </td>
        `;
        tbody.appendChild(row);
      });

      document.querySelectorAll(".delete-btn").forEach((btn) =>
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          if (confirm("Delete this user?")) {
            await fetch(`/api/users/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            e.target.closest("tr").remove();
          }
        })
      );

      document.querySelectorAll(".promote-btn").forEach((btn) =>
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          await fetch(`/api/users/${id}/promote`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("User promoted to Admin");
          loadUsers();
        })
      );
    } catch (err) {
      console.error("Error loading users:", err);
    }
  }

  async function loadAllTickets() {
    try {
      const ticketsRes = await fetch("/api/tickets/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tickets = await ticketsRes.json();

      const techRes = await fetch("/api/admin/technicians", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const technicians = await techRes.json();

      const tbody = document.getElementById("allTicketsTableBody");
      tbody.innerHTML = "";

      if (!tickets.length) {
        tbody.innerHTML = "<tr><td colspan='8'>No tickets found.</td></tr>";
        return;
      }

      tickets.forEach((ticket) => {
        const isAssigned = ticket.assigned_to !== null && ticket.status !== "Open";

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${ticket.id}</td>
          <td>${ticket.subject}</td>
          <td>${ticket.created_by_name}</td>
          <td>${ticket.status}</td>
          <td>
            <select class="assign-tech" data-ticket-id="${ticket.id}" ${isAssigned ? "disabled" : ""}>
              <option value="">--Select Technician--</option>
              ${technicians
                .map(
                  (t) => `
                <option value="${t.user_id}" ${t.user_id === ticket.assigned_to ? "selected" : ""}>
                  ${t.name}
                </option>`
                )
                .join("")}
            </select>
          </td>
          <td>${ticket.priority}</td>
          <td>${new Date(ticket.created_at).toLocaleString()}</td>
          <td>
            <button class="assign-btn" data-ticket-id="${ticket.id}" ${isAssigned ? "disabled" : ""}>
              ${isAssigned ? "Assigned" : "Assign"}
            </button>
          </td>
        `;
        tbody.appendChild(row);
      });

      document.querySelectorAll(".assign-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const ticketId = e.target.dataset.ticketId;
          const select = document.querySelector(`select[data-ticket-id="${ticketId}"]`);
          const techId = select.value;
          if (!techId) return alert("Please select a technician");

          try {
            const res = await fetch(`/api/tickets/assign/${ticketId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ technicianId: techId }),
            });

            if (res.ok) {
              alert("Ticket assigned successfully!");
              loadAllTickets();
              loadDashboard();
            } else {
              const error = await res.json();
              alert("Error: " + (error.message || "Could not assign ticket"));
            }
          } catch (err) {
            console.error(err);
            alert("Server error. Please try again.");
          }
        });
      });
    } catch (err) {
      console.error("Error loading tickets:", err);
    }
  }

  loadDashboard();
});
