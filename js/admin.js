// Define your Render backend URL so the admin page knows where to look
const API_BASE_URL = 'https://natureline.onrender.com';

const adminCredentials = { username: 'natureline', password: 'admin2026' };

async function processLogin() {
    const username = document.getElementById('admin-user')?.value.trim() || '';
    const password = document.getElementById('admin-pass')?.value || '';
    const errorBox = document.getElementById('login-error');
    const loginBox = document.getElementById('login-container');
    const dashboard = document.getElementById('dashboard-container');

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();

        if (result.success) {
            if (errorBox) errorBox.style.display = 'none';
            if (loginBox) loginBox.style.display = 'none';
            if (dashboard) dashboard.style.display = 'block';
            await loadAdminContent();
            return;
        }
    } catch (error) {
        // Fallback to local credentials if server is offline
        if (username === adminCredentials.username && password === adminCredentials.password) {
            if (errorBox) errorBox.style.display = 'none';
            if (loginBox) loginBox.style.display = 'none';
            if (dashboard) dashboard.style.display = 'block';
            await loadAdminContent();
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
            const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
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
        const response = await fetch(`${API_BASE_URL}/api/get-content`);
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

    await Promise.all([renderAdminFeedbackQueue(), renderAdminProducts(), renderAdminOrders()]);
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
        const response = await fetch(`${API_BASE_URL}/api/save-content`, {
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
        const response = await fetch(`${API_BASE_URL}/api/get-feedbacks?status=all`);
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
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function reviewFeedback(id, action) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/feedbacks/${encodeURIComponent(id)}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        const result = await response.json();
        if (!result.success) {
            alert(result.message || 'Could not update feedback.');
            return;
        }
        await renderAdminFeedbackQueue();
    } catch (error) {
        alert('Could not review feedback. Is the server running?');
    }
}

async function renderAdminProducts() {
    const container = document.getElementById('admin-product-list');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const result = await response.json();
        const products = result.products || [];
        window.adminProducts = products;

        if (products.length === 0) {
            container.innerHTML = '<p class="text-slate-400 italic">No products in catalog.</p>';
            return;
        }

        container.innerHTML = products.map((product, index) => `
            <section data-product-index="${index}" style="padding:0.75rem;margin-bottom:0.75rem;border:1px solid #e2e8f0;border-radius:12px;background:#fff;">
                ${product.imageUrl ? `<img src="${escapeAdminHtml(product.imageUrl)}" alt="${escapeAdminHtml(product.name)}" style="width:100%;height:150px;object-fit:contain;background:#f8fafc;border-radius:8px;margin-bottom:0.6rem;">` : '<div style="height:90px;display:grid;place-items:center;background:#f8fafc;border-radius:8px;color:#94a3b8;margin-bottom:0.6rem;">No product image</div>'}
                <label style="display:block;margin-bottom:0.45rem;">Name
                    <input data-field="name" type="text" value="${escapeAdminHtml(product.name)}" class="w-full text-xs border p-2 rounded bg-white">
                </label>
                <label style="display:block;margin-bottom:0.45rem;">Description
                    <textarea data-field="description" rows="3" class="w-full text-xs border p-2 rounded bg-white">${escapeAdminHtml(product.description)}</textarea>
                </label>
                <label style="display:block;margin-bottom:0.45rem;">Price (NGN)
                    <input data-field="price" type="number" min="1" value="${Number(product.price) || ''}" class="w-full text-xs border p-2 rounded bg-white">
                </label>
                <label style="display:block;margin-bottom:0.45rem;">Change image
                    <input data-field="image" type="file" accept="image/*" class="w-full text-xs border p-1 rounded bg-white">
                </label>
                ${product.imageUrl ? '<label style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.6rem;"><input data-field="remove-image" type="checkbox"> Remove current image</label>' : ''}
                <div style="display:flex;gap:0.5rem;">
                    <button type="button" data-action="save" data-index="${index}" class="btn-primary" style="flex:1;">Save changes</button>
                    <button type="button" data-action="delete" data-index="${index}" class="btn-secondary" style="color:#b91c1c;">Remove product</button>
                </div>
            </section>
        `).join('');

        container.querySelectorAll('[data-action="save"]').forEach((button) => {
            button.addEventListener('click', () => saveProduct(Number(button.dataset.index)));
        });
        container.querySelectorAll('[data-action="delete"]').forEach((button) => {
            button.addEventListener('click', () => deleteProduct(window.adminProducts[Number(button.dataset.index)].id));
        });
    } catch (error) {
        container.innerHTML = '<p style="color:red;">Could not load products.</p>';
    }
}

async function addNewProduct() {
    const nameInput = document.getElementById('admin-prod-name');
    const descriptionInput = document.getElementById('admin-prod-description');
    const priceInput = document.getElementById('admin-prod-price');
    const imageInput = document.getElementById('admin-prod-image');
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const price = Number(priceInput.value);

    if (!name || !description || !Number.isFinite(price) || price <= 0) {
        alert('Please enter a product name, description, and positive price.');
        return;
    }

    try {
        const imageUrl = imageInput.files[0] ? await uploadProductImage(imageInput.files[0]) : '';
        const response = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, price, imageUrl })
        });
        const result = await response.json();

        if (!result.success) {
            alert(result.message || 'Failed to add product.');
            return;
        }

        nameInput.value = '';
        descriptionInput.value = '';
        priceInput.value = '';
        imageInput.value = '';
        await renderAdminProducts();
    } catch (error) {
        alert(error.message || 'Could not add product. Is the server running?');
    }
}

async function uploadProductImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_BASE_URL}/api/upload-image`, { method: 'POST', body: formData });
    const result = await response.json();
    if (!response.ok || !result.success || !result.url) {
        throw new Error(result.message || 'Could not upload the product image.');
    }
    return result.url;
}

async function saveProduct(index) {
    const product = window.adminProducts?.[index];
    const row = document.querySelector(`[data-product-index="${index}"]`);
    if (!product || !row) return;

    const name = row.querySelector('[data-field="name"]').value.trim();
    const description = row.querySelector('[data-field="description"]').value.trim();
    const price = Number(row.querySelector('[data-field="price"]').value);
    const imageFile = row.querySelector('[data-field="image"]').files[0];
    const removeImage = row.querySelector('[data-field="remove-image"]')?.checked || false;

    if (!name || !description || !Number.isFinite(price) || price <= 0) {
        alert('Please enter a product name, description, and positive price.');
        return;
    }

    try {
        let imageUrl = product.imageUrl || '';
        if (imageFile) {
            imageUrl = await uploadProductImage(imageFile);
        } else if (removeImage) {
            imageUrl = '';
        }
        const response = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(product.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, price, imageUrl })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            alert(result.message || 'Failed to update product.');
            return;
        }
        await renderAdminProducts();
    } catch (error) {
        alert(error.message || 'Could not update product. Is the server running?');
    }
}

async function deleteProduct(id) {
    if (!confirm('Delete this product from the catalog?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
        const result = await response.json();

        if (!result.success) {
            alert(result.message || 'Failed to delete product.');
            return;
        }

        await renderAdminProducts();
    } catch (error) {
        alert('Could not delete product. Is the server running?');
    }
}

async function renderAdminOrders() {
    const container = document.getElementById('admin-orders-list');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`);
        const result = await response.json();
        const orders = result.orders || [];

        if (orders.length === 0) {
            container.innerHTML = '<p style="color:#64748b;">No orders yet.</p>';
            return;
        }

        container.innerHTML = orders.map((order) => {
            const status = (order.paymentStatus || order.status || 'pending').toLowerCase();
            const isCompleted = status === 'completed' || status === 'paid';
            const statusColor = isCompleted ? '#0D7A39' : '#b45309';
            // Fallback to order.id if reference is missing
            const referenceKey = order.reference || order.id;

            return `
            <div style="padding:0.85rem;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:0.75rem;background:#fff;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong style="color:#1e293b;">${escapeAdminHtml(order.customerName || 'Customer')}</strong>
                    <span style="font-size:0.75rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:12px;background:${isCompleted ? '#d1fae5' : '#fef3c7'};color:${statusColor};text-transform:uppercase;">
                        ${isCompleted ? 'Completed' : 'Pending'}
                    </span>
                </div>
                <p style="margin:0.35rem 0;color:#475569;font-size:0.9rem;">
                    ${escapeAdminHtml(order.productName || 'Treatment')} — <strong style="color:#0D7A39;">₦${Number(order.amount || 0).toLocaleString()}</strong>
                </p>
                <p style="margin:0;font-size:0.78rem;color:#94a3b8;">${escapeAdminHtml(order.email || '')} · Ref: ${escapeAdminHtml(referenceKey)}</p>
                
                ${!isCompleted ? `
                    <button onclick="markOrderCompleted('${escapeAdminHtml(referenceKey)}')" style="margin-top:0.6rem;background:#0D7A39;color:white;border:none;padding:0.35rem 0.7rem;border-radius:4px;font-size:0.75rem;font-weight:600;cursor:pointer;">
                        Mark as Completed (Cash/Manual)
                    </button>
                ` : '<div style="margin-top:0.4rem;font-size:0.75rem;color:#0D7A39;font-weight:600;">✓ Payment Verified / Completed</div>'}
            </div>`;
        }).join('');
    } catch (error) {
        container.innerHTML = '<p style="color:red;">Could not load orders.</p>';
    }
}

// Function for admin to manually change order status (e.g. for cash payments)
async function markOrderCompleted(reference) {
    if (!reference) return;

    if (!confirm("Are you sure you want to mark this order as completed?")) return;

    try {
        const endpoint = `${API_BASE_URL}/api/orders/${encodeURIComponent(reference)}/status`;
        const responseObj = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
        });
        const result = await responseObj.json();

        if (result.success) {
            await renderAdminOrders();
        } else {
            alert(result.message || 'Failed to update order status.');
        }
    } catch (error) {
        alert('Could not update order status. Is the server running?');
    }
}

window.processLogin = processLogin;
window.logoutAdmin = logoutAdmin;
window.savePageContent = savePageContent;
window.addNewProduct = addNewProduct;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.reviewFeedback = reviewFeedback;
window.markOrderCompleted = markOrderCompleted;