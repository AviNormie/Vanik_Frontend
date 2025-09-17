# Firebase Setup Guide for Agro Support App

This guide will help you set up Firebase Authentication with Phone OTP for the Agro Support React Native application.

## Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `agro-support` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Add Web App to Firebase Project

1. In your Firebase project dashboard, click the web icon (`</>`)
2. Register your app with nickname: `agro-support-web`
3. **Important**: Check "Also set up Firebase Hosting" if you plan to deploy
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need this in Step 4)

## Step 3: Enable Authentication

1. In the Firebase console, go to **Authentication** > **Sign-in method**
2. Click on **Phone** provider
3. Enable the **Phone** sign-in method
4. Click **Save**

### Configure Phone Authentication Settings

1. In **Authentication** > **Settings** > **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (if deploying)

## Step 4: Configure Your App

1. Open `/config/firebase.ts` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
  measurementId: "your-measurement-id" // Optional
};
```

## Step 5: Test Phone Authentication

### For Development Testing

1. In Firebase Console, go to **Authentication** > **Sign-in method** > **Phone**
2. Scroll down to **Phone numbers for testing**
3. Add test phone numbers with verification codes:
   - Phone: `+1 650-555-3434`, Code: `123456`
   - Phone: `+91 98765 43210`, Code: `654321`

### For Production Testing

1. Use real phone numbers
2. Ensure your app is served over HTTPS
3. Add your production domain to authorized domains

## Step 6: Security Rules (Optional)

For additional security, you can set up Firestore security rules if you plan to use Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 7: Environment Variables (Recommended)

For production apps, consider using environment variables:

1. Create `.env` file in your project root:
```
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
# ... other config values
```

2. Update `firebase.ts` to use environment variables:
```typescript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  // ... other config
};
```

## Troubleshooting

### Common Issues

1. **reCAPTCHA not working**: Ensure your domain is added to authorized domains
2. **OTP not received**: Check if phone number format is correct (+country_code + number)
3. **Authentication errors**: Verify Firebase configuration values are correct

### Phone Number Format

- Always use international format: `+91 98765 43210`
- Include country code: `+1` for US, `+91` for India
- Remove any spaces or special characters in code

## Testing the Implementation

1. Start your development server:
   ```bash
   npm start
   ```

2. Open the app in your browser or mobile device
3. Try logging in with a test phone number
4. Verify OTP functionality

## Production Deployment

1. Update Firebase configuration with production values
2. Add production domain to authorized domains
3. Test with real phone numbers
4. Monitor authentication logs in Firebase Console

## Support

If you encounter issues:
1. Check Firebase Console logs
2. Review browser console for errors
3. Ensure all Firebase services are enabled
4. Verify phone number format and country code

---

**Note**: Keep your Firebase configuration secure and never commit sensitive keys to version control.