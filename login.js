// Login Page Handler
class LoginPage {
    constructor() {
        this.isSignUpMode = false;
        this.init();
    }

    init() {
        // Check if user is already logged in
        authHandler.init((user) => {
            if (user) {
                // Redirect to main app
                window.location.href = 'index.html';
            }
        });

        this.attachEventListeners();
    }

    attachEventListeners() {
        const authForm = document.getElementById('authForm');
        const authToggleLink = document.getElementById('authToggleLink');

        authForm.addEventListener('submit', (e) => this.handleAuth(e));
        authToggleLink.addEventListener('click', (e) => this.toggleAuthMode(e));
    }

    async handleAuth(e) {
        e.preventDefault();
        
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const displayName = document.getElementById('authDisplayName').value;
        const errorDiv = document.getElementById('authError');
        const submitBtn = document.getElementById('authSubmitBtn');
        const btnText = document.getElementById('btnText');
        const btnLoader = document.getElementById('btnLoader');

        // Show loader
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        errorDiv.textContent = '';

        let result;
        if (this.isSignUpMode) {
            if (!displayName) {
                errorDiv.textContent = 'Please enter your full name';
                this.resetButton(submitBtn, btnText, btnLoader);
                return;
            }
            result = await authHandler.signUp(email, password, displayName);
        } else {
            result = await authHandler.signIn(email, password);
        }

        if (result.success) {
            // Redirect to main app
            window.location.href = 'index.html';
        } else {
            errorDiv.textContent = result.error;
            this.resetButton(submitBtn, btnText, btnLoader);
        }
    }

    resetButton(submitBtn, btnText, btnLoader) {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }

    toggleAuthMode(e) {
        e.preventDefault();
        this.isSignUpMode = !this.isSignUpMode;
        
        const title = document.getElementById('authTitle');
        const submitBtn = document.getElementById('btnText');
        const toggleText = document.getElementById('authToggleText');
        const toggleLink = document.getElementById('authToggleLink');
        const displayNameGroup = document.getElementById('displayNameGroup');
        const errorDiv = document.getElementById('authError');

        // Clear any errors
        errorDiv.textContent = '';

        if (this.isSignUpMode) {
            title.textContent = 'Create Account';
            submitBtn.textContent = 'Sign Up';
            toggleText.textContent = 'Already have an account?';
            toggleLink.textContent = 'Sign In';
            displayNameGroup.style.display = 'block';
        } else {
            title.textContent = 'Sign In';
            submitBtn.textContent = 'Sign In';
            toggleText.textContent = "Don't have an account?";
            toggleLink.textContent = 'Sign Up';
            displayNameGroup.style.display = 'none';
        }
    }
}

// Initialize login page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});
