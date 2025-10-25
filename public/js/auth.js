document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const msgEl = document.getElementById("message");

  msgEl.innerText = "";

  if (!email || !password) {
    msgEl.innerText = "Please enter both email and password.";
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      msgEl.innerText = data?.message || "Invalid credentials.";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    msgEl.style.color = "green";
    msgEl.innerText = "Login successful! Redirecting...";

    setTimeout(() => {
      switch (data.role) {
        case "Admin":
          window.location.href = "/admin_dashboard.html";
          break;
        case "Technician":
          window.location.href = "/technician_dashboard.html";
          break;
        case "Employee":
          window.location.href = "/employee_dashboard.html";
          break;
        default:
          msgEl.innerText = "Unknown role. Contact admin.";
      }
    }, 800);
  } catch (err) {
    console.error("Login error:", err);
    msgEl.innerText = "Server error. Please try again later.";
  }
});
