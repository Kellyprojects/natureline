const defaultContent = {
    heroTitle: 'Non-surgical fibroid treatment with clinical oversight',
    heroDesc: 'Natureline provides evidence-informed botanical therapy combined with professional monitoring, offering women a safe alternative to surgery for fibroid management.',
    heroImg: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
    aboutText: 'Fibroids are benign uterine tumors affecting many women. Natureline\'s non-surgical approach uses proven botanical formulation and clinical oversight to reduce symptoms and improve quality of life without hysterectomy or myomectomy.',
    homeDoctorTitle: 'Dr. Williams Adetunji',
    homeDoctorText: 'Board-experienced medical professional specializing in non-surgical fibroid management and reproductive health support with a patient-centered clinical approach.',
    homeDoctorImage: 'images/dr-williams.jpg',
    aboutPageTitle: 'Understanding Natureline\'s approach to non-surgical fibroid management',
    aboutPageText: 'Fibroids (benign uterine tumors) affect millions of women and can cause significant symptoms including heavy menstrual bleeding, pelvic pain, and urinary dysfunction. Natureline provides a clinical alternative to hysterectomy and myomectomy through evidence-informed botanical treatment combined with professional oversight and continuous patient support throughout the care pathway.',
    aboutPageImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
    teamPageTitle: 'Clinical team expertise in fibroid care',
    teamPageText: 'Our team combines medical expertise, patient advocacy, and a commitment to evidence-based non-surgical fibroid management. We work with each patient individually to ensure safe, effective treatment outcomes.',
    teamPageImage: 'images/dr-williams.jpg',
    contactPageTitle: 'Connect with our clinical team',
    contactPageText: 'Reach us through multiple channels to discuss fibroid symptoms, treatment options, and how Natureline can support your healthcare journey.',
    contactPageImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80',
    orderPageTitle: 'Begin your fibroid treatment consultation',
    orderPageDesc: 'Complete the intake form and secure payment to schedule your personalized clinical assessment and start the Natureline non-surgical treatment pathway.',
    orderPagePrice: 'Consultation & treatment package: ₦35,000',
    orderPageNote: 'After payment confirmation, our clinical team will contact you within 24 hours to schedule your initial assessment and discuss your personalized treatment plan.'
};

if (!localStorage.getItem('natureline_content')) {
    localStorage.setItem('natureline_content', JSON.stringify(defaultContent));
} else {
    const storedContent = JSON.parse(localStorage.getItem('natureline_content')) || {};
    const imageUpdates = {
        homeDoctorImage: 'images/dr-williams.jpg',
        teamPageImage: 'images/dr-williams.jpg'
    };

    let hasUpdate = false;
    for (const [key, newValue] of Object.entries(imageUpdates)) {
        const currentValue = storedContent[key];
        if (currentValue && currentValue.includes('images.unsplash.com')) {
            storedContent[key] = newValue;
            hasUpdate = true;
        }
    }

    if (hasUpdate) {
        localStorage.setItem('natureline_content', JSON.stringify({ ...defaultContent, ...storedContent }));
    }
}
if (!localStorage.getItem('natureline_feedback')) {
    localStorage.setItem('natureline_feedback', JSON.stringify([]));
}

function renderPublicPage() {
    const content = JSON.parse(localStorage.getItem('natureline_content')) || defaultContent;
    const feedbackList = JSON.parse(localStorage.getItem('natureline_feedback')) || [];

    const heroTitle = document.getElementById('pub-hero-title');
    const heroDesc = document.getElementById('pub-hero-desc');
    const heroImg = document.getElementById('pub-hero-img');
    const aboutText = document.getElementById('pub-about-text');
    const homeDoctorTitle = document.getElementById('home-doctor-title');
    const homeDoctorText = document.getElementById('home-doctor-text');
    const homeDoctorImage = document.getElementById('home-doctor-image');
    const aboutPageTitle = document.getElementById('about-page-title');
    const aboutPageText = document.getElementById('about-page-text');
    const aboutPageImage = document.getElementById('about-page-image');
    const teamPageTitle = document.getElementById('team-page-title');
    const teamPageText = document.getElementById('team-page-text');
    const teamPageImage = document.getElementById('team-page-image');
    const contactPageTitle = document.getElementById('contact-page-title');
    const contactPageText = document.getElementById('contact-page-text');
    const contactPageImage = document.getElementById('contact-page-image');
    const orderPageTitle = document.getElementById('order-hero-title');
    const orderPageDesc = document.getElementById('order-hero-desc');
    const orderPagePrice = document.getElementById('order-price');
    const orderPageNote = document.getElementById('order-note');

    if (heroTitle) heroTitle.innerText = content.heroTitle || defaultContent.heroTitle;
    if (heroDesc) heroDesc.innerText = content.heroDesc || defaultContent.heroDesc;
    if (heroImg) heroImg.src = content.heroImg || defaultContent.heroImg;
    if (aboutText) aboutText.innerText = content.aboutText || defaultContent.aboutText;
    if (homeDoctorTitle) homeDoctorTitle.innerText = content.homeDoctorTitle || defaultContent.homeDoctorTitle;
    if (homeDoctorText) homeDoctorText.innerText = content.homeDoctorText || defaultContent.homeDoctorText;
    if (homeDoctorImage) homeDoctorImage.src = content.homeDoctorImage || defaultContent.homeDoctorImage;
    if (aboutPageTitle) aboutPageTitle.innerText = content.aboutPageTitle || defaultContent.aboutPageTitle;
    if (aboutPageText) aboutPageText.innerText = content.aboutPageText || defaultContent.aboutPageText;
    if (aboutPageImage) aboutPageImage.src = content.aboutPageImage || defaultContent.aboutPageImage;
    if (teamPageTitle) teamPageTitle.innerText = content.teamPageTitle || defaultContent.teamPageTitle;
    if (teamPageText) teamPageText.innerText = content.teamPageText || defaultContent.teamPageText;
    if (teamPageImage) teamPageImage.src = content.teamPageImage || defaultContent.teamPageImage;
    if (contactPageTitle) contactPageTitle.innerText = content.contactPageTitle || defaultContent.contactPageTitle;
    if (contactPageText) contactPageText.innerText = content.contactPageText || defaultContent.contactPageText;
    if (contactPageImage) contactPageImage.src = content.contactPageImage || defaultContent.contactPageImage;
    if (orderPageTitle) orderPageTitle.innerText = content.orderPageTitle || defaultContent.orderPageTitle;
    if (orderPageDesc) orderPageDesc.innerText = content.orderPageDesc || defaultContent.orderPageDesc;
    if (orderPagePrice) orderPagePrice.innerText = content.orderPagePrice || defaultContent.orderPagePrice;
    if (orderPageNote) orderPageNote.innerText = content.orderPageNote || defaultContent.orderPageNote;

    const container = document.getElementById('pub-feedback-container');
    if (!container) return;

    container.innerHTML = '';
    const approved = feedbackList.filter((item) => item.status === 'approved');

    if (approved.length === 0) {
        container.innerHTML = '<p class="text-slate-500 italic">No case verification histories have been published yet.</p>';
        return;
    }

    approved.forEach((item) => {
        container.innerHTML += `
            <div class="card">
                <h3>${item.name}</h3>
                <p>"${item.text}"</p>
                <div class="grid-2" style="margin-top:0.8rem; gap:0.65rem;">
                    <img src="${item.beforeImg}" alt="Before image" />
                    <img src="${item.afterImg}" alt="After image" />
                </div>
            </div>`;
    });
}

function openFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function submitClientFeedback() {
    const name = document.getElementById('fb-client-name').value || 'Anonymous Client';
    const text = document.getElementById('fb-text').value;
    const beforeImg = document.getElementById('fb-before-img').value || 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=400&q=80';
    const afterImg = document.getElementById('fb-after-img').value || 'https://images.unsplash.com/photo-1559757175-0214a66e1470?auto=format&fit=crop&w=400&q=80';

    if (!text) {
        alert('A feedback note is required.');
        return;
    }

    const feedbackList = JSON.parse(localStorage.getItem('natureline_feedback')) || [];
    feedbackList.push({ id: Date.now(), name, text, beforeImg, afterImg, status: 'pending' });
    localStorage.setItem('natureline_feedback', JSON.stringify(feedbackList));

    alert('Submission has been sent to the admin pipeline for review.');
    closeFeedbackModal();
}

function payWithPaystack() {
    const name = document.getElementById('order-name')?.value || document.getElementById('paystack-email')?.value || '';
    const email = document.getElementById('order-email')?.value || document.getElementById('paystack-email')?.value || '';
    const phone = document.getElementById('order-phone')?.value || '';
    const notes = document.getElementById('order-notes')?.value || '';
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email.');
        return;
    }

    if (window.PaystackPop) {
        const handler = PaystackPop.setup({
            key: 'pk_test_YOUR_PUBLIC_KEY_HERE',
            email,
            amount: 35000 * 100,
            currency: 'NGN',
            metadata: { custom_fields: [{ display_name: 'Name', variable_name: 'name', value: name }, { display_name: 'Phone', variable_name: 'phone', value: phone }, { display_name: 'Notes', variable_name: 'notes', value: notes }] },
            callback: function (response) {
                alert('Payment successful! Reference: ' + response.reference);
            },
            onClose: function () {
                alert('Payment window closed.');
            }
        });
        handler.openIframe();
    } else {
        alert('Payment gateway is not available right now.');
    }
}

function initNavigation() {
    const toggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }
}

function getBotReply(message) {
    const text = message.toLowerCase();
    const faqMap = [
        { pattern: ['nafdac', 'approved', 'approval'], reply: 'Yes — our fibroid treatment formulation is NAFDAC approved for non-surgical therapeutic use. All formulations meet strict safety and quality standards.' },
        { pattern: ['price', 'cost', 'amount', 'payment', 'pay'], reply: 'Our consultation and initial treatment package is ₦35,000. This covers clinical assessment, personalized care planning, and the start of your treatment pathway.' },
        { pattern: ['doctor', 'dr', 'team', 'meet'], reply: 'Dr. Williams Adetunji leads our clinical team with expertise in non-surgical fibroid management. Our team provides personalized care and continuous monitoring throughout treatment.' },
        { pattern: ['contact', 'whatsapp', 'email', 'gmail', 'call', 'phone', 'video'], reply: 'You can contact us through WhatsApp, email, phone, or video consultation from the contact page to discuss your fibroid symptoms and treatment options.' },
        { pattern: ['fibroid', 'treatment', 'therapy', 'support'], reply: 'We provide non-surgical fibroid treatment using botanical formulation combined with clinical monitoring. Our approach is designed to reduce fibroid symptoms and improve uterine health without surgery.' },
        { pattern: ['hours', 'open', 'available', 'time'], reply: 'Our clinical team is available during office hours for consultations and can assist with urgent questions through our contact channels.' },
        { pattern: ['order', 'buy', 'book', 'consultation'], reply: 'You can schedule your clinical assessment and begin the fibroid treatment pathway through our secure order page. After payment, our team will contact you to confirm.' },
        { pattern: ['hello', 'hi', 'help'], reply: 'Hello! I can assist with fibroid treatment information, pricing, NAFDAC approval details, our clinical team, contact options, and scheduling your consultation.' }
    ];

    for (const item of faqMap) {
        if (item.pattern.some((phrase) => text.includes(phrase))) {
            return item.reply;
        }
    }

    return 'Thank you for reaching out. I can help with non-surgical fibroid treatment details, pricing, clinical team information, contact options, and consultation scheduling.';
}

function initChatbot() {
    const toggle = document.getElementById('chat-toggle');
    const panel = document.getElementById('chat-panel');
    const messages = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendButton = document.getElementById('chat-send');

    if (!toggle || !panel || !messages || !input || !sendButton) return;

    const addMessage = (text, role) => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${role}`;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    };

    toggle.addEventListener('click', () => {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            input.focus();
        }
    });

    addMessage('Hello! I can help with treatment details, contact options, doctor information, and pricing.', 'bot');

    const submit = () => {
        const value = input.value.trim();
        if (!value) return;
        addMessage(value, 'user');
        input.value = '';
        window.setTimeout(() => {
            addMessage(getBotReply(value), 'bot');
        }, 400);
    };

    sendButton.addEventListener('click', submit);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            submit();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderPublicPage();
    initNavigation();
    initChatbot();
});