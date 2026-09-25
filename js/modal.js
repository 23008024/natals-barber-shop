
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("offerModal");

    if (!modal) return;

    const closeButtons = modal.querySelectorAll("[data-close-modal]");

    // Track popup appearances for each page
    const pageKey = `offerModalCount_${window.location.pathname}`;

    let showCount = Number(sessionStorage.getItem(pageKey)) || 0;
    let timer;

    function openModal() {
        // Maximum 2 appearances per page
        if (showCount >= 2) return;

        showCount++;
        sessionStorage.setItem(pageKey, showCount);

        modal.setAttribute("aria-hidden", "false");
        modal.classList.add("is-visible");

        // Prevent background scrolling
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.setAttribute("aria-hidden", "true");
        modal.classList.remove("is-visible");

        // Restore page scrolling
        document.body.style.overflow = "";

        // After closing the first popup,
        // wait 20 seconds before showing it again.
        if (showCount === 1) {
            timer = setTimeout(() => {
                openModal();
            }, 20000);
        }
    }

    // Close button, Maybe Later, and overlay
    closeButtons.forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    // Close with Escape key
    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            modal.classList.contains("is-visible")
        ) {
            closeModal();
        }
    });

    // First popup: 3 seconds after page loads
    timer = setTimeout(() => {
        openModal();
    }, 3000);
});