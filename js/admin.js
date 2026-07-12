const adminCredentials = { username: 'natureline', password: 'admin2026' };

function processLogin() {
    const username = document.getElementById('admin-user')?.value || '';
    const password = document.getElementById('admin-pass')?.value || '';
    const errorBox = document.getElementById('login-error');
    const loginBox = document.getElementById('login-container');
    const dashboard = document.getElementById('dashboard-container');

    if (username === adminCredentials.username && password === adminCredentials.password) {
        if (errorBox) errorBox.classList.add('hidden');
        if (loginBox) loginBox.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
        loadAdminContent();
    } else {
        if (errorBox) errorBox.classList.remove('hidden');
    }
}

function logoutAdmin() {
    const loginBox = document.getElementById('login-container');
    const dashboard = document.getElementById('dashboard-container');
    if (loginBox) loginBox.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
}

function loadAdminContent() {
    const content = JSON.parse(localStorage.getItem('natureline_content') || '{}');
    document.getElementById('edit-hero-title').value = content.heroTitle || '';
    document.getElementById('edit-hero-desc').value = content.heroDesc || '';
    document.getElementById('edit-hero-img').value = content.heroImg || '';
    document.getElementById('edit-about-text').value = content.aboutText || '';
    document.getElementById('edit-home-doctor-title').value = content.homeDoctorTitle || '';
    document.getElementById('edit-home-doctor-text').value = content.homeDoctorText || '';
    document.getElementById('edit-home-doctor-image').value = content.homeDoctorImage || '';
    document.getElementById('edit-about-page-title').value = content.aboutPageTitle || '';
    document.getElementById('edit-about-page-text').value = content.aboutPageText || '';
    document.getElementById('edit-about-page-image').value = content.aboutPageImage || '';
    document.getElementById('edit-team-page-title').value = content.teamPageTitle || '';
    document.getElementById('edit-team-page-text').value = content.teamPageText || '';
    document.getElementById('edit-team-page-image').value = content.teamPageImage || '';
    document.getElementById('edit-contact-page-title').value = content.contactPageTitle || '';
    document.getElementById('edit-contact-page-text').value = content.contactPageText || '';
    document.getElementById('edit-contact-page-image').value = content.contactPageImage || '';
    document.getElementById('edit-order-page-title').value = content.orderPageTitle || '';
    document.getElementById('edit-order-page-desc').value = content.orderPageDesc || '';
    document.getElementById('edit-order-page-price').value = content.orderPagePrice || '';
    document.getElementById('edit-order-page-note').value = content.orderPageNote || '';
    renderAdminFeedbackQueue();
}

function savePageContent() {
    const content = {
        heroTitle: document.getElementById('edit-hero-title').value,
        heroDesc: document.getElementById('edit-hero-desc').value,
        heroImg: document.getElementById('edit-hero-img').value,
        aboutText: document.getElementById('edit-about-text').value,
        homeDoctorTitle: document.getElementById('edit-home-doctor-title').value,
        homeDoctorText: document.getElementById('edit-home-doctor-text').value,
        homeDoctorImage: document.getElementById('edit-home-doctor-image').value,
        aboutPageTitle: document.getElementById('edit-about-page-title').value,
        aboutPageText: document.getElementById('edit-about-page-text').value,
        aboutPageImage: document.getElementById('edit-about-page-image').value,
        teamPageTitle: document.getElementById('edit-team-page-title').value,
        teamPageText: document.getElementById('edit-team-page-text').value,
        teamPageImage: document.getElementById('edit-team-page-image').value,
        contactPageTitle: document.getElementById('edit-contact-page-title').value,
        contactPageText: document.getElementById('edit-contact-page-text').value,
        contactPageImage: document.getElementById('edit-contact-page-image').value,
        orderPageTitle: document.getElementById('edit-order-page-title').value,
        orderPageDesc: document.getElementById('edit-order-page-desc').value,
        orderPagePrice: document.getElementById('edit-order-page-price').value,
        orderPageNote: document.getElementById('edit-order-page-note').value
    };
    localStorage.setItem('natureline_content', JSON.stringify(content));
    alert('Content saved successfully.');
    window.location.reload();
}

function renderAdminFeedbackQueue() {
    const feedbackList = JSON.parse(localStorage.getItem('natureline_feedback') || '[]');
    const queue = document.getElementById('admin-feedback-queue');
    if (!queue) return;

    if (!feedbackList.length) {
        queue.innerHTML = '<p style="color:#64748b;">No feedback is waiting.</p>';
        return;
    }

    queue.innerHTML = feedbackList.map((item) => `
        <div class="admin-card" style="margin-bottom:0.7rem;">
            <strong>${item.name}</strong>
            <p style="color:#64748b; margin:0.3rem 0;">${item.text}</p>
            <small style="color:#94a3b8;">Status: ${item.status}</small>
        </div>
    `).join('');
}

window.processLogin = processLogin;
window.logoutAdmin = logoutAdmin;
window.savePageContent = savePageContent;
