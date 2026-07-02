document.addEventListener('DOMContentLoaded', () => {
    let currentContent = null;

    // UI Elements
    const saveAllBtn = document.getElementById('save-all-btn');
    const toast = document.getElementById('toast');
    const tabTitle = document.getElementById('tab-title');
    const menuButtons = document.querySelectorAll('.menu-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Steps container
    const stepsContainer = document.querySelector('.steps-container');
    // Weeks container
    const weeksGrid = document.querySelector('.weeks-grid-editor');
    // FAQs container
    const faqsContainer = document.querySelector('.faqs-container');

    // Toast Notification helper
    function showToast(message, type = 'success') {
        toast.className = `toast show ${type}`;
        toast.innerText = message;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // Tab Switching Logic
    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Toggle active menu button
            menuButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Toggle active tab pane
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `tab-${targetTab}`) {
                    pane.classList.add('active');
                }
            });

            // Update Header Title
            tabTitle.innerText = btn.innerText.replace(/^[^\w\s\(\)ĞğÜüŞşİıÖöÇç]+/, '').trim() + ' Düzenleme';
        });
    });

    // Fetch and Populate Content
    async function loadContent() {
        try {
            const response = await fetch('/api/content');
            if (!response.ok) throw new Error('İçerik yüklenemedi.');
            
            const data = await response.json();
            currentContent = data;

            // Populate Hero
            document.getElementById('hero-badge-tr-input').value = data.hero.badgeTr || '';
            document.getElementById('hero-badge-en-input').value = data.hero.badgeEn || '';
            document.getElementById('hero-title-tr-input').value = data.hero.titleTr || '';
            document.getElementById('hero-title-en-input').value = data.hero.titleEn || '';
            document.getElementById('hero-desc-tr-input').value = data.hero.descTr || '';
            document.getElementById('hero-desc-en-input').value = data.hero.descEn || '';
            document.getElementById('hero-btn-tr-input').value = data.hero.btnTr || '';
            document.getElementById('hero-btn-en-input').value = data.hero.btnEn || '';

            // Populate Structure Taglines
            document.getElementById('struct-tagline-tr-input').value = data.structure.taglineTr || '';
            document.getElementById('struct-tagline-en-input').value = data.structure.taglineEn || '';

            // Render Structure Steps
            stepsContainer.innerHTML = '';
            data.structure.steps.forEach((step, idx) => {
                const i = idx + 1;
                stepsContainer.innerHTML += `
                    <div class="step-edit-card">
                        <div class="step-num">${i}</div>
                        <div class="form-group">
                            <label>Türkçe Adım İsmi</label>
                            <input type="text" class="step-tr-input" data-index="${idx}" value="${step.tr || ''}">
                        </div>
                        <div class="form-group">
                            <label>İngilizce Adım İsmi</label>
                            <input type="text" class="step-en-input" data-index="${idx}" value="${step.en || ''}">
                        </div>
                    </div>
                `;
            });

            // Render Weeks
            weeksGrid.innerHTML = '';
            data.weeks.forEach((week, idx) => {
                const i = idx + 1;
                // Add a random query parameter to source image to prevent browser cache from showing old image
                const imgSrc = week.img ? `/${week.img}?t=${Date.now()}` : '';
                weeksGrid.innerHTML += `
                    <div class="week-edit-card">
                        <h4>Hafta ${i}</h4>
                        <div class="week-img-wrapper">
                            <img id="week-img-preview-${i}" src="${imgSrc}" alt="Hafta ${i}">
                            <label class="upload-btn-overlay">
                                📸 Resmi Değiştir
                                <input type="file" class="week-img-upload" data-week="${i}" accept="image/*">
                            </label>
                        </div>
                        <div class="form-group">
                            <label>Türkçe Başlık</label>
                            <input type="text" class="week-tr-input" data-index="${idx}" value="${week.tr || ''}">
                        </div>
                        <div class="form-group">
                            <label>İngilizce Başlık</label>
                            <input type="text" class="week-en-input" data-index="${idx}" value="${week.en || ''}">
                        </div>
                    </div>
                `;
            });

            // Add upload listeners for week images
            document.querySelectorAll('.week-img-upload').forEach(input => {
                input.addEventListener('change', (e) => {
                    const week = input.getAttribute('data-week');
                    handleImageUpload(e.target.files[0], `week-img-${week}`, `week-img-preview-${week}`);
                });
            });

            // Populate About
            document.getElementById('about-title-tr-input').value = data.about.titleTr || '';
            document.getElementById('about-title-en-input').value = data.about.titleEn || '';
            document.getElementById('about-bio-tr-input').value = data.about.bioTr || '';
            document.getElementById('about-bio-en-input').value = data.about.bioEn || '';
            document.getElementById('about-img-preview').src = data.about.img ? `/${data.about.img}?t=${Date.now()}` : '';

            // Render FAQs
            faqsContainer.innerHTML = '';
            data.faqs.forEach((faq, idx) => {
                const i = idx + 1;
                faqsContainer.innerHTML += `
                    <div class="faq-edit-card">
                        <h4>Soru ${i}</h4>
                        <div class="lang-row">
                            <div class="lang-column">
                                <div class="form-group">
                                    <label>Türkçe Soru</label>
                                    <input type="text" class="faq-q-tr-input" data-index="${idx}" value="${faq.qTr || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Türkçe Cevap (HTML Destekler)</label>
                                    <textarea class="faq-a-tr-input" data-index="${idx}" rows="4">${faq.aTr || ''}</textarea>
                                </div>
                            </div>
                            <div class="lang-column">
                                <div class="form-group">
                                    <label>İngilizce Soru</label>
                                    <input type="text" class="faq-q-en-input" data-index="${idx}" value="${faq.qEn || ''}">
                                </div>
                                <div class="form-group">
                                    <label>İngilizce Cevap (HTML Destekler)</label>
                                    <textarea class="faq-a-en-input" data-index="${idx}" rows="4">${faq.aEn || ''}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            // Populate Contact
            document.getElementById('contact-title-tr-input').value = data.contact.titleTr || '';
            document.getElementById('contact-title-en-input').value = data.contact.titleEn || '';
            document.getElementById('contact-desc-tr-input').value = data.contact.descTr || '';
            document.getElementById('contact-desc-en-input').value = data.contact.descEn || '';

        } catch (err) {
            console.error(err);
            showToast('İçerik verisi yüklenirken hata oluştu: ' + err.message, 'error');
        }
    }

    // Image Upload Handling
    async function handleImageUpload(file, fieldId, previewElementId) {
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fieldId', fieldId);

        try {
            showToast('Resim yükleniyor...', 'info');
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Resim yükleme başarısız oldu.');

            const result = await response.json();
            if (result.success) {
                // Update preview element src
                document.getElementById(previewElementId).src = `/${result.src}?t=${Date.now()}`;
                showToast('Resim başarıyla yüklendi ve güncellendi!');
            }
        } catch (err) {
            console.error(err);
            showToast('Resim yüklenirken hata oluştu: ' + err.message, 'error');
        }
    }

    // Add About Image Upload listener
    document.getElementById('about-img-upload').addEventListener('change', (e) => {
        handleImageUpload(e.target.files[0], 'about-img', 'about-img-preview');
    });

    // Save All Changes
    saveAllBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (!currentContent) return;

        // Compile payload
        const updatedData = {
            hero: {
                badgeTr: document.getElementById('hero-badge-tr-input').value,
                badgeEn: document.getElementById('hero-badge-en-input').value,
                titleTr: document.getElementById('hero-title-tr-input').value,
                titleEn: document.getElementById('hero-title-en-input').value,
                descTr: document.getElementById('hero-desc-tr-input').value,
                descEn: document.getElementById('hero-desc-en-input').value,
                btnTr: document.getElementById('hero-btn-tr-input').value,
                btnEn: document.getElementById('hero-btn-en-input').value
            },
            structure: {
                taglineTr: document.getElementById('struct-tagline-tr-input').value,
                taglineEn: document.getElementById('struct-tagline-en-input').value,
                steps: []
            },
            weeks: [],
            about: {
                titleTr: document.getElementById('about-title-tr-input').value,
                titleEn: document.getElementById('about-title-en-input').value,
                bioTr: document.getElementById('about-bio-tr-input').value,
                bioEn: document.getElementById('about-bio-en-input').value
            },
            faqs: [],
            contact: {
                titleTr: document.getElementById('contact-title-tr-input').value,
                titleEn: document.getElementById('contact-title-en-input').value,
                descTr: document.getElementById('contact-desc-tr-input').value,
                descEn: document.getElementById('contact-desc-en-input').value
            }
        };

        // Steps
        const stepTrInputs = document.querySelectorAll('.step-tr-input');
        const stepEnInputs = document.querySelectorAll('.step-en-input');
        stepTrInputs.forEach((input, idx) => {
            updatedData.structure.steps.push({
                tr: input.value,
                en: stepEnInputs[idx].value
            });
        });

        // Weeks
        const weekTrInputs = document.querySelectorAll('.week-tr-input');
        const weekEnInputs = document.querySelectorAll('.week-en-input');
        weekTrInputs.forEach((input, idx) => {
            updatedData.weeks.push({
                tr: input.value,
                en: weekEnInputs[idx].value
            });
        });

        // FAQs
        const faqQTrInputs = document.querySelectorAll('.faq-q-tr-input');
        const faqQEnInputs = document.querySelectorAll('.faq-q-en-input');
        const faqATrInputs = document.querySelectorAll('.faq-a-tr-input');
        const faqAEnInputs = document.querySelectorAll('.faq-a-en-input');
        faqQTrInputs.forEach((input, idx) => {
            updatedData.faqs.push({
                qTr: input.value,
                qEn: faqQEnInputs[idx].value,
                aTr: faqATrInputs[idx].value,
                aEn: faqAEnInputs[idx].value
            });
        });

        try {
            saveAllBtn.disabled = true;
            saveAllBtn.innerText = '💾 Kaydediliyor...';

            const response = await fetch('/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error('Kaydedilemedi.');

            const result = await response.json();
            if (result.success) {
                showToast('Tüm değişiklikler index.html dosyasına kaydedildi! 🎉');
            }
        } catch (err) {
            console.error(err);
            showToast('Değişiklikler kaydedilirken hata: ' + err.message, 'error');
        } finally {
            saveAllBtn.disabled = false;
            saveAllBtn.innerText = '💾 Değişiklikleri Kaydet';
        }
    });

    // Deploy to GitHub Push Logic
    const gitPushBtn = document.getElementById('git-push-btn');
    const gitConsole = document.getElementById('git-console');
    const consoleOutput = document.getElementById('console-output');
    const consoleSpinner = document.getElementById('console-spinner');

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
                showToast('GitHub Pages\'e yüklenirken bir hata oluştu!', 'error');
            } else {
                consoleOutput.innerText += `Başarılı!\n\nTerminal Çıktısı:\n${result.output}`;
                showToast('Siteniz başarıyla GitHub\'a yüklendi! 🌐 Değişiklikler birkaç dakika içinde canlıya geçecektir.');
            }
        } catch (err) {
            consoleOutput.innerText += `Ağ hatası: ${err.message}`;
            showToast('Sunucu ile bağlantı kurulamadı!', 'error');
        } finally {
            consoleSpinner.style.display = 'none';
            gitPushBtn.disabled = false;
        }
    });

    // Initialize content load
    loadContent();
});
