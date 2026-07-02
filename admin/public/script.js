document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('website-iframe');
    const saveBtn = document.getElementById('save-btn');
    const deployBtn = document.getElementById('deploy-btn');
    const fileInput = document.getElementById('global-image-upload');
    const toast = document.getElementById('toast');
    
    // Modal & Deploy elements
    const deployModal = document.getElementById('deploy-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const gitPushBtn = document.getElementById('git-push-btn');
    const gitConsole = document.getElementById('git-console');
    const consoleOutput = document.getElementById('console-output');
    const consoleSpinner = document.getElementById('console-spinner');

    let targetImageFieldId = null;
    let targetImageElementInIframe = null;

    // Toast Notification helper
    function showToast(message, type = 'success') {
        toast.className = `toast show ${type}`;
        toast.innerText = message;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // Modal control
    deployBtn.addEventListener('click', () => {
        deployModal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
        deployModal.style.display = 'none';
    });

    // Close modal on click outside content card
    deployModal.addEventListener('click', (e) => {
        if (e.target === deployModal) {
            deployModal.style.display = 'none';
        }
    });

    // Iframe loaded trigger
    iframe.addEventListener('load', () => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // 1. Inject Visual Highlighter Styles into Iframe
        const style = iframeDoc.createElement('style');
        style.textContent = `
            [contenteditable="true"] {
                transition: all 0.25s ease;
                min-height: 1em;
            }
            [contenteditable="true"]:hover {
                outline: 2px dashed #F25C54 !important;
                outline-offset: 6px !important;
                background-color: rgba(242, 92, 84, 0.04) !important;
                cursor: text !important;
            }
            [contenteditable="true"]:focus {
                outline: 2px solid #70C1B3 !important;
                outline-offset: 6px !important;
                background-color: transparent !important;
            }
            img[id^="week-img-"]:hover, #about-img:hover {
                outline: 3px dashed #F25C54 !important;
                outline-offset: 4px !important;
                filter: brightness(0.9) !important;
                cursor: pointer !important;
                transition: all 0.25s ease;
            }
        `;
        iframeDoc.head.appendChild(style);

        // 2. Define all editable text elements
        const textIds = [
            // Hero
            'hero-badge-tr', 'hero-badge-en',
            'hero-title-tr', 'hero-title-en',
            'hero-desc-tr', 'hero-desc-en',
            'hero-btn-tr', 'hero-btn-en',
            // Structure
            'struct-tagline-tr', 'struct-tagline-en',
            // Steps
            'struct-step-tr-1', 'struct-step-en-1',
            'struct-step-tr-2', 'struct-step-en-2',
            'struct-step-tr-3', 'struct-step-en-3',
            'struct-step-tr-4', 'struct-step-en-4',
            'struct-step-tr-5', 'struct-step-en-5',
            'struct-step-tr-6', 'struct-step-en-6',
            // Weeks
            'week-title-tr-1', 'week-title-en-1',
            'week-title-tr-2', 'week-title-en-2',
            'week-title-tr-3', 'week-title-en-3',
            'week-title-tr-4', 'week-title-en-4',
            'week-title-tr-5', 'week-title-en-5',
            'week-title-tr-6', 'week-title-en-6',
            // About
            'about-title-tr', 'about-title-en',
            'about-bio-tr', 'about-bio-en',
            // FAQs
            'faq-q-tr-1', 'faq-q-en-1', 'faq-a-tr-1', 'faq-a-en-1',
            'faq-q-tr-2', 'faq-q-en-2', 'faq-a-tr-2', 'faq-a-en-2',
            'faq-q-tr-3', 'faq-q-en-3', 'faq-a-tr-3', 'faq-a-en-3',
            // Contact
            'contact-title-tr', 'contact-title-en',
            'contact-desc-tr', 'contact-desc-en'
        ];

        textIds.forEach(id => {
            const el = iframeDoc.getElementById(id);
            if (el) {
                el.setAttribute('contenteditable', 'true');
            }
        });

        // 3. Make Images clickable for upload
        const imageIds = [
            'about-img',
            'week-img-1', 'week-img-2', 'week-img-3',
            'week-img-4', 'week-img-5', 'week-img-6'
        ];

        imageIds.forEach(id => {
            const img = iframeDoc.getElementById(id);
            if (img) {
                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    targetImageFieldId = id;
                    targetImageElementInIframe = img;
                    fileInput.click();
                });
            }
        });

        // 4. Intercept link navigation (Prevent external tabs)
        iframeDoc.querySelectorAll('a').forEach(anchor => {
            const href = anchor.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    showToast('Düzenleme modunda harici web sayfalarına gitmek engellenmiştir.', 'info');
                });
            }
        });
    });

    // Handle Image Upload Action
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || !targetImageFieldId) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fieldId', targetImageFieldId);

        try {
            showToast('Resim yükleniyor...', 'info');
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Resim yüklenemedi.');
            const result = await response.json();
            if (result.success) {
                // Update src inside iframe with cache buster
                if (targetImageElementInIframe) {
                    targetImageElementInIframe.src = `/${result.src}?t=${Date.now()}`;
                }
                showToast('Resim yüklendi ve sayfada güncellendi! 🎉');
            }
        } catch (err) {
            console.error(err);
            showToast('Resim yüklenirken hata oluştu: ' + err.message, 'error');
        } finally {
            fileInput.value = ''; // Reset file input
        }
    });

    // Save All Changes
    saveBtn.addEventListener('click', async () => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc) {
            return showToast('Editör önizlemesi yüklenemedi.', 'error');
        }

        // Gather all visual text inputs from the iframe DOM
        const payload = {
            hero: {
                badgeTr: iframeDoc.getElementById('hero-badge-tr')?.innerText?.trim() || '',
                badgeEn: iframeDoc.getElementById('hero-badge-en')?.innerText?.trim() || '',
                titleTr: iframeDoc.getElementById('hero-title-tr')?.innerHTML?.trim() || '',
                titleEn: iframeDoc.getElementById('hero-title-en')?.innerHTML?.trim() || '',
                descTr: iframeDoc.getElementById('hero-desc-tr')?.innerHTML?.trim() || '',
                descEn: iframeDoc.getElementById('hero-desc-en')?.innerHTML?.trim() || '',
                btnTr: iframeDoc.getElementById('hero-btn-tr')?.innerText?.trim() || '',
                btnEn: iframeDoc.getElementById('hero-btn-en')?.innerText?.trim() || ''
            },
            structure: {
                taglineTr: iframeDoc.getElementById('struct-tagline-tr')?.innerText?.trim() || '',
                taglineEn: iframeDoc.getElementById('struct-tagline-en')?.innerText?.trim() || '',
                steps: []
            },
            weeks: [],
            about: {
                titleTr: iframeDoc.getElementById('about-title-tr')?.innerHTML?.trim() || '',
                titleEn: iframeDoc.getElementById('about-title-en')?.innerHTML?.trim() || '',
                bioTr: iframeDoc.getElementById('about-bio-tr')?.innerHTML?.trim() || '',
                bioEn: iframeDoc.getElementById('about-bio-en')?.innerHTML?.trim() || ''
            },
            faqs: [],
            contact: {
                titleTr: iframeDoc.getElementById('contact-title-tr')?.innerHTML?.trim() || '',
                titleEn: iframeDoc.getElementById('contact-title-en')?.innerHTML?.trim() || '',
                descTr: iframeDoc.getElementById('contact-desc-tr')?.innerHTML?.trim() || '',
                descEn: iframeDoc.getElementById('contact-desc-en')?.innerHTML?.trim() || ''
            }
        };

        // Extract Steps (1-6)
        for (let i = 1; i <= 6; i++) {
            payload.structure.steps.push({
                tr: iframeDoc.getElementById(`struct-step-tr-${i}`)?.innerText?.trim() || '',
                en: iframeDoc.getElementById(`struct-step-en-${i}`)?.innerText?.trim() || ''
            });
        }

        // Extract Weeks (1-6)
        for (let i = 1; i <= 6; i++) {
            payload.weeks.push({
                tr: iframeDoc.getElementById(`week-title-tr-${i}`)?.innerText?.trim() || '',
                en: iframeDoc.getElementById(`week-title-en-${i}`)?.innerText?.trim() || ''
            });
        }

        // Extract FAQs (1-3)
        for (let i = 1; i <= 3; i++) {
            payload.faqs.push({
                qTr: iframeDoc.getElementById(`faq-q-tr-${i}`)?.innerText?.trim() || '',
                qEn: iframeDoc.getElementById(`faq-q-en-${i}`)?.innerText?.trim() || '',
                aTr: iframeDoc.getElementById(`faq-a-tr-${i}`)?.innerHTML?.trim() || '',
                aEn: iframeDoc.getElementById(`faq-a-en-${i}`)?.innerHTML?.trim() || ''
            });
        }

        try {
            saveBtn.disabled = true;
            saveBtn.innerText = '💾 Kaydediliyor...';

            const response = await fetch('/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Kaydetme hatası.');
            const result = await response.json();
            
            if (result.success) {
                showToast('Tüm değişiklikler başarıyla index.html dosyasına kaydedildi! 🎉');
            }
        } catch (err) {
            console.error(err);
            showToast('Kaydetme başarısız: ' + err.message, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerText = '💾 Değişiklikleri Kaydet';
        }
    });

    // Deploy / Git Push logic
    gitPushBtn.addEventListener('click', async () => {
        gitConsole.style.display = 'block';
        consoleOutput.innerText = 'Yükleme başlatılıyor...\n';
        consoleSpinner.style.display = 'inline-block';
        gitPushBtn.disabled = true;

        try {
            const response = await fetch('/api/git-push', { method: 'POST' });
            const result = await response.json();

            if (!response.ok || !result.success) {
                consoleOutput.innerText += `Hata: ${result.error || 'Bilinmeyen hata'}\n\nDetaylar:\n${result.details || ''}`;
                consoleOutput.className = 'console-output error-text';
                showToast('Yayınlama sırasında hata oluştu!', 'error');
            } else {
                consoleOutput.innerText += `Başarılı!\n\nTerminal Çıktısı:\n${result.output}`;
                showToast('Değişiklikleriniz GitHub Pages\'e yüklendi! Canlıya geçmesi birkaç dakika sürebilir.');
            }
        } catch (err) {
            consoleOutput.innerText += `Ağ hatası: ${err.message}`;
            showToast('Sunucu ile bağlantı kurulamadı!', 'error');
        } finally {
            consoleSpinner.style.display = 'none';
            gitPushBtn.disabled = false;
        }
    });
});
