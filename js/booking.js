
document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById("bookingForm");
    const bookingConfirmation = document.getElementById("bookingConfirmation");

    if (!bookingForm || !bookingConfirmation) {
        console.error("Booking form or confirmation section not found.");
        return;
    }

    const serviceInput = document.getElementById("service");
    const barberInput = document.getElementById("barber");
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");

    const nameInput = document.getElementById("customerName");
    const emailInput = document.getElementById("customerEmail");
    const phoneInput = document.getElementById("customerPhone");
    const notesInput = document.getElementById("notes");
    const termsInput = document.getElementById("terms");

    const summaryService = document.getElementById("summaryService");
    const summaryBarber = document.getElementById("summaryBarber");
    const summaryDate = document.getElementById("summaryDate");
    const summaryTime = document.getElementById("summaryTime");
    const summaryCustomer = document.getElementById("summaryCustomer");
    const summaryPrice = document.getElementById("summaryPrice");

    const googleCalendarLink = document.getElementById("googleCalendarLink");
    const appleCalendarLink = document.getElementById("appleCalendarLink");

    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xkjgzgvq";

    const shop = {
        name: "Natal's Barber Shop",
        address: "24 Rivonia Road, Sandton, Johannesburg, Gauteng, South Africa"
    };

    const serviceData = {
        "Classic Cut": { price: 220, duration: 45 },
        "Skin Fade": { price: 260, duration: 60 },
        "Textured Cut": { price: 240, duration: 45 },
        "Kids Cut": { price: 170, duration: 30 },
        "Beard Trim": { price: 150, duration: 30 },
        "Hot Towel Shave": { price: 190, duration: 45 },
        "Beard Shape & Line-Up": { price: 130, duration: 30 },
        "Cut & Beard": { price: 330, duration: 75 },
        "Natal's Signature": { price: 390, duration: 90 },
        "Father & Son": { price: 360, duration: 90 }
    };

    const serviceMap = {
        "classic-cut": "Classic Cut",
        "skin-fade": "Skin Fade",
        "textured-cut": "Textured Cut",
        "kids-cut": "Kids Cut",
        "beard-trim": "Beard Trim",
        "hot-towel-shave": "Hot Towel Shave",
        "beard-shape": "Beard Shape & Line-Up",
        "cut-and-beard": "Cut & Beard",
        "natals-signature": "Natal's Signature",
        "father-and-son": "Father & Son"
    };

    /* ------------------------------
       MINIMUM DATE
    ------------------------------ */

    const today = new Date();

    const todayString =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

    dateInput.min = todayString;

    /* ------------------------------
       SERVICE FROM URL
    ------------------------------ */

    const params = new URLSearchParams(window.location.search);
    const requestedService = params.get("service");

    if (requestedService && serviceMap[requestedService]) {
        serviceInput.value = serviceMap[requestedService];
    }

    /* ------------------------------
       DATE CHANGE
    ------------------------------ */

    dateInput.addEventListener("change", () => {
        if (!dateInput.value) return;

        const selectedDate = new Date(dateInput.value + "T00:00:00");

        if (selectedDate.getDay() === 0) {
            alert("We are closed on Sundays. Please choose another date.");
            dateInput.value = "";
            return;
        }

        updateAvailableTimes();
    });

    serviceInput.addEventListener("change", updateAvailableTimes);

    /* ------------------------------
       FILTER AVAILABLE TIMES
    ------------------------------ */

    function updateAvailableTimes() {
        if (!dateInput.value) return;

        const selectedDate = new Date(dateInput.value + "T00:00:00");
        const day = selectedDate.getDay();

        const service = serviceInput.value;
        const duration = serviceData[service]?.duration || 30;

        // Monday-Friday = 18:00 closing
        // Saturday = 16:00 closing
        const closingMinutes = day === 6 ? 16 * 60 : 18 * 60;

        Array.from(timeInput.options).forEach(option => {
            if (!option.value) return;

            const [hours, minutes] = option.value.split(":").map(Number);

            const startMinutes = hours * 60 + minutes;
            const endMinutes = startMinutes + duration;

            option.disabled = endMinutes > closingMinutes;
        });

        if (
            timeInput.value &&
            timeInput.selectedOptions[0]?.disabled
        ) {
            timeInput.value = "";
        }
    }

    updateAvailableTimes();

    /* ------------------------------
       FORM SUBMISSION
    ------------------------------ */

    bookingForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!bookingForm.checkValidity()) {
            bookingForm.reportValidity();
            return;
        }

        if (!termsInput.checked) {
            alert("Please accept the Terms & Conditions before confirming your booking.");
            return;
        }

        const service = serviceInput.value;
        const barber = barberInput.value;
        const date = dateInput.value;
        const time = timeInput.value;
        const customerName = nameInput.value.trim();
        const customerEmail = emailInput.value.trim();
        const customerPhone = phoneInput.value.trim();
        const notes = notesInput ? notesInput.value.trim() : "";

        const serviceInfo = serviceData[service];

        if (!serviceInfo) {
            alert("Please select a valid service.");
            return;
        }

        const startDate = new Date(`${date}T${time}:00`);

        if (isNaN(startDate.getTime())) {
            alert("There was a problem with the selected date or time.");
            return;
        }

        const endDate = new Date(
            startDate.getTime() + serviceInfo.duration * 60000
        );

        /* ------------------------------
           PREVENT DOUBLE SUBMISSION
        ------------------------------ */

        const submitButton = bookingForm.querySelector(
            'button[type="submit"]'
        );

        const originalButtonText = submitButton
            ? submitButton.textContent
            : "Confirm Booking";

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Confirming Booking...";
        }

        /* ------------------------------
           DATA SENT TO FORMSPREE
        ------------------------------ */

        const formData = new FormData();

        formData.append("_subject", `New Booking - ${service} - ${customerName}`);

        formData.append("Customer Name", customerName);
        formData.append("Customer Email", customerEmail);
        formData.append("Customer Phone", customerPhone);

        formData.append("Service", service);
        formData.append("Barber", barber);

        formData.append("Appointment Date", formatDate(startDate));
        formData.append(
            "Appointment Time",
            `${formatTime(startDate)} - ${formatTime(endDate)}`
        );

        formData.append("Duration", `${serviceInfo.duration} minutes`);
        formData.append("Price", `R${serviceInfo.price}`);

        formData.append("Shop", shop.name);
        formData.append("Location", shop.address);

        formData.append(
            "Customer Notes",
            notes || "No additional notes."
        );

        formData.append("Booking Status", "Confirmed");

        try {
            /* ------------------------------
               SEND TO FORMSPREE
            ------------------------------ */

            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json"
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.errors?.map(error => error.message).join(", ") ||
                    "Form submission failed."
                );
            }

            /* ------------------------------
               UPDATE CONFIRMATION
            ------------------------------ */

            summaryService.textContent = service;
            summaryBarber.textContent = barber;
            summaryDate.textContent = formatDate(startDate);
            summaryTime.textContent =
                `${formatTime(startDate)} – ${formatTime(endDate)}`;
            summaryCustomer.textContent = customerName;
            summaryPrice.textContent = `R${serviceInfo.price}`;

            /* ------------------------------
               GOOGLE CALENDAR
            ------------------------------ */

            if (googleCalendarLink) {
                googleCalendarLink.href = createGoogleCalendarUrl({
                    service,
                    barber,
                    startDate,
                    endDate,
                    customerName,
                    customerPhone,
                    notes
                });
            }

            /* ------------------------------
               APPLE CALENDAR
            ------------------------------ */

            if (appleCalendarLink) {
                const icsContent = createICS({
                    service,
                    barber,
                    startDate,
                    endDate,
                    customerName,
                    customerEmail,
                    customerPhone,
                    notes
                });

                const blob = new Blob([icsContent], {
                    type: "text/calendar;charset=utf-8"
                });

                const calendarUrl = URL.createObjectURL(blob);

                appleCalendarLink.href = calendarUrl;
                appleCalendarLink.download =
                    "natals-barber-shop-appointment.ics";
            }

            /* ------------------------------
               SAVE BOOKING LOCALLY
            ------------------------------ */

            localStorage.setItem(
                "natalsLastBooking",
                JSON.stringify({
                    shop: shop.name,
                    service,
                    barber,
                    date,
                    time,
                    customerName,
                    customerEmail,
                    customerPhone,
                    notes,
                    price: serviceInfo.price,
                    duration: serviceInfo.duration
                })
            );

            /* ------------------------------
               SHOW SUCCESS MESSAGE
            ------------------------------ */

            bookingForm.style.display = "none";

            bookingConfirmation.hidden = false;
            bookingConfirmation.style.display = "block";
            bookingConfirmation.classList.add("show");

            setTimeout(() => {
                bookingConfirmation.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);

        } catch (error) {
            console.error("Booking submission error:", error);

            alert(
                "We could not confirm your booking right now. " +
                "Please check your internet connection and try again."
            );

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });

    /* ------------------------------
       FORMAT DATE
    ------------------------------ */

    function formatDate(date) {
        return date.toLocaleDateString("en-ZA", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    /* ------------------------------
       FORMAT TIME
    ------------------------------ */

    function formatTime(date) {
        return date.toLocaleTimeString("en-ZA", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    }

    /* ------------------------------
       GOOGLE CALENDAR
    ------------------------------ */

    function createGoogleCalendarUrl({
        service,
        barber,
        startDate,
        endDate,
        customerName,
        customerPhone,
        notes
    }) {
        const start = formatCalendarDate(startDate);
        const end = formatCalendarDate(endDate);

        const details =
            `Booking at ${shop.name}\n` +
            `Service: ${service}\n` +
            `Barber: ${barber}\n` +
            `Customer: ${customerName}\n` +
            `Phone: ${customerPhone}` +
            (notes ? `\nNotes: ${notes}` : "");

        return (
            "https://calendar.google.com/calendar/render" +
            "?action=TEMPLATE" +
            "&text=" +
            encodeURIComponent(`${shop.name} - ${service}`) +
            "&dates=" +
            encodeURIComponent(`${start}/${end}`) +
            "&details=" +
            encodeURIComponent(details) +
            "&location=" +
            encodeURIComponent(shop.address)
        );
    }

    /* ------------------------------
       APPLE CALENDAR ICS
    ------------------------------ */

    function createICS({
        service,
        barber,
        startDate,
        endDate,
        customerName,
        customerEmail,
        customerPhone,
        notes
    }) {
        const uid =
            Date.now() +
            "-" +
            Math.random().toString(36).substring(2) +
            "@natalsbarbershop";

        const description =
            `Booking at ${shop.name}\n` +
            `Service: ${service}\n` +
            `Barber: ${barber}\n` +
            `Customer: ${customerName}\n` +
            `Email: ${customerEmail}\n` +
            `Phone: ${customerPhone}` +
            (notes ? `\nNotes: ${notes}` : "");

        return [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Natal's Barber Shop//Booking//EN",
            "CALSCALE:GREGORIAN",
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${formatICSDate(new Date())}`,
            `DTSTART:${formatICSDate(startDate)}`,
            `DTEND:${formatICSDate(endDate)}`,
            `SUMMARY:${escapeICS(`${shop.name} - ${service}`)}`,
            `DESCRIPTION:${escapeICS(description)}`,
            `LOCATION:${escapeICS(shop.address)}`,
            "STATUS:CONFIRMED",
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");
    }

    function formatCalendarDate(date) {
        return (
            date.getFullYear() +
            String(date.getMonth() + 1).padStart(2, "0") +
            String(date.getDate()).padStart(2, "0") +
            "T" +
            String(date.getHours()).padStart(2, "0") +
            String(date.getMinutes()).padStart(2, "0") +
            "00"
        );
    }

    function formatICSDate(date) {
        return (
            date.getUTCFullYear() +
            String(date.getUTCMonth() + 1).padStart(2, "0") +
            String(date.getUTCDate()).padStart(2, "0") +
            "T" +
            String(date.getUTCHours()).padStart(2, "0") +
            String(date.getUTCMinutes()).padStart(2, "0") +
            String(date.getUTCSeconds()).padStart(2, "0") +
            "Z"
        );
    }

    function escapeICS(value) {
        return String(value)
            .replace(/\\/g, "\\\\")
            .replace(/;/g, "\\;")
            .replace(/,/g, "\\,")
            .replace(/\r?\n/g, "\\n");
    }
});