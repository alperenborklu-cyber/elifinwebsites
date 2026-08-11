document.addEventListener('DOMContentLoaded', () => {
    
    // --- Scroll Reveal Animations ---
    const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100; // when to reveal
        
        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                // Check if delay is set via custom property
                const delay = reveal.style.getPropertyValue('--delay');
                if (delay) {
                    reveal.style.transitionDelay = delay;
                }
                reveal.classList.add('active');
            }
        });
    };

    // Initial check
    revealOnScroll();
    
    // Listen for scroll
    window.addEventListener('scroll', revealOnScroll);

    // --- Navbar Scroll & Sticky CTA Bar Effect ---
    const navbar = document.querySelector('.navbar');
    const stickyCtaBar = document.getElementById('stickyCtaBar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Show sticky bottom bar on mobile after scrolling past 300px
        if (stickyCtaBar) {
            if (window.scrollY > 300) {
                stickyCtaBar.classList.add('active-bar');
            } else {
                stickyCtaBar.classList.remove('active-bar');
            }
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
            mobileMenuBtn.classList.toggle('active');
        });

        // Close mobile menu on clicking any link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-open');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    // --- Language Switcher Logic ---
    const langToggle = document.getElementById('langToggle');
    const body = document.body;

    const setLanguage = (lang) => {
        if (lang === 'en') {
            body.classList.remove('lang-tr');
            body.classList.add('lang-en');
            langToggle.innerHTML = '<span class="flag-icon">🇹🇷</span> <span class="lang-name">Türkçe</span>';
            document.documentElement.setAttribute('lang', 'en');
        } else {
            body.classList.remove('lang-en');
            body.classList.add('lang-tr');
            langToggle.innerHTML = '<span class="flag-icon">🇬🇧</span> <span class="lang-name">English</span>';
            document.documentElement.setAttribute('lang', 'tr');
        }
        localStorage.setItem('poppyLang', lang);
    };

    // Initialize from localStorage or default to 'tr'
    const savedLang = localStorage.getItem('poppyLang') || 'tr';
    setLanguage(savedLang);

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            if (body.classList.contains('lang-tr')) {
                setLanguage('en');
            } else {
                setLanguage('tr');
            }
        });
    }

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- FAQ Accordion Logic ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active-faq');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active-faq');
            });
            
            // Toggle active if not previously active
            if (!isActive) {
                item.classList.add('active-faq');
            }
        });
    });

    // --- Interactive Animal Flashcards Logic ---
    const flashcards = document.querySelectorAll('.flashcard');
    
    flashcards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // --- Participation Type Selection ---
    const typeCards = document.querySelectorAll('.type-card');
    const selectedTypeInput = document.getElementById('selectedLessonType');

    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            typeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedTypeInput.value = card.getAttribute('data-type');
        });
    });

    // --- Interactive Calendar & Booking Logic ---
    const calendarMonthYear = document.getElementById('calendarMonthYear');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    
    const timeSlotsWrapper = document.getElementById('timeSlotsWrapper');
    const timeSlotsGrid = document.getElementById('timeSlotsGrid');
    const selectedDateTimeDisplay = document.getElementById('selectedDateTimeDisplay');
    const selectedDateTimeText = document.getElementById('selectedDateTimeText');
    
    const selectedDateInput = document.getElementById('selectedDate');
    const selectedTimeInput = document.getElementById('selectedTime');

    let currentDate = new Date();
    // Default to August 2026 as per user metadata, but use system clock dynamically
    let viewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const monthsTR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const monthsEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const weekdaysTR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const weekdaysEN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const availableHours = ['10:00', '11:30', '14:00', '15:30', '17:00'];

    const renderCalendar = () => {
        const isEnglish = body.classList.contains('lang-en');
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        // Month Title
        calendarMonthYear.textContent = isEnglish ? `${monthsEN[month]} ${year}` : `${monthsTR[month]} ${year}`;

        // Clear previous grid
        calendarGrid.innerHTML = '';

        // First day of month (1st day)
        const firstDay = new Date(year, month, 1);
        // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        let firstDayIndex = firstDay.getDay();
        // Convert to 0 = Monday, ..., 6 = Sunday style
        firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

        // Total days in month
        const totalDays = new Date(year, month + 1, 0).getDate();

        // Previous month days to pad
        for (let i = 0; i < firstDayIndex; i++) {
            const pad = document.createElement('div');
            pad.classList.add('day-cell', 'disabled');
            pad.textContent = '';
            calendarGrid.appendChild(pad);
        }

        // Current month days
        const today = new Date();
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.classList.add('day-cell');
            cell.textContent = day;

            const thisDate = new Date(year, month, day);
            
            // Normalize dates to midnight for easy comparison
            const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const compareThis = new Date(year, month, day);

            // Disable past dates
            if (compareThis < compareToday) {
                cell.classList.add('disabled');
                cell.disabled = true;
            }

            // Highlight today
            if (compareThis.getTime() === compareToday.getTime()) {
                cell.classList.add('today');
            }

            // Check if selected
            const formattedDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (selectedDateInput.value === formattedDateString) {
                cell.classList.add('active');
            }

            cell.addEventListener('click', () => {
                // Clear active
                document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('active'));
                cell.classList.add('active');
                
                selectedDateInput.value = formattedDateString;
                selectedTimeInput.value = ''; // Reset selected time
                renderTimeSlots(thisDate);
            });

            calendarGrid.appendChild(cell);
        }

        // Disable previous month button if we are looking at current month or past
        const currentMonthFirst = new Date(today.getFullYear(), today.getMonth(), 1);
        if (viewDate <= currentMonthFirst) {
            prevMonthBtn.disabled = true;
        } else {
            prevMonthBtn.disabled = false;
        }
    };

    const renderTimeSlots = (date) => {
        timeSlotsGrid.innerHTML = '';
        timeSlotsWrapper.style.display = 'block';
        selectedDateTimeDisplay.style.display = 'none';

        availableHours.forEach(hour => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.classList.add('time-slot-btn');
            btn.textContent = hour;

            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                selectedTimeInput.value = hour;
                updateDateTimeDisplay(date, hour);
            });

            timeSlotsGrid.appendChild(btn);
        });
    };

    const updateDateTimeDisplay = (date, hour) => {
        const isEnglish = body.classList.contains('lang-en');
        const dayName = isEnglish ? weekdaysEN[date.getDay() === 0 ? 6 : date.getDay() - 1] : weekdaysTR[date.getDay() === 0 ? 6 : date.getDay() - 1];
        const monthName = isEnglish ? monthsEN[date.getMonth()] : monthsTR[date.getMonth()];
        
        selectedDateTimeDisplay.style.display = 'block';
        
        if (isEnglish) {
            selectedDateTimeText.textContent = `${dayName}, ${monthName} ${date.getDate()} at ${hour}`;
        } else {
            selectedDateTimeText.textContent = `${date.getDate()} ${monthName} ${dayName}, Saat: ${hour}`;
        }
    };

    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            viewDate.setMonth(viewDate.getMonth() - 1);
            renderCalendar();
        });
        nextMonthBtn.addEventListener('click', () => {
            viewDate.setMonth(viewDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Handle language change updates on calendar text dynamically
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            renderCalendar();
            if (selectedDateInput.value && selectedTimeInput.value) {
                const dateParts = selectedDateInput.value.split('-');
                const d = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                updateDateTimeDisplay(d, selectedTimeInput.value);
            }
        });
    }

    // Initial Calendar render
    if (calendarGrid) {
        renderCalendar();
    }

    // --- Contact Form Submission Handling ---
    const contactForm = document.getElementById('poppyContactForm');
    const contactMsg = document.getElementById('contactFormMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const isEnglish = body.classList.contains('lang-en');

            // Validate calendar selection
            if (!selectedDateInput.value || !selectedTimeInput.value) {
                contactMsg.className = 'form-message error';
                contactMsg.innerHTML = isEnglish 
                    ? '⚠️ Please select a preferred date and time from the calendar.' 
                    : '⚠️ Lütfen takvimden tercih ettiğiniz bir gün ve saat seçin.';
                return;
            }
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = isEnglish ? 'Sending...' : 'Gönderiliyor...';
            submitBtn.disabled = true;

            // Simulate form submission (e.g. to a backend / email)
            setTimeout(() => {
                contactMsg.className = 'form-message success';
                
                const typeText = {
                    'in-person': isEnglish ? 'In-Person Workshop' : 'Yüz Yüze Atölye',
                    'online-1to1': isEnglish ? 'Online 1-on-1 Lesson' : 'Online Bire Bir Ders',
                    'online-group': isEnglish ? 'Online Group Lesson' : 'Online Grup Dersi'
                }[selectedTypeInput.value];

                if (isEnglish) {
                    contactMsg.innerHTML = `🎉 Application received for <strong>${typeText}</strong> on <strong>${selectedDateTimeText.textContent}</strong>! We will contact you soon.`;
                } else {
                    contactMsg.innerHTML = `🎉 Başvurunuz alındı! <strong>${typeText}</strong> için randevunuz <strong>${selectedDateTimeText.textContent}</strong> olarak kaydedildi. En kısa sürede iletişime geçeceğiz.`;
                }
                
                contactForm.reset();
                selectedDateInput.value = '';
                selectedTimeInput.value = '';
                timeSlotsWrapper.style.display = 'none';
                selectedDateTimeDisplay.style.display = 'none';
                
                // Reset active states
                document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('active'));
                typeCards.forEach(c => c.classList.remove('active'));
                document.querySelector('[data-type="in-person"]').classList.add('active');
                selectedTypeInput.value = 'in-person';
                
                renderCalendar();

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                // Remove feedback message after 7 seconds
                setTimeout(() => {
                    contactMsg.innerHTML = '';
                }, 7000);
            }, 1200);
        });
    }
});

