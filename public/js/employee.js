document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "http://localhost:5000"; 
  const token = localStorage.getItem("token");
  const ticketsTableBody = document.getElementById("ticketsTableBody");
  const ticketMessage = document.getElementById("ticketMessage");
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
      const target = link.dataset.section;

      document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));

      const section = document.getElementById(target);
      if (section) section.classList.add("active");

      document.querySelectorAll(".sidebar ul li a").forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      if (target === "my-tickets") loadTickets();
    });
  });

  async function loadTickets() {
    ticketsTableBody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    try {
      const res = await fetch(`${BASE_URL}/api/tickets/mytickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to fetch tickets");

      const tickets = await res.json();

      if (tickets.length === 0) {
        ticketsTableBody.innerHTML = "<tr><td colspan='5'>No tickets found.</td></tr>";
      } else {
        ticketsTableBody.innerHTML = tickets.map(ticket => `
          <tr>
            <td>${ticket.id}</td>
            <td>${ticket.subject}</td>
            <td>${ticket.status}</td>
            <td>${ticket.priority}</td>
            <td>${new Date(ticket.created_at).toLocaleString()}</td>
          </tr>
        `).join("");
      }

      document.getElementById("total-tickets").innerText = tickets.length;
      document.getElementById("open-tickets").innerText = tickets.filter(t => t.status === "Open").length;
      document.getElementById("resolved-tickets").innerText = tickets.filter(t => t.status === "Resolved").length;
    } catch (err) {
      ticketsTableBody.innerHTML = "<tr><td colspan='5'>Error loading tickets.</td></tr>";
      console.error(err);
    }
  }

  const ticketForm = document.getElementById("ticketForm");
  if (ticketForm) {
    ticketForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const subject = document.getElementById("subject").value.trim();
      const description = document.getElementById("description").value.trim();
      const priority = document.getElementById("priority").value;

      if (!subject || !description) {
        ticketMessage.style.color = "red";
        ticketMessage.innerText = "Please fill all fields.";
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/tickets/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ subject, description, priority })
        });

        const data = await res.json();

        if (res.ok) {
          ticketMessage.style.color = "green";
          ticketMessage.innerText = data.message || "Ticket created successfully!";
          ticketForm.reset();
          loadTickets(); 
        } else {
          ticketMessage.style.color = "red";
          ticketMessage.innerText = data.message || "Error creating ticket.";
        }
      } catch (err) {
        console.error(err);
        ticketMessage.style.color = "red";
        ticketMessage.innerText = "Server error. Please try again.";
      }
    });
  }

  loadTickets();
});
