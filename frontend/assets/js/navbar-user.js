document.addEventListener("DOMContentLoaded", () => {
    const accountLink = document.getElementById("accountLink");
    const loginMenuLink = document.querySelector('a[href="login.html"]'); // твой пункт Login
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    // если не залогинен — ничего не меняем
    if (!token || !user || !user.email) return;

    // 1) показать email в аккаунте
    if (accountLink) {
        accountLink.innerHTML = `<i class="fas fa-user"></i> ${user.email}`;
    }

    // 2) пункт Login заменить на Logout (по желанию)
    if (loginMenuLink) {
        loginMenuLink.textContent = "Logout";
        loginMenuLink.href = "#";
        loginMenuLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    }
});
