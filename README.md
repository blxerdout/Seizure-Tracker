# Seizure Tracking App

A web-based application for tracking and managing seizure events with video recording capabilities and cloud sync across multiple devices.

## Features

- 🔐 **User Authentication** - Secure sign-up and login
- 👤 **Patient Profiles** - Store comprehensive patient information
- 📊 **Track Seizure Events** - Date, time, duration, type, triggers, and notes
- 🎥 **Video Upload** - Attach videos of seizure events (stored in cloud)
- 📈 **Statistics Dashboard** - Total events, monthly events, days since last event
- 💾 **Export Data** - Download seizure history as JSON
- ☁️ **Cloud Sync** - Access data from any device
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- **Firebase Authentication** - User accounts
- **Firebase Firestore** - Real-time cloud database
- **Firebase Storage** - Cloud video storage

## Setup Instructions

### 1. Firebase Configuration

Before running the app, you need to set up Firebase:

1. Follow the detailed instructions in [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
2. Create a Firebase project
3. Enable Authentication, Firestore, and Storage
4. Copy your Firebase config to `firebase-config.js`

### 2. Running the App

Simply open `index.html` in a web browser, or host it on:
- Firebase Hosting
- GitHub Pages
- Any web server

**Note:** The app requires an internet connection to sync with Firebase.

## Data Structure

### Patient Information
- Full Name
- Date of Birth
- Gender
- Medical Record Number
- Diagnosis
- Current Medications
- Allergies
- Emergency Contact
- Primary Doctor

### Seizure Events
- Date and Time
- Duration (minutes)
- Type (Tonic-Clonic, Absence, Focal, etc.)
- Possible Triggers
- Additional Notes
- Video Recording (optional)

## Security

- Each user can only access their own data
- Videos are stored securely in Firebase Storage
- Firestore security rules prevent unauthorized access
- All data transmission is encrypted (HTTPS)

## Privacy

- Data is stored in your Firebase project (you control it)
- No third-party analytics or tracking
- HIPAA compliance depends on your Firebase configuration

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with ES6+ support

## Cost

Firebase free tier is sufficient for personal use:
- 10 GB Firestore storage
- 5 GB video storage
- 50K reads/day, 20K writes/day

See [Firebase Pricing](https://firebase.google.com/pricing) for details.

## Development

```bash
# Clone the repository
git clone https://github.com/blxerdout/Seizure-Tracker.git

# Open in browser
open index.html
```

## License

MIT License - feel free to use and modify for your needs.

## Support

For issues or questions, please open an issue on GitHub.
