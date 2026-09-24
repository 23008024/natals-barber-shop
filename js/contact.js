
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    const contactSuccess = document.getElementById("contactSuccess");

    if (!contactForm) {
        console.error("Contact form not found.");
        return;
    }

    const FORMSPREE_ENDPOINT = "https://formspree.io/f/mkjgzjgd";

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');

        if (!submitButton) {
            console.error("Contact form submit button not found.");
            return;
        }

        // Prevent multiple submissions
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.textContent = "Sending...";

        const formData = new FormData(contactForm);

        // Add a clear subject for the email received through Formspree
        formData.append(
            "_subject",
            `New Contact Enquiry - Natal's Barber Shop`
        );

        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Formspree submission failed.");
            }

            // Clear the form
            contactForm.reset();

            // Show success message
            if (contactSuccess) {
                contactSuccess.hidden = false;
                contactSuccess.style.display = "block";

                contactSuccess.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            submitButton.textContent = "Message Sent";

        } catch (error) {
            console.error("Contact form error:", error);

            alert(
                "Sorry, your message could not be sent right now. Please try again."
            );

            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
});