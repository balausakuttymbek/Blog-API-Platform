document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");

    if (!form) {
        console.warn("contactForm not found");
        return;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const data = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value.trim(),
            message: form.message.value.trim(),
        };

        console.log("📩 Contact form data:", data);

        alert("✅ Message captured (check console)");

        form.reset();
    });
});
