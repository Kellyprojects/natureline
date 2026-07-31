const adminCredentials = { username: 'natureline', password: 'admin2026' };

async function processLogin() {
    const username = document.getElementById('admin-user')?.value.trim() || '';
    const password = document.getElementById('admin-pass')?.value || '';
    const errorBox = document.getElementById('login-error');
    const loginBox = document.getElementById('login-container');
    const dashboard = document.getElementById('dashboard-container');

    try {
        const response = await fetch('/api/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();

        if (result.success) {
            if (errorBox) errorBox.style.display = 'none';
            if (loginBox) loginBox.style.display = 'none';
            if (dashboard) dashboard.style.display = 'block';
            loadAdminContent();
            return;
        }
    } catch (error) {
        // Fallback to local credentials if server is offline
        if (username === adminCredentials.username && password === adminCredentials.password) {
            if (errorBox) errorBox.style.display = 'none';
            if (loginBox) loginBox.style.display = 'none';
            if (dashboard) dashboard.style.display = 'block';
            loadAdminContent();
            return;
        }
    }

    if (errorBox) errorBox.style.display = 'block';
}

function logoutAdmin() {
    const loginBox = document.getElementById('login-container');
    const dashboard = document.getElementById('dashboard-container');
    if (loginBox) loginBox.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
}

async function uploadToCloudinary(elementId, currentUrlValue) {
    const fileInput = document.getElementById(elementId);

    if (fileInput && fileInput.type === 'file' && fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);

        try {
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                return result.url;
            }
            console.error('Cloudinary failed:', result.message);
            return currentUrlValue;
        } catch (err) {
            console.error('Error communicating with Cloudinary endpoint:', err);
            return currentUrlValue;
        }
    }

    return currentUrlValue || (fileInput ? fileInput.value : '');
}

async function loadAdminContent() {
    try {
        const response = await fetch('/api/get-content');
        const content = await response.json();

        document.getElementById('edit-hero-title').value = content.heroTitle || '';
        document.getElementById('edit-hero-desc').value = content.heroDesc || '';
        document.getElementById('edit-about-text').value = content.aboutText || '';
        document.getElementById('edit-home-doctor-title').value = content.homeDoctorTitle || '';
        document.getElementById('edit-home-doctor-text').value = content.homeDoctorText || '';
        document.getElementById('edit-about-page-title').value = content.aboutPageTitle || '';
        document.getElementById('edit-about-page-text').value = content.aboutPageText || '';
        document.getElementById('edit-team-page-title').value = content.teamPageTitle || '';
        document.getElementById('edit-team-page-text').value = content.teamPageText || '';
        document.getElementById('edit-contact-page-title').value = content.contactPageTitle || '';
        document.getElementById('edit-contact-page-text').value = content.contactPageText || '';
        document.getElementById('edit-order-page-title').value = content.orderPageTitle || '';
        document.getElementById('edit-order-page-desc').value = content.orderPageDesc || '';
        document.getElementById('edit-order-page-price').value = content.orderPagePrice || '';
        document.getElementById('edit-order-page-note').value = content.orderPageNote || '';

        window.currentImages = {
            heroImg: content.heroImg || '',
            homeDoctorImage: content.homeDoctorImage || '',
            aboutPageImage: content.aboutPageImage || '',
            teamPageImage: content.teamPageImage || '',
            contactPageImage: content.contactPageImage || ''
        };
    } catch (error) {
        console.error('Could not fetch page layout from Firebase:', error);
    }

    renderAdminFeedbackQueue();
    renderAdminProducts();
    renderAdminOrders();
}

async function savePageContent() {
    const heroImgUrl = await uploadToCloudinary('edit-hero-img', window.currentImages?.heroImg);
    const doctorImgUrl = await uploadToCloudinary('edit-home-doctor-image', window.currentImages?.homeDoctorImage);
    const aboutImgUrl = await uploadToCloudinary('edit-about-page-image', window.currentImages?.aboutPageImage);
    const teamImgUrl = await uploadToCloudinary('edit-team-page-image', window.currentImages?.teamPageImage);
    const contactImgUrl = await uploadToCloudinary('edit-contact-page-image', window.currentImages?.contactPageImage);

    const content = {
        heroTitle: document.getElementById('edit-hero-title').value,
        heroDesc: document.getElementById('edit-hero-desc').value,
        heroImg: heroImgUrl,
        aboutText: document.getElementById('edit-about-text').value,
        homeDoctorTitle: document.getElementById('edit-home-doctor-title').value,
        homeDoctorText: document.getElementById('edit-home-doctor-text').value,
        homeDoctorImage: doctorImgUrl,
        aboutPageTitle: document.getElementById('edit-about-page-title').value,
        aboutPageText: document.getElementById('edit-about-page-text').value,
        aboutPageImage: aboutImgUrl,
        teamPageTitle: document.getElementById('edit-team-page-title').value,
        teamPageText: document.getElementById('edit-team-page-text').value,
        teamPageImage: teamImgUrl,
        contactPageTitle: document.getElementById('edit-contact-page-title').value,
        contactPageText: document.getElementById('edit-contact-page-text').value,
        contactPageImage: contactImgUrl,
        orderPageTitle: document.getElementById('edit-order-page-title').value,
        orderPageDesc: document.getElementById('edit-order-page-desc').value,
        orderPagePrice: document.getElementById('edit-order-page-price').value,
        orderPageNote: document.getElementById('edit-order-page-note').value
    };

    try {
        const response = await fetch('/api/save-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content)
        });
        const result = await response.json();

        if (result.success) {
            alert('Content synchronized to Firebase and Cloudinary successfully.');
            window.location.reload();
        } else {
            alert('Error updating database: ' + result.message);
        }
    } catch (error) {
        console.error('Server sync error:', error);
        alert('Could not synchronize updates with your server.');
    }
}

async function renderAdminFeedbackQueue() {
    const queue = document.getElementById('admin-feedback-queue');
    if (!queue) return;

    try {
        const response = await fetch('/api/get-feedbacks?status=all');
        const result = await response.json();
        const feedbacks = result.feedbacks || [];

        if (feedbacks.length === 0) {
            queue.innerHTML = '<p style="color:#64748b;">No customer feedback yet.</p>';
            return;
        }

        queue.innerHTML = feedbacks.map((item) => {
            const status = item.status || 'pending';
            const statusColor = status === 'approved' ? '#0D7A39' : status === 'denied' ? '#b91c1c' : '#b45309';
            return `
            <div style="padding:0.75rem;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:0.75rem;">
                <div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:center;">
                    <strong>${escapeAdminHtml(item.name || 'Client')}</strong>
                    <span style="font-size:0.78rem;font-weight:700;color:${statusColor};text-transform:uppercase;">${status}</span>
                </div>
                <p style="margin:0.35rem 0 0;color:#475569;">${escapeAdminHtml(item.message || '')}</p>
                ${item.productExperience ? `<p style="margin:0.25rem 0 0;font-size:0.85rem;"><em>Product:</em> ${escapeAdminHtml(item.productExperience)}</p>` : ''}
                ${item.companyExperience ? `<p style="margin:0.25rem 0 0;font-size:0.85rem;"><em>Company:</em> ${escapeAdminHtml(item.companyExperience)}</p>` : ''}
                ${item.imageUrl ? `<img src="${escapeAdminHtml(item.imageUrl)}" alt="Result" style="margin-top:0.5rem;width:100%;max-height:180px;object-fit:cover;border-radius:10px;">` : ''}
                ${status === 'pending' ? `
                    <div style="display:flex;gap:0.5rem;margin-top:0.65rem;">
                        <button onclick="reviewFeedback('${item.id}', 'approve')" class="btn-primary" style="flex:1;">Approve</button>
                        <button onclick="reviewFeedback('${item.id}', 'deny')" class="btn-secondary" style="flex:1;">Deny</button>
                    </div>
                ` : ''}
            </div>`;
        }).join('');
    } catch (e) {
        queue.innerHTML = '<p style="color:red;">Error fetching reviews.</p>';
    }
}

function escapeAdminHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function reviewFeedback(id, action) {
    try {
        const response = await fetch(`/api/feedbacks/${encodeURIComponent(id)}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        const result = await response.json();
        if (!result.success) {
            alert(result.message || 'Could not update feedback.');
            return;
        }
        renderAdminFeedbackQueue();
    } catch (error) {
        alert('Could not review feedback. Is the server running?');
    }
}

async function renderAdminProducts() {
    const container = document.getElementById('admin-product-list');
    if (!container) return;

    try {
        const response = await fetch('/api/products');
        const result = await response.json();
        const products = result.products || [];

        if (products.length === 0) {
            container.innerHTML = '<p class="text-slate-400 italic">No products in catalog.</p>';
            return;
        }

        container.innerHTML = products.map((product) => `
            <div class="flex justify-between items-center p-2 bg-slate-50 border rounded-lg" style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;margin-bottom:0.4rem;border:1px solid #e2e8f0;border-radius:10px;">
                <div>
                    <p style="font-weight:700;margin:0;">${product.name}</p>
                    <p style="color:#64748b;margin:0.2rem 0 0;">₦${Number(product.price).toLocaleString()}</p>
                </div>
                <button onclick="deleteProduct('${product.id}')" style="color:#dc2626;font-weight:700;border:0;background:transparent;cursor:pointer;">
                    Delete
                </button>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p style="color:red;">Could not load products.</p>';
    }
}

async function addNewProduct() {
    const nameInput = document.getElementById('admin-prod-name');
    const priceInput = document.getElementById('admin-prod-price');
    const name = nameInput.value.trim();
    const price = Number(priceInput.value);

    if (!name || Number.isNaN(price) || price <= 0) {
        alert('Please fill out a valid product name and positive price.');
        return;
    }

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price })
        });
        const result = await response.json();

        if (!result.success) {
            alert(result.message || 'Failed to add product.');
            return;
        }

        nameInput.value = '';
        priceInput.value = '';
        renderAdminProducts();
    } catch (error) {
        alert('Could not add product. Is the server running?');
    }
}

async function deleteProduct(id) {
    if (!confirm('Delete this product from the catalog?')) return;

    try {
        const response = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
        const result = await response.json();

        if (!result.success) {
            alert(result.message || 'Failed to delete product.');
            return;
        }

        renderAdminProducts();
    } catch (error) {
        alert('Could not delete product. Is the server running?');
    }
}

async function renderAdminOrders() {
    const container = document.getElementById('admin-orders-list');
    if (!container) return;

    try {
        const response = await fetch('/api/orders');
        const result = await response.json();
        const orders = result.orders || [];

        if (orders.length === 0) {
            container.innerHTML = '<p style="color:#64748b;">No orders yet.</p>';
            return;
        }

        container.innerHTML = orders.map((order) => `
            <div style="padding:0.75rem;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:0.5rem;">
                <strong>${order.customerName || 'Customer'}</strong>
                <span style="float:right;font-size:0.85rem;color:${order.paymentStatus === 'paid' ? '#0D7A39' : '#b45309'};">
                    ${order.paymentStatus || 'pending'}
                </span>
                <p style="margin:0.35rem 0 0;color:#475569;">
                    ${order.productName || 'Treatment'} — ₦${Number(order.amount || 0).toLocaleString()}
                </p>
                <p style="margin:0.2rem 0 0;font-size:0.8rem;color:#94a3b8;">${order.email || ''} · ${order.reference || order.id || ''}</p>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p style="color:red;">Could not load orders.</p>';
    }
}

window.processLogin = processLogin;
window.logoutAdmin = logoutAdmin;
window.savePageContent = savePageContent;
window.addNewProduct = addNewProduct;
window.deleteProduct = deleteProduct;
window.reviewFeedback = reviewFeedback;
