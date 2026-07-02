const express = require('express');
const multer = require('multer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Paths
const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');
const assetsDir = path.join(rootDir, 'assets');

// Serve Admin Panel static files
app.use('/admin', express.static(path.join(__dirname, 'public')));
// Serve Website files
app.use(express.static(rootDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, assetsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.png';
        const fieldId = req.body.fieldId || 'upload';
        const safeName = fieldId.replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${safeName}_${Date.now()}${ext}`);
    }
});

const upload = multer({ storage });

// GET Current Content
app.get('/api/content', (req, res) => {
    try {
        if (!fs.existsSync(indexPath)) {
            return res.status(404).json({ error: 'index.html not found' });
        }
        
        const html = fs.readFileSync(indexPath, 'utf8');
        const $ = cheerio.load(html);
        
        const content = {
            hero: {
                badgeTr: $('#hero-badge-tr').text().trim(),
                badgeEn: $('#hero-badge-en').text().trim(),
                titleTr: $('#hero-title-tr').html() ? $('#hero-title-tr').html().trim() : '',
                titleEn: $('#hero-title-en').html() ? $('#hero-title-en').html().trim() : '',
                descTr: $('#hero-desc-tr').html() ? $('#hero-desc-tr').html().trim() : '',
                descEn: $('#hero-desc-en').html() ? $('#hero-desc-en').html().trim() : '',
                btnTr: $('#hero-btn-tr').text().trim(),
                btnEn: $('#hero-btn-en').text().trim()
            },
            structure: {
                taglineTr: $('#struct-tagline-tr').text().trim(),
                taglineEn: $('#struct-tagline-en').text().trim(),
                steps: []
            },
            weeks: [],
            about: {
                titleTr: $('#about-title-tr').html() ? $('#about-title-tr').html().trim() : '',
                titleEn: $('#about-title-en').html() ? $('#about-title-en').html().trim() : '',
                bioTr: $('#about-bio-tr').html() ? $('#about-bio-tr').html().trim() : '',
                bioEn: $('#about-bio-en').html() ? $('#about-bio-en').html().trim() : '',
                img: $('#about-img').attr('src')
            },
            faqs: [],
            contact: {
                titleTr: $('#contact-title-tr').html() ? $('#contact-title-tr').html().trim() : '',
                titleEn: $('#contact-title-en').html() ? $('#contact-title-en').html().trim() : '',
                descTr: $('#contact-desc-tr').html() ? $('#contact-desc-tr').html().trim() : '',
                descEn: $('#contact-desc-en').html() ? $('#contact-desc-en').html().trim() : ''
            }
        };

        // Extract steps (1-6)
        for (let i = 1; i <= 6; i++) {
            content.structure.steps.push({
                tr: $(`#struct-step-tr-${i}`).text().trim(),
                en: $(`#struct-step-en-${i}`).text().trim()
            });
        }

        // Extract weeks (1-6)
        for (let i = 1; i <= 6; i++) {
            content.weeks.push({
                tr: $(`#week-title-tr-${i}`).text().trim(),
                en: $(`#week-title-en-${i}`).text().trim(),
                img: $(`#week-img-${i}`).attr('src')
            });
        }

        // Extract FAQs (1-3)
        for (let i = 1; i <= 3; i++) {
            content.faqs.push({
                qTr: $(`#faq-q-tr-${i}`).text().trim(),
                qEn: $(`#faq-q-en-${i}`).text().trim(),
                aTr: $(`#faq-a-tr-${i}`).html() ? $(`#faq-a-tr-${i}`).html().trim() : '',
                aEn: $(`#faq-a-en-${i}`).html() ? $(`#faq-a-en-${i}`).html().trim() : ''
            });
        }

        res.json(content);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read index.html: ' + err.message });
    }
});

// POST Update Content
app.post('/api/content', (req, res) => {
    try {
        if (!fs.existsSync(indexPath)) {
            return res.status(404).json({ error: 'index.html not found' });
        }
        
        const html = fs.readFileSync(indexPath, 'utf8');
        const $ = cheerio.load(html, { decodeEntities: false });
        const data = req.body;

        // Hero
        if (data.hero) {
            if (data.hero.badgeTr) $('#hero-badge-tr').text(data.hero.badgeTr);
            if (data.hero.badgeEn) $('#hero-badge-en').text(data.hero.badgeEn);
            if (data.hero.titleTr) $('#hero-title-tr').html(data.hero.titleTr);
            if (data.hero.titleEn) $('#hero-title-en').html(data.hero.titleEn);
            if (data.hero.descTr) $('#hero-desc-tr').html(data.hero.descTr);
            if (data.hero.descEn) $('#hero-desc-en').html(data.hero.descEn);
            if (data.hero.btnTr) $('#hero-btn-tr').text(data.hero.btnTr);
            if (data.hero.btnEn) $('#hero-btn-en').text(data.hero.btnEn);
        }

        // Structure
        if (data.structure) {
            if (data.structure.taglineTr) $('#struct-tagline-tr').text(data.structure.taglineTr);
            if (data.structure.taglineEn) $('#struct-tagline-en').text(data.structure.taglineEn);
            if (data.structure.steps) {
                data.structure.steps.forEach((step, idx) => {
                    const i = idx + 1;
                    if (step.tr) $(`#struct-step-tr-${i}`).text(step.tr);
                    if (step.en) $(`#struct-step-en-${i}`).text(step.en);
                });
            }
        }

        // Weeks
        if (data.weeks) {
            data.weeks.forEach((week, idx) => {
                const i = idx + 1;
                if (week.tr) $(`#week-title-tr-${i}`).text(week.tr);
                if (week.en) $(`#week-title-en-${i}`).text(week.en);
                // Image src is handled by upload, but if provided here we can set it
                if (week.img) $(`#week-img-${i}`).attr('src', week.img);
            });
        }

        // About
        if (data.about) {
            if (data.about.titleTr) $('#about-title-tr').html(data.about.titleTr);
            if (data.about.titleEn) $('#about-title-en').html(data.about.titleEn);
            if (data.about.bioTr) $('#about-bio-tr').html(data.about.bioTr);
            if (data.about.bioEn) $('#about-bio-en').html(data.about.bioEn);
            if (data.about.img) $('#about-img').attr('src', data.about.img);
        }

        // FAQs
        if (data.faqs) {
            data.faqs.forEach((faq, idx) => {
                const i = idx + 1;
                if (faq.qTr) $(`#faq-q-tr-${i}`).text(faq.qTr);
                if (faq.qEn) $(`#faq-q-en-${i}`).text(faq.qEn);
                if (faq.aTr) $(`#faq-a-tr-${i}`).html(faq.aTr);
                if (faq.aEn) $(`#faq-a-en-${i}`).html(faq.aEn);
            });
        }

        // Contact
        if (data.contact) {
            if (data.contact.titleTr) $('#contact-title-tr').html(data.contact.titleTr);
            if (data.contact.titleEn) $('#contact-title-en').html(data.contact.titleEn);
            if (data.contact.descTr) $('#contact-desc-tr').html(data.contact.descTr);
            if (data.contact.descEn) $('#contact-desc-en').html(data.contact.descEn);
        }

        fs.writeFileSync(indexPath, $.html(), 'utf8');
        res.json({ success: true, message: 'Content updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update index.html: ' + err.message });
    }
});

// POST Image Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const fieldId = req.body.fieldId;
        if (!fieldId) {
            return res.status(400).json({ error: 'Missing fieldId' });
        }

        const relativePath = `assets/${req.file.filename}`;
        
        // Update index.html image src
        if (fs.existsSync(indexPath)) {
            const html = fs.readFileSync(indexPath, 'utf8');
            const $ = cheerio.load(html, { decodeEntities: false });
            
            $(`#${fieldId}`).attr('src', relativePath);
            fs.writeFileSync(indexPath, $.html(), 'utf8');
        }

        res.json({ success: true, src: relativePath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to handle file upload: ' + err.message });
    }
});

// POST Git Push (Deploy)
app.post('/api/git-push', (req, res) => {
    // Execute Git commands in sequence
    const cmd = 'git add . && git commit -m "Update site content via Admin Panel" && git push';
    
    exec(cmd, { cwd: rootDir }, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ 
                success: false, 
                error: error.message,
                details: stderr || stdout 
            });
        }
        res.json({ 
            success: true, 
            output: stdout,
            errors: stderr
        });
    });
});

app.listen(PORT, () => {
    console.log(`Poppy Playroom Admin Server running at http://localhost:${PORT}`);
});
