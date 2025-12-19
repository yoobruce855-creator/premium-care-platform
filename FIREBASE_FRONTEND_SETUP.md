# Firebase Configuration

## Environment Variables

Add these to your `.env` file:

```env
# Firebase Project Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Firebase Cloud Messaging VAPID Key
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

## Getting Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps"
5. Select your web app or create one
6. Copy the configuration values

## Getting VAPID Key

1. In Firebase Console, go to Project Settings
2. Go to "Cloud Messaging" tab
3. Under "Web Push certificates", generate a new key pair
4. Copy the "Key pair" value (this is your VAPID key)

## Update Service Worker

Edit `public/firebase-messaging-sw.js` and replace the placeholder values with your actual Firebase configuration.

## Testing FCM

1. Make sure your Firebase project has Cloud Messaging enabled
2. Register for notifications in the app
3. Send a test message from Firebase Console > Cloud Messaging
