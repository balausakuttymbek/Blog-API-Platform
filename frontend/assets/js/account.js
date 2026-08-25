 document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const dropdown = document.getElementById("accountDropdown");

    if (!dropdown) return;

    if (user && user.loggedIn) {
        dropdown.innerHTML = `
      <li><a class="dropdown-item" href="account.html">My Account</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
    `;

        document.getElementById("logoutBtn").onclick = () => {
            localStorage.removeItem("user");
            window.location.href = "login.html";
        };
    } else {
        dropdown.innerHTML = `
      <li><a class="dropdown-item" href="login.html">Login</a></li>
    `;
    }
});
