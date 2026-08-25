const API = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
    // ===== LOGIN =====
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailEl = document.getElementById("email");
            const passEl = document.getElementById("password");

            const email = emailEl ? emailEl.value.trim() : "";
            const password = passEl ? passEl.value.trim() : "";

            if (!email || !password) {
                alert("Email and password required");
                return;
            }

            try {
                const res = await fetch(`${API}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Login failed");
                    return;
                }

                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify({ email }));

                window.location.href = "homepage_1.html";
            } catch (err) {
                console.error("Login fetch error:", err);
                alert("Backend is not running / fetch error");
            }
        });
    }

    // ===== REGISTER =====
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailEl = document.getElementById("regEmail");
            const passEl = document.getElementById("regPassword");

            const email = emailEl ? emailEl.value.trim() : "";
            const password = passEl ? passEl.value.trim() : "";

            if (!email || !password) {
                alert("Email and password required");
                return;
            }

            try {
                const res = await fetch(`${API}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Register failed");
                    return;
                }

                alert("Registered успешно! Теперь войди (Login).");
            } catch (err) {
                console.error("Register fetch error:", err);
                alert("Backend is not running / fetch error");
            }
        });
    }
});
