document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = document.getElementById("role").value;
  const msgEl = document.getElementById("message");

  if (!name || !email || !password || !confirmPassword || !role) {
    msgEl.style.color = "red";
    msgEl.innerText = "Please fill all fields and select a role.";
    return;
  }

  if (password !== confirmPassword) {
    msgEl.style.color = "red";
    msgEl.innerText = "Passwords do not match.";
    return;
  }

  console.log("Sending signup data:", { name, email, password, role });

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();

    if (res.ok) {
      msgEl.style.color = "green";
      msgEl.innerText = "Account created successfully! Redirecting to login...";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      msgEl.style.color = "red";
      msgEl.innerText = data.message;
    }
  } catch (err) {
    console.error(err);
    msgEl.style.color = "red";
    msgEl.innerText = "Server error. Try again later.";
  }
});
