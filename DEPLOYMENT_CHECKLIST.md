# Deployment checklist for Natureline

## What you will need to create later

- A **Firebase project** with a Firestore database
- A **Firebase service account** and its JSON credentials
- A **Paystack account** with a live secret key
- A **Cloudinary account** with upload credentials
- A **public domain or hosting URL** for the app callback page
- A strong **admin username/password** for the CMS

## Values to paste into `.env`

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_CALLBACK_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Recommended order

1. Create Firebase and enable Firestore.
2. Create Paystack and get the secret/public keys.
3. Create Cloudinary and get upload credentials.
4. Copy `.env.example` to `.env` and fill in the values.
5. Run the app locally with `npm start`.
6. Test the homepage, admin panel, product catalog, feedback, and checkout.
7. Deploy to your host.
8. Update the Paystack callback URL to your live domain.

## Notes

- The backend now starts even if credentials are missing, but Firebase/Paystack features will return clear setup messages until configured.
- The public order page loads products from the backend Firestore catalog.
- The feedback system uses the backend review queue, not only local storage.
