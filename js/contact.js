
document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById("bookingForm");

    const serviceInput = document.getElementById("service");
    const barberInput = document.getElementById("barber");
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");

    const customerNameInput =
        document.getElementById("customerName");

    const customerEmailInput =
        document.getElementById("customerEmail");

    const customerPhoneInput =
        document.getElementById("customerPhone");

    const notesInput =
        document.getElementById("notes");

    const termsInput =
        document.getElementById("terms");

    const phoneError =
        document.getElementById("phoneError");

    const dateError =
        document.getElementById("dateError");

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


    /* =========================
       FORMSPREE
    ========================== */

    const FORMSPREE_ENDPOINT =
        "https://formspree.io/f/xkjgzgvq";


    /* =========================
       SERVICES
    ========================== */

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


    /* =========================
       BUSINESS HOURS
    ========================== */

    const WEEKDAY_OPEN = 8 * 60;
    const WEEKDAY_CLOSE = 18 * 60;

    const SATURDAY_OPEN = 8 * 60;
    const SATURDAY_CLOSE = 16 * 60;

    const SLOT_INTERVAL = 30;

    const MINIMUM_DURATION = 60;


    /* =========================
       DATE HELPERS
    ========================== */

    function getTodayString() {
        const today = new Date();

        const year =
            today.getFullYear();

        const month =
            String(today.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(today.getDate())
                .padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function setMinimumBookingDate() {
        if (!dateInput) return;

        dateInput.min =
            getTodayString();
    }


    /* =========================
       DATE VALIDATION
    ========================== */

    function validateBookingDate(showMessage = true) {
        if (!dateInput || !dateInput.value) {
            return false;
        }

        const selectedDate =
            new Date(
                dateInput.value + "T00:00:00"
            );

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        /* Past date */

        if (selectedDate < today) {
            if (showMessage) {
                dateError.textContent =
                    "You cannot book a date in the past.";
            }

            return false;
        }


        /* Sunday */

        if (selectedDate.getDay() === 0) {
            if (showMessage) {
                dateError.textContent =
                    "Natal's Barber Shop is closed on Sundays.";
            }

            return false;
        }


        if (dateError) {
            dateError.textContent = "";
        }

        return true;
    }


    /* =========================
       PHONE VALIDATION
    ========================== */

    function validateSouthAfricanPhone(phone) {
        const phonePattern =
            /^\+27\s[0-9]{2}\s[0-9]{3}\s[0-9]{4}$/;

        return phonePattern.test(phone);
    }


    function validatePhone() {
        if (!customerPhoneInput) {
            return true;
        }

        const phone =
            customerPhoneInput.value.trim();


        if (!validateSouthAfricanPhone(phone)) {

            if (phoneError) {
                phoneError.textContent =
                    "Enter a valid South African number, e.g. +27 82 123 4567";
            }

            customerPhoneInput.setCustomValidity(
                "Please enter a valid South African phone number."
            );

            return false;
        }


        if (phoneError) {
            phoneError.textContent = "";
        }

        customerPhoneInput.setCustomValidity("");

        return true;
    }


    /* =========================
       AVAILABLE TIMES
    ========================== */

    function updateAvailableTimes() {

        if (!timeInput) return;

        timeInput.innerHTML = "";


        /* No date */

        if (!dateInput.value) {

            const option =
                document.createElement("option");

            option.value = "";

            option.textContent =
                "Select a date first";

            timeInput.appendChild(option);

            return;
        }


        /* Validate date */

        const selectedDate =
            new Date(
                dateInput.value + "T00:00:00"
            );

        const day =
            selectedDate.getDay();


        /* Sunday */

        if (day === 0) {

            const option =
                document.createElement("option");

            option.value = "";

            option.textContent =
                "Sunday — Closed";

            timeInput.appendChild(option);

            return;
        }


        /* Opening and closing times */

        let openingMinutes;
        let closingMinutes;


        if (day === 6) {

            openingMinutes =
                SATURDAY_OPEN;

            closingMinutes =
                SATURDAY_CLOSE;

        } else {

            openingMinutes =
                WEEKDAY_OPEN;

            closingMinutes =
                WEEKDAY_CLOSE;
        }


        /* Selected service */

        const selectedService =
            serviceInput.value;

        const service =
            serviceData[selectedService];


        /*
         * Minimum appointment is 60 minutes.
         * Longer services keep their actual duration.
         */

        const duration =
            Math.max(
                service?.duration || MINIMUM_DURATION,
                MINIMUM_DURATION
            );


        /* Default option */

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent =
            "Select a time";

        timeInput.appendChild(
            defaultOption
        );


        /* Generate available times */

        for (
            let startMinutes = openingMinutes;
            startMinutes < closingMinutes;
            startMinutes += SLOT_INTERVAL
        ) {

            const endMinutes =
                startMinutes + duration;


            /*
             * Do not show a time if the
             * appointment finishes after closing.
             */

            if (
                endMinutes >
                closingMinutes
            ) {
                continue;
            }


            const hour =
                Math.floor(
                    startMinutes / 60
                );

            const minutes =
                startMinutes % 60;


            const time =
                String(hour).padStart(2, "0") +
                ":" +
                String(minutes).padStart(2, "0");


            const option =
                document.createElement("option");

            option.value = time;

            option.textContent = time;

            timeInput.appendChild(
                option
            );
        }


        /* No available times */

        if (timeInput.options.length === 1) {

            const option =
                document.createElement("option");

            option.value = "";

            option.textContent =
                "No available times";

            timeInput.appendChild(
                option
            );
        }
    }


    /* =========================
       DATE DISPLAY
    ========================== */

    function formatDate(dateString) {

        if (!dateString) {
            return "";
        }

        const date =
            new Date(
                dateString + "T00:00:00"
            );

        return date.toLocaleDateString(
            "en-ZA",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
    }


    /* =========================
       APPOINTMENT DATE
    ========================== */

    function createAppointmentDate(
        date,
        time
    ) {
        return new Date(
            `${date}T${time}:00`
        );
    }


    /* =========================
       ADD MINUTES
    ========================== */

    function addMinutes(
        date,
        minutes
    ) {
        return new Date(
            date.getTime() +
            minutes * 60000
        );
    }


    /* =========================
       CALENDAR DATE FORMAT
    ========================== */

    function formatCalendarDate(date) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        const hours =
            String(
                date.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                date.getMinutes()
            ).padStart(2, "0");

        const seconds =
            String(
                date.getSeconds()
            ).padStart(2, "0");

        return (
            `${year}${month}${day}` +
            `T${hours}${minutes}${seconds}`
        );
    }


    /* =========================
       GOOGLE CALENDAR
    ========================== */

    function createGoogleCalendarLink(
        service,
        barber,
        date,
        time,
        duration
    ) {

        const start =
            createAppointmentDate(
                date,
                time
            );

        const end =
            addMinutes(
                start,
                duration
            );


        const title =
            encodeURIComponent(
                `Natal's Barber Shop - ${service}`
            );


        const dates =
            `${formatCalendarDate(start)}` +
            `/` +
            `${formatCalendarDate(end)}`;


        const details =
            encodeURIComponent(
                `Appointment at Natal's Barber Shop.\n` +
                `Service: ${service}\n` +
                `Barber: ${barber}\n` +
                `Duration: ${duration} minutes`
            );


        const location =
            encodeURIComponent(
                "24 Rivonia Road, Sandton, Johannesburg"
            );


        return (
            "https://calendar.google.com/calendar/render" +
            "?action=TEMPLATE" +
            `&text=${title}` +
            `&dates=${dates}` +
            `&details=${details}` +
            `&location=${location}`
        );
    }


    /* =========================
       DEVICE CALENDAR / ICS
    ========================== */

    function createDeviceCalendarFile(
        service,
        barber,
        date,
        time,
        duration
    ) {

        const start =
            createAppointmentDate(
                date,
                time
            );

        const end =
            addMinutes(
                start,
                duration
            );


        const startDate =
            formatCalendarDate(start);

        const endDate =
            formatCalendarDate(end);


        const uid =
            `${Date.now()}@natalsbarbershop.co.za`;


        /*
         * VALARM creates a reminder.
         * The customer will be reminded
         * 1 hour before the appointment.
         */

        const icsContent =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Natal's Barber Shop//Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatCalendarDate(new Date())}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Natal's Barber Shop - ${service}
DESCRIPTION:Appointment at Natal's Barber Shop. Service: ${service}. Barber: ${barber}.
LOCATION:24 Rivonia Road, Sandton, Johannesburg
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Natal's Barber Shop appointment in 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`;


        const blob =
            new Blob(
                [icsContent],
                {
                    type:
                        "text/calendar;charset=utf-8"
                }
            );


        return URL.createObjectURL(blob);
    }


    /* =========================
       EVENTS
    ========================== */

    setMinimumBookingDate();


    if (dateInput) {

        dateInput.addEventListener(
            "change",
            () => {

                validateBookingDate(
                    true
                );

                updateAvailableTimes();
            }
        );
    }


    if (serviceInput) {

        serviceInput.addEventListener(
            "change",
            updateAvailableTimes
        );
    }


    if (customerPhoneInput) {

        customerPhoneInput.addEventListener(
            "input",
            validatePhone
        );

        customerPhoneInput.addEventListener(
            "blur",
            validatePhone
        );
    }


    /* Initial time setup */

    updateAvailableTimes();


    /* =========================
       FORM SUBMISSION
    ========================== */

    if (bookingForm) {

        bookingForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                /* Validate date */

                if (
                    !validateBookingDate(
                        true
                    )
                ) {

                    dateInput.focus();

                    return;
                }


                /* Validate phone */

                if (!validatePhone()) {

                    customerPhoneInput.focus();

                    return;
                }


                /* Basic fields */

                const service =
                    serviceInput.value.trim();

                const barber =
                    barberInput.value.trim();

                const date =
                    dateInput.value;

                const time =
                    timeInput.value;

                const customerName =
                    customerNameInput.value.trim();

                const customerEmail =
                    customerEmailInput.value.trim();

                const customerPhone =
                    customerPhoneInput.value.trim();

                const notes =
                    notesInput.value.trim();


                /* Required fields */

                if (
                    !service ||
                    !barber ||
                    !date ||
                    !time ||
                    !customerName ||
                    !customerEmail ||
                    !customerPhone ||
                    !termsInput.checked
                ) {

                    alert(
                        "Please complete all required fields."
                    );

                    return;
                }


                /* Validate email */

                if (
                    !customerEmailInput.checkValidity()
                ) {

                    alert(
                        "Please enter a valid email address."
                    );

                    customerEmailInput.focus();

                    return;
                }


                /* Service */

                const selectedService =
                    serviceData[service];


                if (!selectedService) {

                    alert(
                        "Please select a valid service."
                    );

                    return;
                }


                /*
                 * Minimum appointment duration:
                 * 60 minutes.
                 */

                const duration =
                    Math.max(
                        selectedService.duration,
                        MINIMUM_DURATION
                    );


                /* Appointment start/end */

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


                /* Check Sunday */

                const day =
                    appointmentStart.getDay();


                if (day === 0) {

                    alert(
                        "Natal's Barber Shop is closed on Sundays."
                    );

                    return;
                }


                /* Business hours */

                const closingMinutes =
                    day === 6
                        ? SATURDAY_CLOSE
                        : WEEKDAY_CLOSE;


                const startMinutes =
                    appointmentStart.getHours() * 60 +
                    appointmentStart.getMinutes();


                /*
                 * Make absolutely sure
                 * appointment finishes before closing.
                 */

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


                /* Submit button */

                const submitButton =
                    bookingForm.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Sending...";
                }


                /* Formspree */

                const formData =
                    new FormData(
                        bookingForm
                    );


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


                    /* =========================
                       CONFIRMATION
                    ========================== */

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


                    /* =========================
                       GOOGLE CALENDAR
                    ========================== */

                    if (googleCalendarLink) {

                        googleCalendarLink.href =
                            createGoogleCalendarLink(
                                service,
                                barber,
                                date,
                                time,
                                duration
                            );
                    }


                    /* =========================
                       DEVICE CALENDAR
                    ========================== */

                    if (appleCalendarLink) {

                        const calendarURL =
                            createDeviceCalendarFile(
                                service,
                                barber,
                                date,
                                time,
                                duration
                            );


                        appleCalendarLink.href =
                            calendarURL;
                    }


                    /* =========================
                       SAVE BOOKING
                    ========================== */

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

                        price:
                            selectedService.price
                    };


                    localStorage.setItem(
                        "latestBooking",
                        JSON.stringify(
                            booking
                        )
                    );


                    /* =========================
                       SHOW CONFIRMATION
                    ========================== */

                    bookingForm.style.display =
                        "none";


                    if (bookingConfirmation) {

                        bookingConfirmation.hidden =
                            false;


                        bookingConfirmation.scrollIntoView(
                            {
                                behavior: "smooth",
                                block: "start"
                            }
                        );
                    }

                } catch (error) {

                    console.error(
                        "Booking error:",
                        error
                    );


                    alert(
                        "Something went wrong while sending your booking. Please try again."
                    );


                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            "Confirm Booking";
                    }
                }
            }
        );
    }
});