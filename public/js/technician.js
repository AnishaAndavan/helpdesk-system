document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const logoutBtn = document.getElementById("logout-btn");

  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login.html";
  });

  document.querySelectorAll(".sidebar ul li a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const text = link.textContent.trim();

      document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));

      switch (text) {
        case "Dashboard":
          document.getElementById("dashboard-section").classList.add("active");
          loadDashboardStats();
          break;
        case "My Tickets":
          document.getElementById("my-tickets-section").classList.add("active");
          loadAssignedTickets();
          break;
        case "Reports":
          document.getElementById("reports-section").classList.add("active");
          break;
        case "Settings":
          document.getElementById("settings-section").classList.add("active");
          break;
      }

      document.querySelectorAll(".sidebar ul li a").forEach(a => a.classList.remove("active"));
      link.classList.add("active");
    });
  });

  async function loadDashboardStats() {
    try {
      const res = await fetch("/api/tickets/assigned", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tickets = await res.json();

      document.getElementById("assigned-tickets").textContent = tickets.length;
      document.getElementById("open-tickets").textContent = tickets.filter(t => t.status === "Open").length;
      document.getElementById("inprogress-tickets").textContent = tickets.filter(t => t.status === "In Progress").length;
      document.getElementById("closed-tickets").textContent = tickets.filter(t => t.status === "Resolved").length;
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    }
  }

  async function loadAssignedTickets() {
    const tbody = document.getElementById("myTicketsTableBody");
    tbody.innerHTML = "<tr><td colspan='6'>Loading tickets...</td></tr>";

    try {
      const res = await fetch("/api/tickets/assigned", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tickets = await res.json();

      if (tickets.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6'>No tickets assigned.</td></tr>";
        return;
      }

      tbody.innerHTML = "";
      tickets.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
    <td>${t.id}</td>
    <td>${t.subject}</td>
    <td>${t.description}</td>
    <td>${t.priority}</td>
    <td>${t.employee_name}</td>
    <td>${t.employee_email}</td>
    <td>
      <select data-id="${t.id}" class="status-select">
        <option value="Open" ${t.status === "Open" ? "selected" : ""}>Open</option>
        <option value="In Progress" ${t.status === "In Progress" ? "selected" : ""}>In Progress</option>
        <option value="Resolved" ${t.status === "Resolved" ? "selected" : ""}>Resolved</option>
      </select>
    </td>
    <td>${new Date(t.created_at).toLocaleString()}</td>
  `;
        tbody.appendChild(row);
      });

      document.querySelectorAll(".status-select").forEach(select => {
        select.addEventListener("change", async (e) => {
          const ticketId = e.target.dataset.id;
          const newStatus = e.target.value;

          try {
            const res = await fetch(`/api/tickets/update/${ticketId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (res.ok) {
              loadDashboardStats(); 
            } else {
              alert(data.message || "Failed to update status");
            }
          } catch (err) {
            console.error(err);
            alert("Server error while updating status");
          }
        });
      });

    } catch (err) {
      console.error("Error loading assigned tickets:", err);
      tbody.innerHTML = "<tr><td colspan='6'>Server error.</td></tr>";
    }
  }

  loadDashboardStats();
});
