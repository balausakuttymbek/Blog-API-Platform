const API = "http://localhost:5000/api";

function getToken() {
    return localStorage.getItem("token");
}

function escapeHtml(str = "") {
    return str.replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[m]));
}

async function apiFetch(url, options = {}) {
    const token = getToken();
    if (!token) throw new Error("NO_TOKEN");

    const headers = {
        ...(options.headers || {}),
        Authorization: "Bearer " + token,
    };

    const res = await fetch(url, { ...options, headers });

    // если сервер вернул HTML или пусто — чтобы не падало json()
    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { message: text };
    }

    return { res, data };
}

document.addEventListener("DOMContentLoaded", async () => {
    const avatarEl = document.getElementById("avatar");
    const usernameEl = document.getElementById("username");
    const emailEl = document.getElementById("email");

    const editModal = document.getElementById("editModal");
    const editBtn = document.getElementById("editBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const saveBtn = document.getElementById("saveBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const oldPasswordEl = document.getElementById("oldPassword");
    const newUsernameEl = document.getElementById("newUsername");
    const newPasswordEl = document.getElementById("newPassword");

    // ===== if no token -> go login
    if (!getToken()) {
        window.location.href = "login.html";
        return;
    }

    // ===== LOAD PROFILE FROM BACKEND
    try {
        const { res, data } = await apiFetch(`${API}/auth/me`);
        if (!res.ok) {
            console.error("ME:", res.status, data);
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        const nameToShow = data.username || data.email || "User";

        usernameEl.innerText = nameToShow;
        emailEl.innerText = data.email || "";
        avatarEl.innerText = (nameToShow[0] || "U").toUpperCase();
    } catch (e) {
        console.error("Load profile error:", e);
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
    }

    // ===== OPEN MODAL
    editBtn.onclick = () => {
        // чистим поля
        oldPasswordEl.value = "";
        newUsernameEl.value = "";
        newPasswordEl.value = "";
        editModal.style.display = "flex";
    };

    // ===== CLOSE MODAL
    cancelBtn.onclick = () => {
        editModal.style.display = "none";
    };

    // ===== LOGOUT
    logoutBtn.onclick = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "login.html";
    };

    // ===== SAVE (PATCH /auth/me)
    saveBtn.onclick = async () => {
        const oldPassword = oldPasswordEl.value.trim();
        const username = newUsernameEl.value.trim();
        const newPassword = newPasswordEl.value.trim();

        if (!username && !newPassword) {
            alert("Nothing to update");
            return;
        }

        // если меняем пароль — требуем oldPassword
        if (newPassword && !oldPassword) {
            alert("Enter old password to change password");
            return;
        }

        const body = {};
        if (username) body.username = username;
        if (newPassword) {
            body.oldPassword = oldPassword;
            body.newPassword = newPassword;
        }

        try {
            const { res, data } = await apiFetch(`${API}/auth/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            console.log("UPDATE ME:", res.status, data);

            if (!res.ok) {
                alert(data.message || "Update failed");
                return;
            }

            const nameToShow = data.username || data.email || "User";
            usernameEl.innerText = escapeHtml(nameToShow);
            emailEl.innerText = escapeHtml(data.email || "");
            avatarEl.innerText = (nameToShow[0] || "U").toUpperCase();

            alert("✅ Profile updated");
            editModal.style.display = "none";
        } catch (e) {
            console.error("Update me error:", e);
            alert("Update error (check backend)");
        }
    };
});
