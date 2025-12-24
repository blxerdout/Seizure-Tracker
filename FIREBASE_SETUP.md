# Firebase Setup Guide

Follow these steps to set up Firebase for your Seizure Tracker app:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "Seizure Tracker" (or your preferred name)
4. Follow the setup wizard
5. Click "Create project"

## 2. Register Your Web App

1. In your Firebase project, click the **Web icon** (</>)
2. Register app nickname: "Seizure Tracker Web"
3. **Do not** check "Also set up Firebase Hosting" (unless you want hosting)
4. Click "Register app"

## 3. Get Your Firebase Configuration

Copy the configuration object shown. It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 4. Update firebase-config.js

Open `firebase-config.js` and replace the placeholder values with your actual Firebase configuration.

## 5. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Email/Password**
3. Toggle **Enable**
4. Click **Save**

## 6. Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
   - **Note**: Change to production mode and set proper security rules before deploying
4. Select your preferred location
5. Click **Enable**

### Security Rules (Production)
Replace test mode rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own patient data
    match /patients/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own seizure data
    match /seizures/{seizureId} {
      allow read, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 7. Set Up Firebase Storage

1. In Firebase Console, go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Click **Next** and **Done**

### Storage Rules (Production)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /videos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 8. Test Your Setup

1. Open `index.html` in a web browser
2. You should see the Sign In/Sign Up modal
3. Create a new account
4. Add patient information
5. Log a seizure event with video

## 9. Deploy (Optional)

### Option A: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option B: GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select branch and folder
4. Your app will be available at `https://yourusername.github.io/repo-name`

## Features Enabled

✅ User Authentication (Email/Password)
✅ Patient Information Storage
✅ Seizure Event Tracking
✅ Video Upload to Cloud Storage
✅ Real-time Data Sync Across Devices
✅ Secure Data Access (each user sees only their data)

## Troubleshooting

**Can't sign in?**
- Check that Email/Password authentication is enabled in Firebase Console

**Data not saving?**
- Check Firestore rules
- Open browser console for error messages

**Videos not uploading?**
- Check Storage rules
- Verify file size (Firebase free tier has limits)

**CORS errors?**
- Make sure you're accessing the app via http:// or https://, not file://

## Cost Considerations

Firebase free tier (Spark Plan) includes:
- 10 GB Firestore storage
- 50K document reads/day
- 20K document writes/day
- 5 GB Storage
- 1 GB/day downloads

This should be sufficient for personal use or small-scale deployment.
