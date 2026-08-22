/* Natureline Healthcare Services - Secure Backend Server Architecture */
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Declared ONLY ONCE here
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const admin = require('firebase-admin'); // Added Firebase SDK
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// List all origins allowed to send requests to your backend
const allowedOrigins = [
    'https://naturelinehealthcare.com',
    'https://www.naturelinehealthcare.com',
    'https://kellyprojects.github.io',
    'https://natureline.onrender.com',
    'http://localhost:5000',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy error: Origin not allowed'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

// Handle preflight requests for all routes
app.options(/(.*)/, cors());

const PORT = process.env.PORT || 5000;
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL || 'https://natureline.onrender.com/verify-payment';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
const firebaseConfigured = Boolean(FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY);
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'williamsadetunji63@gmail.com';
const emailConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);

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
        console.warn('Mail transporter not configured, email notification skipped.');
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
// FIREBASE FIRESTORE INITIALIZATION
// -------------------------------------------------------------
let db = null;

try {
    if (firebaseConfigured) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: FIREBASE_PROJECT_ID,
                clientEmail: FIREBASE_CLIENT_EMAIL,
                privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
        db = admin.firestore();
        console.log("Firebase Database engine initialized successfully.");
    } else {
        console.warn('Firebase is not configured yet.');
    }
} catch (fbError) {
    console.error("Firebase Initialization Error:", fbError.message);
}

function requireDatabase(res) {
    if (!db) {
        res.status(503).json({
            success: false,
            message: 'Firebase is not configured yet.'
        });
        return false;
    }
    return true;
}

// -------------------------------------------------------------
// STATIC WEBSITE PAGES ROUTING
// -------------------------------------------------------------

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

// Paystack Callback & Verification Route
app.get('/verify-payment', async (req, res) => {
    const reference = req.query.reference;
    
    if (!reference || !db) {
        return res.status(200).send(`
            <html>
                <head><title>Payment verification</title></head>
                <body style="font-family:system-ui;padding:2rem;max-width:720px;margin:0 auto;">
                    <h1>Payment reference missing</h1>
                    <p>Could not verify transaction parameters.</p>
                    <p><a href="/order">Return to the order page</a></p>
                </body>
            </html>
        `);
    }

    try {
        // Verify transaction with Paystack API
        const verificationResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`
            }
        });

        const paymentData = verificationResponse.data;

        if (paymentData && paymentData.status && paymentData.data.status === 'success') {
            const txDetails = paymentData.data;
            const amountPaidNaira = txDetails.amount / 100;

            // Update order status to 'completed' in Firebase
            const orderRef = db.collection('orders').doc(reference);
            const orderDoc = await orderRef.get();

            let customerName = 'Customer';
            let productName = 'Selected Eldora product';
            let customerEmail = txDetails.customer.email;

            if (orderDoc.exists) {
                const orderData = orderDoc.data();
                customerName = orderData.customerName || customerName;
                productName = orderData.productName || productName;
                customerEmail = orderData.email || customerEmail;

                await orderRef.set({
                    paymentStatus: 'completed',
                    status: 'completed'
                }, { merge: true });
            }

            // Send Email Notification to williamsadetunji63@gmail.com
            await notifyAdmin(`New Paid Order Completed - Ref: ${reference}`, [
                `--- NEW PAYSTACK PAYMENT CONFIRMED ---`,
                `Order Number / Reference: ${reference}`,
                `Customer Name: ${customerName}`,
                `Customer Email: ${customerEmail}`,
                `Drugs and Quantity: ${productName}`,
                `Price Paid: ₦${amountPaidNaira.toLocaleString()}`,
                `Payment Status: COMPLETED (Paid via Paystack)`
            ]);

            return res.status(200).send(`
                <html>
                    <head><title>Payment Successful</title></head>
                    <body style="font-family:system-ui;padding:2rem;max-width:720px;margin:0 auto;text-align:center;">
                        <h1 style="color:#0D7A39;">Payment Successful & Verified!</h1>
                        <p>Thank you, ${customerName}. Your payment of ₦${amountPaidNaira.toLocaleString()} has been confirmed automatically via Paystack.</p>
                        <p>An email notification has been sent to the store administrator.</p>
                        <p><a href="/order" style="background:#0D7A39;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;margin-top:1rem;">Return to Store</a></p>
                    </body>
                </html>
            `);
        }
    } catch (err) {
        console.error('Payment verification fault:', err.message);
    }

    return res.status(200).send(`
        <html>
            <head><title>Payment verification pending</title></head>
            <body style="font-family:system-ui;padding:2rem;max-width:720px;margin:0 auto;">
                <h1>Payment verification pending</h1>
                <p>We received your request, but verification is still processing or pending confirmation.</p>
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

app.post('/api/save-content', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const webpageData = req.body;
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
        const result = await uploadBufferToCloudinary(req.file.buffer);
        return res.status(200).json({ success: true, url: result.secure_url });
    } catch (error) {
        console.error('Cloudinary upload error:', error.message);
        return res.status(500).json({ success: false, message: 'Could not upload the image.' });
    }
});

app.get('/api/get-content', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const doc = await db.collection('website').doc('natureline_content').get();
        if (!doc.exists) {
            return res.status(200).json({});
        }
        return res.status(200).json(doc.data());
    } catch (error) {
        console.error('Firebase Fetch Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to read content.' });
    }
});

app.post('/api/submit-feedback', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const { name, email, rating, message, productExperience, companyExperience, imageUrl } = req.body;
        if (!name || !message) {
            return res.status(400).json({ success: false, message: 'Name and message required.' });
        }

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
            `Message: ${message}`
        ]).catch(() => {});

        return res.status(200).json({ success: true, id: docRef.id });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to save review.' });
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
            return res.status(400).json({ success: false, message: 'Invalid action.' });
        }

        await db.collection('feedbacks').doc(id).set({ status }, { merge: true });
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update review status.' });
    }
});

app.get('/api/products', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const snapshot = await db.collection('products').orderBy('createdAt', 'asc').get();
        const products = snapshot.docs.map(normalizeDoc);
        return res.status(200).json({ success: true, products });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
    }
});

app.post('/api/products', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const { name, price } = req.body;
        if (!name || Number(price) <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid product details.' });
        }

        const docRef = await db.collection('products').add({
            name: String(name).trim(),
            price: Number(price),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(200).json({ success: true, id: docRef.id });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to add product.' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        await db.collection('products').doc(req.params.id).delete();
        return res.status(200).json({ success: true });
    } catch (error) {
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
        return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
});

// Endpoint for Admin to manually change order status (e.g. cash payments)
app.post('/api/orders/:reference/status', async (req, res) => {
    if (!requireDatabase(res)) return;

    try {
        const { reference } = req.params;
        const { status } = req.body; // expected 'completed' or 'pending'

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required.' });
        }

        await db.collection('orders').doc(reference).set({
            paymentStatus: status,
            status: status
        }, { merge: true });

        return res.status(200).json({ success: true, message: 'Order status updated successfully.' });
    } catch (error) {
        console.error('Update order status error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
});

// Initialize Paystack Transaction & Track Order in Firebase
app.post('/api/initialize-payment', async (req, res) => {
    if (!requireDatabase(res)) return;

    if (!PAYSTACK_SECRET) {
        return res.status(503).json({
            success: false,
            message: 'Paystack secret key is not configured.'
        });
    }

    const { email, customerName, phoneNumber, deliveryAddress, amount, productName } = req.body;
    const fixedAmountNaira = Number(amount) > 0 ? Number(amount) : 35000;

    if (!email || !customerName || !deliveryAddress) {
        return res.status(400).json({ success: false, message: 'Customer details are mandatory.' });
    }

    try {
        const paystackResponse = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: fixedAmountNaira * 100, // Kobo conversion
                callback_url: PAYSTACK_CALLBACK_URL
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const reference = paystackResponse.data.data.reference;

        // Save order as pending initially
        await db.collection('orders').doc(reference).set({
            customerName,
            email,
            phoneNumber: phoneNumber || 'N/A',
            deliveryAddress,
            productName: productName || 'Selected Eldora product',
            amount: fixedAmountNaira,
            paymentStatus: 'pending',
            status: 'pending',
            orderDate: admin.firestore.FieldValue.serverTimestamp()
        });

        // Send notification email to williamsadetunji63@gmail.com upon order creation
        notifyAdmin(`New Order Initialized - Ref: ${reference}`, [
            `--- NEW ORDER PLACED ---`,
            `Order Number / Reference: ${reference}`,
            `Customer Name: ${customerName}`,
            `Customer Email: ${email}`,
            `Phone Number: ${phoneNumber || 'N/A'}`,
            `Drugs and Quantity: ${productName || 'Selected Eldora product'}`,
            `Price Paid / Total: ₦${fixedAmountNaira.toLocaleString()}`,
            `Delivery Address: ${deliveryAddress}`,
            `Payment Status: PENDING (Waiting for online or cash confirmation)`
        ]).catch(() => {});

        return res.status(200).json(paystackResponse.data);
    } catch (error) {
        console.error('Paystack/Firebase Order Error:', error.response ? error.response.data : error.message);
        return res.status(500).json({ success: false, message: 'Payment initialization error.' });
    }
});

// Admin login endpoint
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

app.listen(PORT, () => {
    console.log(`Natureline Medical Secure Engine running optimally on port ${PORT}`);
});