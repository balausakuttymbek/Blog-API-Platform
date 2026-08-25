document.addEventListener("DOMContentLoaded", function () {
    /* Variables */
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');
    const registerForm = document.querySelector('.form-box.register form');
    const loginForm = document.querySelector('.form-box.login form');
    const languageDropdown = document.getElementById("language-btn");
    const faqListItems = document.querySelectorAll("#faq-list li");

    /* Toggle Forms */
    registerBtn.addEventListener('click', () => {
        container.classList.add('active');
        document.querySelector('.form-box.register').style.display = 'none';
        setTimeout(() => {
            document.querySelector('.form-box.register').style.display = 'block';
        }, 0);
    });

    loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
        document.querySelector('.form-box.login').style.display = 'none';
        setTimeout(() => {
            document.querySelector('.form-box.login').style.display = 'block';
        }, 0);
    });

    /* Language Dropdown */
    languageDropdown?.addEventListener("click", () => {
        document.getElementById("language-dropdown").classList.toggle("show");
    });

    /* FAQ Accordion */
    faqListItems.forEach((item) => {
        item.addEventListener("click", () => item.classList.toggle("show"));
    });

    /* Registration */
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validateForm(registerForm)) return;

        const username = registerForm.querySelector('input[placeholder="Username"]').value.trim();
        const email = registerForm.querySelector('input[placeholder="Email"]').value.trim();
        const password = registerForm.querySelector('input[placeholder="Password"]').value.trim();

        localStorage.setItem("userName", username);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPassword", password);

        alert("✅ Registration successful. You can now log in.");
        container.classList.remove('active');
    });

    /* Login */
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validateForm(loginForm)) return;

        const username = loginForm.querySelector('input[placeholder="Username"]').value.trim();
        const password = loginForm.querySelector('input[placeholder="Password"]').value.trim();
        const storedUsername = localStorage.getItem("userName");
        const storedPassword = localStorage.getItem("userPassword");

        if (username === storedUsername && password === storedPassword) {
            alert(`✅ Welcome back, ${username}!`);

            localStorage.setItem("user", JSON.stringify({
                username: username,
                email: localStorage.getItem("userEmail"),
                password: storedPassword,
                loggedIn: true
            }));

            window.location.href = "homepage_1.html";
        }

    });

    /* API Test */
    fetch('https://jsonplaceholder.typicode.com/users/1')
        .then(response => response.json())
        .then(user => console.log("✅ API работает: ", user))
        .catch(error => console.error("❌ Ошибка API", error));

    /* Mobile Menu Toggle */
    document.getElementById('mobileMenuBtn').addEventListener('click', function () {
        const mobileMenu = document.getElementById('mobileMenu');
        mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
    });

    /* Close Dropdown on Outside Click */
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
});



function validateForm(form) {
    const inputs = form.querySelectorAll('input');
    let isValid = true;

    inputs.forEach(input => {
        if (input.value.trim() === '') {
            isValid = false;
            input.classList.add('error');
            showError(input, 'Please fill out this field.');
        } else {
            input.classList.remove('error');
            removeError(input);
        }

        if (input.name === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value.trim())) {
                isValid = false;
                input.classList.add('error');
                showError(input, 'Некорректный формат email');
            }
        }
    });

    return isValid;
}



function showError(input, message) {
    let errorElement = input.parentElement.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.classList.add('error-message');
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
        input.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function removeError(input) {
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}