// Authentication Handler
class AuthHandler {
    constructor() {
        this.currentUser = null;
        this.onAuthStateChanged = null;
    }

    // Initialize auth listener
    init(callback) {
        this.onAuthStateChanged = callback;
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (callback) callback(user);
        });
    }

    // Sign up new user
    async signUp(email, password, displayName) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName });
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Sign in existing user
    async signIn(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Sign out
    async signOut() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

const authHandler = new AuthHandler();
