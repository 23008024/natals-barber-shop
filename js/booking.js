
document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById("bookingForm");
    const serviceInput = document.getElementById("service");
    const barberInput = document.getElementById("barber");
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");

    const bookingConfirmation =
        document.getElementById("bookingConfirmation");

    const summaryService =
        document.getElementById("summaryService");
    const summaryBarber =
        document.getElementById("summaryBarber");
    const summaryDate =
        document.getElementById("summaryDate");
    const summaryTime =
        document.getElementById("summaryTime");
    const summaryCustomer =
        document.getElementById("summaryCustomer");
    const summaryPrice =
        document.getElementById("summaryPrice");

    const googleCalendarLink =
        document.getElementById("googleCalendarLink");
    const appleCalendarLink =
        document.getElementById("appleCalendarLink");

    const FORMSPREE_ENDPOINT =
        "https://formspree.io/f/xkjgzgvq";

    /*
     * Service durations are the actual appointment durations.
     * The booking system will enforce a minimum of 60 minutes.
     */
    const serviceData = {
        "Classic Cut": {
            price: 220,
            duration: 45
        },
        "Skin Fade": {
            price: 260,
            duration: 60
        },
        "Textured Cut": {
            price: 240,
            duration: 45
        },
        "Kids Cut": {
            price: 170,
            duration: 30
        },
        "Beard Trim": {
            price: 150,
            duration: 30
        },
        "Hot Towel Shave": {
            price: 190,
            duration: 45
        },
        "Beard Shape & Line-Up": {
            price: 130,
            duration: 30
        },
        "Cut & Beard": {
            price: 330,
            duration: 75
        },
        "Natal's Signature": {
            price: 390,
            duration: 90
        },
        "Father & Son": {
            price: 360,
            duration: 90
        }
    };

// Get today's date automatically from the user's device
function getTodayString() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Prevent users from selecting a date in the past
if (dateInput) {
    dateInput.min = getTodayString();
}

    /*
     * Business hours:
     *
     * Monday-Friday: 08:00-18:00
     * Saturday:      08:00-16:00
     * Sunday:        Closed
     *
     * Booking times are offered every 30 minutes.
     */
    function updateAvailableTimes() {
        timeInput.innerHTML = "";

        if (!dateInput.value) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Select a date first";
            timeInput.appendChild(option);
            return;
        }

        const selectedDate =
            new Date(dateInput.value + "T00:00:00");

        const day = selectedDate.getDay();

        // Sunday
        if (day === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Sunday — Closed";
            timeInput.appendChild(option);
            return;
        }

        // Saturday closes at 16:00.
        // Monday-Friday closes at 18:00.
        const closingMinutes =
            day === 6 ? 16 * 60 : 18 * 60;

        const selectedService = serviceInput.value;

        /*
         * Enforce a minimum appointment duration of 60 minutes.
         * Longer services keep their actual duration.
         */
        const duration = Math.max(
            serviceData[selectedService]?.duration || 60,
            60
        );

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select a time";
        timeInput.appendChild(defaultOption);

        /*
         * Generate times every 30 minutes.
         *
         * A time is only shown if the complete service
         * can finish before or exactly at closing time.
         */
        for (let hour = 8; hour <= 17; hour++) {
            for (const minutes of [0, 30]) {
                const startMinutes =
                    hour * 60 + minutes;

                const endMinutes =
                    startMinutes + duration;

                // Don't allow appointments to run past closing.
                if (endMinutes > closingMinutes) {
                    continue;
                }

                const time =
                    String(hour).padStart(2, "0") +
                    ":" +
                    String(minutes).padStart(2, "0");

                const option =
                    document.createElement("option");

                option.value = time;
                option.textContent = time;

                timeInput.appendChild(option);
            }
        }

        // If no times are available.
        if (timeInput.options.length === 1) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No available times";
            timeInput.appendChild(option);
        }
    }

    /*
     * Update available times whenever the
     * selected date or service changes.
     */
    if (dateInput) {
        dateInput.addEventListener(
            "change",
            updateAvailableTimes
        );
    }

    if (serviceInput) {
        serviceInput.addEventListener(
            "change",
            updateAvailableTimes
        );
    }

    // Initial setup
    updateAvailableTimes();

    /*
     * Format date for the confirmation message.
     */
    function formatDate(dateString) {
        if (!dateString) return "";

        const date =
            new Date(dateString + "T00:00:00");

        return date.toLocaleDateString("en-ZA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    /*
     * Convert YYYY-MM-DD + HH:MM
     * into a JavaScript Date object.
     */
    function createAppointmentDate(date, time) {
        return new Date(`${date}T${time}:00`);
    }

    /*
     * Add minutes to a date.
     */
    function addMinutes(date, minutes) {
        return new Date(
            date.getTime() + minutes * 60000
        );
    }

    /*
     * Format a date for Google Calendar.
     */
    function formatGoogleDate(date) {
        return date
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}/, "");
    }

    /*
     * Create Google Calendar link.
     */
    function createGoogleCalendarLink(
        service,
        date,
        time,
        duration
    ) {
        const start =
            createAppointmentDate(date, time);

        const end =
            addMinutes(start, duration);

        const title =
            encodeURIComponent(
                `Natal's Barber Shop - ${service}`
            );

        const dates =
            `${formatGoogleDate(start)}/${formatGoogleDate(end)}`;

        const details =
            encodeURIComponent(
                `Appointment at Natal's Barber Shop for ${service}.`
            );

        const location =
            encodeURIComponent("Natal's Barber Shop");

        return (
            "https://calendar.google.com/calendar/render" +
            "?action=TEMPLATE" +
            `&text=${title}` +
            `&dates=${dates}` +
            `&details=${details}` +
            `&location=${location}`
        );
    }

    /*
     * Create Apple Calendar (.ics) download.
     */
    function createAppleCalendarFile(
        service,
        date,
        time,
        duration
    ) {
        const start =
            createAppointmentDate(date, time);

        const end =
            addMinutes(start, duration);

        const startUTC =
            formatGoogleDate(start);

        const endUTC =
            formatGoogleDate(end);

        const icsContent =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Natal's Barber Shop//Booking//EN
BEGIN:VEVENT
DTSTART:${startUTC}
DTEND:${endUTC}
SUMMARY:Natal's Barber Shop - ${service}
DESCRIPTION:Appointment at Natal's Barber Shop for ${service}.
LOCATION:Natal's Barber Shop
END:VEVENT
END:VCALENDAR`;

        const blob =
            new Blob(
                [icsContent],
                { type: "text/calendar;charset=utf-8" }
            );

        return URL.createObjectURL(blob);
    }

    /*
     * Form submission.
     */
    if (bookingForm) {
        bookingForm.addEventListener(
            "submit",
            async (event) => {
                event.preventDefault();

                const service =
                    serviceInput.value;

                const barber =
                    barberInput.value;

                const date =
                    dateInput.value;

                const time =
                    timeInput.value;

                const customerName =
                    document.getElementById(
                        "customerName"
                    ).value;

                const customerEmail =
                    document.getElementById(
                        "customerEmail"
                    ).value;

                const customerPhone =
                    document.getElementById(
                        "customerPhone"
                    ).value;

                const notes =
                    document.getElementById(
                        "notes"
                    ).value;

                const terms =
                    document.getElementById(
                        "terms"
                    );

                // Basic validation
                if (
                    !service ||
                    !barber ||
                    !date ||
                    !time ||
                    !customerName ||
                    !customerEmail ||
                    !customerPhone ||
                    !terms.checked
                ) {
                    alert(
                        "Please complete all required fields."
                    );
                    return;
                }

                const selectedService =
                    serviceData[service];

                if (!selectedService) {
                    alert(
                        "Please select a valid service."
                    );
                    return;
                }

                /*
                 * Enforce the minimum 60-minute duration
                 * when creating the appointment.
                 */
                const duration = Math.max(
                    selectedService.duration,
                    60
                );

                const appointmentStart =
                    createAppointmentDate(
                        date,
                        time
                    );

                const appointmentEnd =
                    addMinutes(
                        appointmentStart,
                        duration
                    );

                /*
                 * Double-check business hours before submitting.
                 */
                const day =
                    appointmentStart.getDay();

                if (day === 0) {
                    alert(
                        "Natal's Barber Shop is closed on Sundays."
                    );
                    return;
                }

                const closingMinutes =
                    day === 6
                        ? 16 * 60
                        : 18 * 60;

                const startMinutes =
                    appointmentStart.getHours() * 60 +
                    appointmentStart.getMinutes();

                if (
                    startMinutes + duration >
                    closingMinutes
                ) {
                    alert(
                        "This appointment would run past closing time. Please select an earlier time."
                    );
                    updateAvailableTimes();
                    return;
                }

                const submitButton =
                    bookingForm.querySelector(
                        'button[type="submit"]'
                    );

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent =
                        "Sending...";
                }

                /*
                 * Send booking to Formspree.
                 */
                const formData =
                    new FormData(bookingForm);

                formData.append(
                    "_subject",
                    `New Booking - ${service}`
                );

                formData.append(
                    "serviceDuration",
                    `${duration} minutes`
                );

                try {
                    const response =
                        await fetch(
                            FORMSPREE_ENDPOINT,
                            {
                                method: "POST",
                                body: formData,
                                headers: {
                                    Accept:
                                        "application/json"
                                }
                            }
                        );

                    if (!response.ok) {
                        throw new Error(
                            "Booking submission failed."
                        );
                    }

                    /*
                     * Fill confirmation details.
                     */
                    summaryService.textContent =
                        service;

                    summaryBarber.textContent =
                        barber;

                    summaryDate.textContent =
                        formatDate(date);

                    summaryTime.textContent =
                        `${time} (${duration} min)`;

                    summaryCustomer.textContent =
                        customerName;

                    summaryPrice.textContent =
                        `R${selectedService.price}`;

                    /*
                     * Google Calendar
                     */
                    if (googleCalendarLink) {
                        googleCalendarLink.href =
                            createGoogleCalendarLink(
                                service,
                                date,
                                time,
                                duration
                            );
                    }

                    /*
                     * Apple Calendar
                     */
                    if (appleCalendarLink) {
                        const calendarURL =
                            createAppleCalendarFile(
                                service,
                                date,
                                time,
                                duration
                            );

                        appleCalendarLink.href =
                            calendarURL;
                    }

                    /*
                     * Save booking locally.
                     */
                    const booking = {
                        service,
                        barber,
                        date,
                        time,
                        duration,
                        customerName,
                        customerEmail,
                        customerPhone,
                        notes,
                        price: selectedService.price
                    };

                    localStorage.setItem(
                        "latestBooking",
                        JSON.stringify(booking)
                    );

                    /*
                     * Hide form and show confirmation.
                     */
                    bookingForm.style.display =
                        "none";

                    if (bookingConfirmation) {
                        bookingConfirmation.hidden =
                            false;

                        bookingConfirmation.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                } catch (error) {
                    console.error(error);

                    alert(
                        "Something went wrong while sending your booking. Please try again."
                    );

                    if (submitButton) {
                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Book Appointment";
                    }
                }
            }
        );
    }
});