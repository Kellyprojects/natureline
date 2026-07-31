/**
 * Natureline Healthcare Services - Secure Backend Server Architecture
 */
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const admin = require('firebase-admin'); // Added Firebase SDK
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

const PORT = process.env.PORT || 5000;
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL || 'https://natureline-healthcare.com/verify-payment';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
const firebaseConfigured = Boolean(FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY);
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;
const emailConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && ADMIN_NOTIFY_EMAIL);

const upload = multer({ storage: multer.memoryStorage() });

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

function normalizeDoc(doc) {
    return { id: doc.id, ...doc.data() };
}

const mailTransporter = emailConfigured
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        }
    })
    : null;

async function notifyAdmin(subject, lines = []) {
    if (!mailTransporter) {
        return false;
    }

    const textBody = lines.filter(Boolean).join('\n');

    try {
        await mailTransporter.sendMail({
            from: `Natureline Alerts <${SMTP_USER}>`,
            to: ADMIN_NOTIFY_EMAIL,
            subject,
            text: textBody,
        });
        return true;
    } catch (mailError) {
        console.error('Email notification failed:', mailError.message);
        return false;
    }
}

async function uploadBufferToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'natureline' },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }
        );

        stream.end(buffer);
    });
}

// -------------------------------------------------------------
// FIREBASE FIRESTORE INITIALIZATION (Embedded Here)
// -------------------------------------------------------------
let db = null;

try {
    if (firebaseConfigured) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: FIREBASE_PROJECT_ID,
                clientEmail: FIREBASE_CLIENT_EMAIL,
                privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Formats key text line breaks cleanly
            })
        });
        db = admin.firestore(); // Creates your database connection variable
        console.log("Firebase Database engine initialized successfully.");
    } else {
        console.warn('Firebase is not configured yet. Database endpoints will return 503 until credentials are added.');
    }
} catch (fbError) {
    console.error("Firebase Initialization Error:", fbError.message);
}

if (!emailConfigured) {
    console.warn('Email alerts are not configured yet. Order/feedback notifications will be skipped until SMTP values are complete.');
}

function requireDatabase(res) {
    if (!db) {
        res.status(503).json({
            success: false,
            message: 'Firebase is not configured yet. Add the Firebase environment variables to enable this feature.'
        });
        return false;
    }

    return true;
}

// -------------------------------------------------------------
// STATIC WEBSITE PAGES ROUTING
// -------------------------------------------------------------

// Admin route (before static middleware)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'order.html'));
});

app.get('/favicon.ico', (req, res) => {
    res.type('image/jpeg');
    res.sendFile(path.join(__dirname, 'images', 'images', 'logo.jpeg'));
});

app.get('/verify-payment', (req, res) => {
    res.status(200).send(`
        <html>
            <head><title>Payment verification</title></head>
            <body style="font-family:system-ui;padding:2rem;max-width:720px;margin:0 auto;">
                <h1>Payment received</h1>
                <p>Thanks for your order. Your payment was initiated successfully and our team will confirm it shortly.</p>
                <p><a href="/order">Return to the order page</a></p>
            </body>
        </html>
    `);
});

// Serve static files
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// -------------------------------------------------------------
// DATABASE & PAYMENT API ENDPOINTS
// -------------------------------------------------------------

// 1. Endpoint to Save Website Layout/Text Edits to Firebase
app.post('/api/save-content', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const webpageData = req.body;
        // Saves layout details under a document named 'natureline_content' inside a 'website' collection
        await db.collection('website').doc('natureline_content').set(webpageData, { merge: true });
        return res.status(200).json({ success: true, message: 'Content saved to database successfully!' });
    } catch (error) {
        console.error('Firebase Save Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to write content to database.' });
    }
});

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file was uploaded.' });
        }

        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return res.status(400).json({ success: false, message: 'Cloudinary is not configured.' });
        }

        const result = await uploadBufferToCloudinary(req.file.buffer);
        return res.status(200).json({ success: true, url: result.secure_url });
    } catch (error) {
        console.error('Cloudinary upload error:', error.message);
        return res.status(500).json({ success: false, message: 'Could not upload the image.' });
    }
});

// 2. Endpoint to Fetch Website Layout Data
app.get('/api/get-content', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const doc = await db.collection('website').doc('natureline_content').get();
        if (!doc.exists) {
            return res.status(200).json({}); // Return empty layout if database is brand new
        }
        return res.status(200).json(doc.data());
    } catch (error) {
        console.error('Firebase Fetch Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to read content from database.' });
    }
});

// 3. Endpoint to Save Customer Feedback Form Submissions
app.post('/api/submit-feedback', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const { name, email, rating, message, productExperience, companyExperience, imageUrl } = req.body;

        if (!name || !message) {
            return res.status(400).json({ success: false, message: 'Customer name and feedback message are required.' });
        }

        // Saves individual customer reviews into a collection called 'feedbacks' with a timestamp
        const docRef = await db.collection('feedbacks').add({
            name,
            email: email || 'Anonymous',
            rating: rating || 5,
            message,
            productExperience: productExperience || '',
            companyExperience: companyExperience || '',
            imageUrl: imageUrl || '',
            status: 'pending',
            submittedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        notifyAdmin('New feedback submitted on Natureline', [
            `Feedback ID: ${docRef.id}`,
            `Name: ${name}`,
            `Email: ${email || 'Anonymous'}`,
            `Message: ${message}`,
            `Product Experience: ${productExperience || 'N/A'}`,
            `Company Experience: ${companyExperience || 'N/A'}`
        ]).catch(() => {});

        return res.status(200).json({ success: true, message: 'Feedback stored successfully!', id: docRef.id });
    } catch (error) {
        console.error('Feedback Save Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to save customer review.' });
    }
});

app.get('/api/get-feedbacks', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const status = String(req.query.status || 'all').toLowerCase();
        const snapshot = await db.collection('feedbacks').orderBy('submittedAt', 'desc').get();
        let feedbacks = snapshot.docs.map(normalizeDoc);

        if (status !== 'all') {
            feedbacks = feedbacks.filter((item) => String(item.status || 'pending').toLowerCase() === status);
        }

        return res.status(200).json({ success: true, feedbacks });
    } catch (error) {
        console.error('Feedback fetch error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch feedback.' });
    }
});

app.post('/api/feedbacks/:id/review', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const { id } = req.params;
        const { action } = req.body;
        const status = action === 'approve' ? 'approved' : action === 'deny' ? 'denied' : null;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Invalid review action.' });
        }

        await db.collection('feedbacks').doc(id).set({ status }, { merge: true });
        return res.status(200).json({ success: true, message: `Feedback ${status}.` });
    } catch (error) {
        console.error('Feedback review error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to update feedback status.' });
    }
});

app.get('/api/products', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const snapshot = await db.collection('products').orderBy('createdAt', 'asc').get();
        const products = snapshot.docs.map(normalizeDoc);
        return res.status(200).json({ success: true, products });
    } catch (error) {
        console.error('Product fetch error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
    }
});

app.post('/api/products', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const { name, price } = req.body;
        if (!name || !Number.isFinite(Number(price)) || Number(price) <= 0) {
            return res.status(400).json({ success: false, message: 'A valid product name and price are required.' });
        }

        const docRef = await db.collection('products').add({
            name: String(name).trim(),
            price: Number(price),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(200).json({ success: true, id: docRef.id });
    } catch (error) {
        console.error('Product create error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to add product.' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        await db.collection('products').doc(req.params.id).delete();
        return res.status(200).json({ success: true, message: 'Product deleted.' });
    } catch (error) {
        console.error('Product delete error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to delete product.' });
    }
});

app.get('/api/orders', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const snapshot = await db.collection('orders').orderBy('orderDate', 'desc').get();
        const orders = snapshot.docs.map(normalizeDoc);
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Order fetch error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
});

// 4. Secure Endpoint to Initialize Paystack Transaction & Track the Order in Firebase
app.post('/api/initialize-payment', async (req, res) => {
    if (!requireDatabase(res)) return;

    if (!PAYSTACK_SECRET) {
        return res.status(503).json({
            success: false,
            message: 'Paystack is not configured yet. Add PAYSTACK_SECRET_KEY to enable checkout.'
        });
    }

    const { email, customerName, phoneNumber, deliveryAddress, amount, productName } = req.body;
    const fixedAmountNaira = Number(amount) > 0 ? Number(amount) : 35000;

    if (!email || !customerName || !deliveryAddress) {
        return res.status(400).json({ success: false, message: 'Customer parameters (email, name, deliveryAddress) are mandatory.' });
    }

    try {
        // Send payment initialization to Paystack
        const paystackResponse = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: fixedAmountNaira * 100, // Converted to Kobo
                callback_url: PAYSTACK_CALLBACK_URL
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract transaction reference code generated by Paystack
        const reference = paystackResponse.data.data.reference;

        // Log the structural order details into an 'orders' collection matching Paystack's reference
        await db.collection('orders').doc(reference).set({
            customerName,
            email,
            phoneNumber: phoneNumber || 'N/A',
            deliveryAddress,
            productName: productName || 'Consultation & treatment package',
            amount: fixedAmountNaira,
            paymentStatus: 'pending', // Keeps status as pending until verified
            orderDate: admin.firestore.FieldValue.serverTimestamp()
        });

        notifyAdmin('New order initialized on Natureline', [
            `Reference: ${reference}`,
            `Customer: ${customerName}`,
            `Email: ${email}`,
            `Phone: ${phoneNumber || 'N/A'}`,
            `Product: ${productName || 'Consultation & treatment package'}`,
            `Amount (NGN): ${fixedAmountNaira}`,
            `Delivery Address: ${deliveryAddress}`,
            'Payment Status: pending'
        ]).catch(() => {});

        return res.status(200).json(paystackResponse.data);
    } catch (error) {
        console.error('Paystack/Firebase Order Error Log:', error.response ? error.response.data : error.message);
        return res.status(500).json({ success: false, message: 'Internal payment or database infrastructure fault.' });
    }
});

// Start listening safely
app.listen(PORT, () => {
    console.log(`Natureline Medical Secure Engine running optimally on port ${PORT}`);
});

// Endpoint to verify Admin login securely via .env configurations
app.post('/api/admin-login', (req, res) => {
    const { username, password } = req.body;
    
    const correctUsername = process.env.ADMIN_USERNAME || 'natureline';
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin2026';

    if (username === correctUsername && password === correctPassword) {
        return res.status(200).json({ success: true, message: "Authenticated successfully." });
    } else {
        return res.status(401).json({ success: false, message: "Invalid admin parameters." });
    }
});
