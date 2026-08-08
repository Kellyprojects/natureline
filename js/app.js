// ==========================================
// 1. DEFAULT CONTENT & STATE MANAGEMENT
// ==========================================
const defaultContent = {
    heroTitle: 'Non-surgical fibroid treatment with clinical oversight',
    heroDesc: 'Natureline provides evidence-informed botanical therapy combined with professional monitoring, offering women a safe alternative to surgery for fibroid management.',
    heroImg: 'images/images/Dr-Williams-Natureline.jpg',
    aboutText: 'Fibroids are benign uterine tumors affecting many women. Natureline\'s non-surgical approach uses proven botanical formulation and clinical oversight to reduce symptoms and improve quality of life without hysterectomy or myomectomy.',
    homeDoctorTitle: 'Dr. Williams Adetunji',
    homeDoctorText: 'Board-experienced medical professional specializing in non-surgical fibroid management and reproductive health support with a patient-centered clinical approach.',
    homeDoctorImage: 'images/dr-williams.jpg',
    aboutPageTitle: 'Understanding Natureline\'s approach to non-surgical fibroid management',
    aboutPageText: 'Fibroids (benign uterine tumors) affect millions of women and can cause significant symptoms including heavy menstrual bleeding, pelvic pain, and urinary dysfunction. Natureline provides a clinical alternative to hysterectomy and myomectomy through evidence-informed botanical treatment combined with professional oversight and continuous patient support throughout the care pathway.',
    aboutPageImage: 'images/images/fibroid-image.webp',
    teamPageTitle: 'Clinical team expertise in fibroid care',
    teamPageText: 'Our team combines medical expertise, patient advocacy, and a commitment to evidence-based non-surgical fibroid management. We work with each patient individually to ensure safe, effective treatment outcomes.',
    teamPageImage: 'images/dr-williams.jpg',
    contactPageTitle: 'Connect with our clinical team',
    contactPageText: 'Reach us through multiple channels to discuss fibroid symptoms, treatment options, and how Natureline can support your healthcare journey.',
    contactPageImage: 'images/images/team-leader.png',
    orderPageTitle: 'Choose your Eldora product order',
    orderPageDesc: 'Select from the updated Eldora catalog, review the live price for each item, and complete checkout securely.',
    orderPagePrice: 'Selected product price: ₦18,500',
    orderPageNote: 'After payment confirmation, our team will process your order and contact you with delivery or pickup details.'
};

// Default treatment catalog options
const defaultProducts = [
    { id: "p1", name: "Eldora Hormexol hormone booster — 250 ml", price: 18500 },
    { id: "p2", name: "Eldora Enervate tablets — 30 tablets", price: 25000 },
    { id: "p3", name: "Eldora Anti Festering Powder — 100 g", price: 45000 },
    { id: "p4", name: "Eldora Herbal Tablet — 30 tablets", price: 28500 },
    { id: "p5", name: "Eldora Herbal Mixture — 500 ml", price: 15000 },
    { id: "p6", name: "Eldora Tumorex natural formula — 2 tablets", price: 35000 }
];

function getCanonicalProducts() {
    const seen = new Set();

    return defaultProducts.filter((product) => {
        const key = String(product.name || '').trim().toLowerCase();

        if (!key || seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

// Initialize Storage Sandbox
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

if (!localStorage.getItem('natureline_products')) {
    localStorage.setItem('natureline_products', JSON.stringify(getCanonicalProducts()));
} else {
    localStorage.setItem('natureline_products', JSON.stringify(getCanonicalProducts()));
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ==========================================
// 2. PUBLIC VIEW RENDERING
// ==========================================
// UPGRADED: Fetches your webpage content live from Firebase instead of local browser storage
async function renderPublicPage() {
    let content = defaultContent;

    try {
        const response = await fetch('/api/get-content');
        const dbContent = await response.json();
        // If the database has content, merge it with defaults so nothing breaks
        if (dbContent && Object.keys(dbContent).length > 0) {
            content = { ...defaultContent, ...dbContent };
        }
    } catch (error) {
        console.error("Critical database fetch failed, running on fallback defaults:", error);
        // Fallback to localStorage if the server is offline during development
        content = JSON.parse(localStorage.getItem('natureline_content')) || defaultContent;
    }

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
    
    try {
        const response = await fetch('/api/get-feedbacks?status=approved');
        const result = await response.json();
        const feedbacks = Array.isArray(result.feedbacks) ? result.feedbacks : [];

        if (!feedbacks.length) {
            container.innerHTML = '<p style="color:#64748b;">No approved case notes yet.</p>';
            return;
        }

        container.innerHTML = feedbacks.map((item) => `
            <div class="feature-card" style="border:1px solid #e2e8f0;">
                <strong>${escapeHtml(item.name || 'Client')}</strong>
                <p style="margin:0.4rem 0 0;color:#475569;">${escapeHtml(item.message || '')}</p>
                ${item.productExperience ? `<p style="margin:0.4rem 0 0;font-size:0.9rem;"><em>Product:</em> ${escapeHtml(item.productExperience)}</p>` : ''}
                ${item.companyExperience ? `<p style="margin:0.3rem 0 0;font-size:0.9rem;"><em>Company:</em> ${escapeHtml(item.companyExperience)}</p>` : ''}
            </div>
        `).join('');
    } catch (error) {
        const fallbackFeedbacks = JSON.parse(localStorage.getItem('natureline_feedback')) || [];

        if (!fallbackFeedbacks.length) {
            container.innerHTML = '<p style="color:#64748b;">No case notes available right now.</p>';
            return;
        }

        container.innerHTML = fallbackFeedbacks.map((item) => `
            <div class="feature-card" style="border:1px solid #e2e8f0;">
                <strong>${escapeHtml(item.name || 'Client')}</strong>
                <p style="margin:0.4rem 0 0;color:#475569;">${escapeHtml(item.message || '')}</p>
            </div>
        `).join('');
    }
}

// ==========================================
// 3. CATALOG INTERFACE CODES
// ==========================================
function populateProducts() {
    const selectDropdown = document.getElementById('order-product-select');
    
    if (!selectDropdown) return;

    const renderOptions = (products) => {
        const safeProducts = Array.isArray(products) && products.length ? products : getCanonicalProducts();
        const uniqueProducts = [];
        const seen = new Set();

        safeProducts.forEach((product) => {
            const key = String(product?.name || '').trim().toLowerCase();

            if (!key || seen.has(key)) {
                return;
            }

            seen.add(key);
            uniqueProducts.push(product);
        });

        selectDropdown.innerHTML = '';

        uniqueProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} — ₦${Number(product.price).toLocaleString()}`;
            option.setAttribute('data-price', product.price);
            selectDropdown.appendChild(option);
        });

        updateSelectedPrice();
    };

    renderOptions(getCanonicalProducts());
}

function updateSelectedPrice() {
    const selectDropdown = document.getElementById('order-product-select');
    const priceDisplay = document.getElementById('dynamic-price-display');
    const orderPagePrice = document.getElementById('order-price');
    
    if (!selectDropdown) return;
    
    const selectedOption = selectDropdown.options[selectDropdown.selectedIndex];
    if (selectedOption) {
        const selectedPrice = Number(selectedOption.getAttribute('data-price'));
        const formattedPrice = `₦${selectedPrice.toLocaleString()}`;
        
        if (priceDisplay) priceDisplay.innerText = `Selected product price: ${formattedPrice}`;
        if (orderPagePrice) orderPagePrice.innerText = `Selected product price: ${formattedPrice}`;
    }
}


// ==========================================
// 4. CLIENT INTERACTIVE DIALOGS
// ==========================================

// Render backend URL
const API_BASE_URL = 'https://natureline.onrender.com';

// ==========================================
// CUSTOMER FEEDBACK - BASIC FORM
// ==========================================
// Sends customer feedback to the Render backend.
async function submitCustomerFeedback(event) {
    if (event) {
        event.preventDefault();
    }

    const nameInput =
        document.getElementById('feedback-name') ||
        document.getElementById('pub-feedback-name');

    const emailInput =
        document.getElementById('feedback-email') ||
        document.getElementById('pub-feedback-email');

    const msgInput =
        document.getElementById('feedback-message') ||
        document.getElementById('pub-feedback-text');

    if (
        !nameInput ||
        !msgInput ||
        !nameInput.value.trim() ||
        !msgInput.value.trim()
    ) {
        alert('Name and Message fields are required.');
        return;
    }

    const reviewPayload = {
        name: nameInput.value.trim(),
        email: emailInput
            ? emailInput.value.trim()
            : 'Anonymous Client',
        rating: 5,
        message: msgInput.value.trim()
    };

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/submit-feedback`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewPayload)
            }
        );

        if (!response.ok) {
            throw new Error(
                `Server returned HTTP ${response.status}`
            );
        }

        const result = await response.json();

        if (result.success) {
            alert('Feedback sent successfully!');

            nameInput.value = '';

            if (emailInput) {
                emailInput.value = '';
            }

            msgInput.value = '';
        } else {
            alert(
                'Server database rejected entry: ' +
                (result.message || 'Unknown error.')
            );
        }

    } catch (err) {
        console.error(
            'Network communication fault with backend server:',
            err
        );

        alert(
            'Failed to submit feedback. Please check your internet connection and try again.'
        );
    }
}

// Make function accessible to HTML onclick handlers
window.submitCustomerFeedback = submitCustomerFeedback;


// ==========================================
// FEEDBACK MODAL
// ==========================================

function openFeedbackModal() {
    const modal = document.getElementById('feedback-modal');

    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('Feedback modal not found: #feedback-modal');
    }
}

function closeFeedbackModal() {
    const modal = document.getElementById('feedback-modal');

    if (modal) {
        modal.classList.add('hidden');
    }
}

window.openFeedbackModal = openFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;


// ==========================================
// CLIENT CASE NOTE / FEEDBACK SUBMISSION
// ==========================================
// Sends the client's case note to Render.
// If an image is selected, the image is uploaded first.
// The returned image URL is then saved with the feedback.
async function submitClientFeedback(event) {
    if (event) {
        event.preventDefault();
    }

    // ------------------------------------------
    // Find form fields
    // ------------------------------------------

    const nameInput =
        document.getElementById('fb-client-name');

    const emailInput =
        document.getElementById('fb-client-email');

    const messageInput =
        document.getElementById('fb-text');

    const productInput =
        document.getElementById('fb-product-experience');

    const companyInput =
        document.getElementById('fb-company-experience');

    const imageInput =
        document.getElementById('fb-result-image');


    // ------------------------------------------
    // Read form values
    // ------------------------------------------

    const name =
        nameInput?.value.trim() || '';

    const email =
        emailInput?.value.trim() || '';

    const message =
        messageInput?.value.trim() || '';

    const productExperience =
        productInput?.value.trim() || '';

    const companyExperience =
        companyInput?.value.trim() || '';


    // ------------------------------------------
    // Validate required fields
    // ------------------------------------------

    if (!name || !message) {
        alert(
            'Please enter your name and story before submitting.'
        );
        return;
    }


    // ------------------------------------------
    // Image upload
    // ------------------------------------------

    let imageUrl = '';

    const file = imageInput?.files?.[0];

    try {

        if (file) {

            const formData = new FormData();

            formData.append('image', file);


            const uploadResponse = await fetch(
                `${API_BASE_URL}/api/upload-image`,
                {
                    method: 'POST',
                    body: formData
                }
            );


            if (!uploadResponse.ok) {
                throw new Error(
                    `Image upload failed with HTTP ${uploadResponse.status}`
                );
            }


            const uploadResult =
                await uploadResponse.json();


            if (!uploadResult.success) {

                throw new Error(
                    uploadResult.message ||
                    'The image could not be uploaded.'
                );
            }


            imageUrl =
                uploadResult.url || '';


            if (!imageUrl) {

                throw new Error(
                    'The image upload succeeded but no image URL was returned.'
                );
            }
        }


        // ------------------------------------------
        // Submit feedback to Render
        // ------------------------------------------

        const response = await fetch(
            `${API_BASE_URL}/api/submit-feedback`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    name,
                    email,
                    message,
                    rating: 5,
                    productExperience,
                    companyExperience,
                    imageUrl
                })
            }
        );


        if (!response.ok) {
            throw new Error(
                `Feedback submission failed with HTTP ${response.status}`
            );
        }


        const result =
            await response.json();


        // ------------------------------------------
        // Check server response
        // ------------------------------------------

        if (!result.success) {

            alert(
                result.message ||
                'Could not submit your case note.'
            );

            return;
        }


        // ------------------------------------------
        // Clear form
        // ------------------------------------------

        if (nameInput) {
            nameInput.value = '';
        }

        if (emailInput) {
            emailInput.value = '';
        }

        if (messageInput) {
            messageInput.value = '';
        }

        if (productInput) {
            productInput.value = '';
        }

        if (companyInput) {
            companyInput.value = '';
        }

        if (imageInput) {
            imageInput.value = '';
        }


        // ------------------------------------------
        // Close modal
        // ------------------------------------------

        closeFeedbackModal();


        // ------------------------------------------
        // Notify customer
        // ------------------------------------------

        alert(
            'Thank you! Your case note has been submitted for review.'
        );


        // ------------------------------------------
        // Refresh public feedback if function exists
        // ------------------------------------------

        if (typeof renderPublicPage === 'function') {
            renderPublicPage();
        }


    } catch (error) {

        console.error(
            'Feedback submission failed:',
            error
        );

        alert(
            error.message ||
            'Could not submit your feedback right now. Please try again later.'
        );
    }
}


// Make function accessible to HTML onclick handlers
window.submitClientFeedback = submitClientFeedback;












// ==========================================
// 5. SECURE PAYSTACK GATEWAY
// ==========================================
function payWithPaystack() {
    const name = document.getElementById('order-name')?.value || document.getElementById('paystack-email')?.value || '';
    const email = document.getElementById('order-email')?.value || document.getElementById('paystack-email')?.value || '';
    const phone = document.getElementById('order-phone')?.value || '';
    const deliveryAddress = document.getElementById('order-delivery-address')?.value?.trim() || document.getElementById('order-notes')?.value?.trim() || '';
    const notes = document.getElementById('order-notes')?.value || '';
    const selectDropdown = document.getElementById('order-product-select');
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email.');
        return;
    }

    // Default to base amount if no selection structure is loaded
    const canonicalProducts = getCanonicalProducts();
    let checkoutAmount = canonicalProducts[0].price;
    let selectedProductName = canonicalProducts[0].name;

    if (selectDropdown && selectDropdown.selectedIndex !== -1) {
        const selectedOption = selectDropdown.options[selectDropdown.selectedIndex];
        checkoutAmount = Number(selectedOption.getAttribute('data-price'));
        selectedProductName = selectedOption.textContent;
    }

    if (!deliveryAddress) {
        alert('Please add a delivery address or notes before continuing.');
        return;
    }

    fetch('/api/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            customerName: name,
            phoneNumber: phone,
            deliveryAddress,
            amount: checkoutAmount,
            productName: selectedProductName
        })
    })
        .then((response) => response.json())
        .then((result) => {
            const authorizationUrl = result?.data?.authorization_url;
            if (authorizationUrl) {
                window.location.href = authorizationUrl;
                return;
            }

            throw new Error(result?.message || 'Payment initialization failed.');
        })
        .catch((error) => {
            console.error('Backend payment init failed:', error);
            alert('Payment setup failed. Please confirm the backend server is running and your Paystack key is configured.');
        });
}

// ==========================================
// 6. GLOBAL LAYOUT LOGICS (MENU/NAV)
// ==========================================
function initNavigation() {
    const toggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }
}

// ==========================================
// 7. CHATBOT INTERFACE LOGIC
// ==========================================
function getBotReply(message) {
    const text = message.toLowerCase();
    const faqMap = [
        { pattern: ['nafdac', 'approved', 'approval'], reply: 'Yes — our fibroid treatment formulation is NAFDAC approved for non-surgical therapeutic use. All formulations meet strict safety and quality standards.' },
        { pattern: ['price', 'cost', 'amount', 'payment', 'pay'], reply: 'Our catalog includes multiple Eldora products in the order portal, with prices ranging from ₦15,000 for the Herbal Mixture to ₦45,000 for the Anti Festering Powder.' },
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

    // Clear and set start notification
    messages.innerHTML = '';
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

// ==========================================
// 8. APP BOOTSTRAP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderPublicPage();
    populateProducts(); // Loads products dynamically inside form selector context on load
    initNavigation();
    initChatbot();
});