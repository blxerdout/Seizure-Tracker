// Database Handler for Firestore
class DatabaseHandler {
    constructor() {
        this.patientsCollection = 'patients';
        this.seizuresCollection = 'seizures';
    }

    // Get current user ID
    getUserId() {
        const user = auth.currentUser;
        return user ? user.uid : null;
    }

    // Patient Management
    async savePatient(patientData) {
        const userId = this.getUserId();
        if (!userId) throw new Error('User not authenticated');

        try {
            const patientRef = db.collection(this.patientsCollection).doc(userId);
            await patientRef.set(patientData, { merge: true });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getPatient() {
        const userId = this.getUserId();
        if (!userId) throw new Error('User not authenticated');

        try {
            const patientDoc = await db.collection(this.patientsCollection).doc(userId).get();
            if (patientDoc.exists) {
                return { success: true, data: patientDoc.data() };
            }
            return { success: true, data: null };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Seizure Events Management
    async addSeizure(seizureData) {
        const userId = this.getUserId();
        if (!userId) throw new Error('User not authenticated');

        try {
            seizureData.userId = userId;
            seizureData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            const docRef = await db.collection(this.seizuresCollection).add(seizureData);
            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateSeizure(seizureId, seizureData) {
        const userId = this.getUserId();
        if (!userId) throw new Error('User not authenticated');

        try {
            seizureData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection(this.seizuresCollection).doc(seizureId).update(seizureData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteSeizure(seizureId) {
        const userId = this.getUserId();
        if (!userId) throw new Error('User not authenticated');

        try {
            await db.collection(this.seizuresCollection).doc(seizureId).delete();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get all seizures for current user (with real-time listener)
    listenToSeizures(callback) {
        const userId = this.getUserId();
        if (!userId) throw new Error('User not authenticated');

        return db.collection(this.seizuresCollection)
            .where('userId', '==', userId)
            .onSnapshot((snapshot) => {
                const seizures = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    seizures.push({ id: doc.id, ...data });
                });
                // Sort by createdAt in JavaScript instead
                seizures.sort((a, b) => {
                    if (!a.createdAt || !b.createdAt) return 0;
                    return b.createdAt.toMillis() - a.createdAt.toMillis();
                });
                callback(seizures);
            });
    }

    // Upload video to Firebase Storage
    async uploadVideo(file, seizureId) {
        const userId = this.getUserId();
        if (!userId) throw new Error('User not authenticated');

        try {
            const storageRef = storage.ref(`videos/${userId}/${seizureId}/${file.name}`);
            const uploadTask = await storageRef.put(file);
            const downloadURL = await uploadTask.ref.getDownloadURL();
            return { success: true, url: downloadURL };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

const dbHandler = new DatabaseHandler();
