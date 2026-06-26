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

    // --- Contact Form Submission Handling ---
    const contactForm = document.getElementById('poppyContactForm');
    const contactMsg = document.getElementById('contactFormMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Language-dependent status messages
            const isEnglish = body.classList.contains('lang-en');
            submitBtn.innerHTML = isEnglish ? 'Sending...' : 'Gönderiliyor...';
            submitBtn.disabled = true;

            setTimeout(() => {
                contactMsg.className = 'form-message success';
                if (isEnglish) {
                    contactMsg.innerHTML = '🎉 Your message has been sent! We will contact you soon.';
                } else {
                    contactMsg.innerHTML = '🎉 Mesajınız başarıyla gönderildi! En kısa sürede iletişime geçeceğiz.';
                }
                
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                // Remove feedback message after 5 seconds
                setTimeout(() => {
                    contactMsg.innerHTML = '';
                }, 5000);
            }, 1200);
        });
    }
});
