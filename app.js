// Seizure Tracker App with Firebase
class SeizureTracker {
    constructor() {
        this.seizures = [];
        this.editingId = null;
        this.currentVideoFile = null;
        this.unsubscribeSeizures = null;
        this.isSignUpMode = false;
        this.initAuth();
    }

    // Initialize authentication
    initAuth() {
        authHandler.init((user) => {
            if (user) {
                this.onUserLoggedIn();
            } else {
                this.onUserLoggedOut();
            }
        });
    }

    // User logged in
    onUserLoggedIn() {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        this.initializeApp();
    }

    // User logged out
    onUserLoggedOut() {
        document.getElementById('authModal').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
        if (this.unsubscribeSeizures) {
            this.unsubscribeSeizures();
        }
    }

    // Initialize the application
    initializeApp() {
        this.setDefaultDateTime();
        this.attachEventListeners();
        this.loadSeizuresFromFirebase();
        this.loadPatientInfo();
    }

    // Set default date and time to current
    setDefaultDateTime() {
        const now = new Date();
        const dateInput = document.getElementById('seizureDate');
        const timeInput = document.getElementById('seizureTime');
        
        dateInput.valueAsDate = now;
        timeInput.value = now.toTimeString().slice(0, 5);
    }

    // Attach event listeners
    attachEventListeners() {
        // Auth form
        const authForm = document.getElementById('authForm');
        const authToggleLink = document.getElementById('authToggleLink');
        const signOutBtn = document.getElementById('signOutBtn');
        
        authForm.addEventListener('submit', (e) => this.handleAuth(e));
        authToggleLink.addEventListener('click', (e) => this.toggleAuthMode(e));
        signOutBtn.addEventListener('click', () => this.handleSignOut());

        // Patient form
        const patientForm = document.getElementById('patientForm');
        const patientInfoBtn = document.getElementById('patientInfoBtn');
        const patientModal = document.getElementById('patientModal');
        const closeBtn = patientModal.querySelector('.close');
        
        patientForm.addEventListener('submit', (e) => this.handlePatientSubmit(e));
        patientInfoBtn.addEventListener('click', () => this.showPatientModal());
        closeBtn.addEventListener('click', () => this.hidePatientModal());

        // Seizure form
        const form = document.getElementById('seizureForm');
        const cancelBtn = document.getElementById('cancelBtn');
        const exportBtn = document.getElementById('exportBtn');
        const videoInput = document.getElementById('seizureVideo');
        const removeVideoBtn = document.getElementById('removeVideo');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        cancelBtn.addEventListener('click', () => this.cancelEdit());
        exportBtn.addEventListener('click', () => this.exportData());
        videoInput.addEventListener('change', (e) => this.handleVideoSelection(e));
        removeVideoBtn.addEventListener('click', () => this.removeVideo());
    }

    // Handle authentication
    async handleAuth(e) {
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const displayName = document.getElementById('authDisplayName').value;
        const errorDiv = document.getElementById('authError');

        let result;
        if (this.isSignUpMode) {
            result = await authHandler.signUp(email, password, displayName);
        } else {
            result = await authHandler.signIn(email, password);
        }

        if (result.success) {
            errorDiv.textContent = '';
            document.getElementById('authForm').reset();
        } else {
            errorDiv.textContent = result.error;
        }
    }

    // Toggle between sign in and sign up
    toggleAuthMode(e) {
        e.preventDefault();
        this.isSignUpMode = !this.isSignUpMode;
        
        const title = document.getElementById('authTitle');
        const submitBtn = document.getElementById('authSubmitBtn');
        const toggleText = document.getElementById('authToggleText');
        const toggleLink = document.getElementById('authToggleLink');
        const displayNameGroup = document.getElementById('displayNameGroup');

        if (this.isSignUpMode) {
            title.textContent = 'Sign Up';
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

    // Handle sign out
    async handleSignOut() {
        await authHandler.signOut();
    }

    // Patient modal management
    showPatientModal() {
        document.getElementById('patientModal').style.display = 'flex';
    }

    hidePatientModal() {
        document.getElementById('patientModal').style.display = 'none';
    }

    // Load patient info
    async loadPatientInfo() {
        const result = await dbHandler.getPatient();
        if (result.success && result.data) {
            const patient = result.data;
            document.getElementById('patientName').value = patient.name || '';
            document.getElementById('patientDOB').value = patient.dob || '';
            document.getElementById('patientGender').value = patient.gender || '';
            document.getElementById('patientMRN').value = patient.mrn || '';
            document.getElementById('patientDiagnosis').value = patient.diagnosis || '';
            document.getElementById('patientMedications').value = patient.medications || '';
            document.getElementById('patientAllergies').value = patient.allergies || '';
            document.getElementById('patientEmergencyContact').value = patient.emergencyContact || '';
            document.getElementById('patientDoctor').value = patient.doctor || '';
        }
    }

    // Handle patient form submission
    async handlePatientSubmit(e) {
        e.preventDefault();

        const patientData = {
            name: document.getElementById('patientName').value,
            dob: document.getElementById('patientDOB').value,
            gender: document.getElementById('patientGender').value,
            mrn: document.getElementById('patientMRN').value,
            diagnosis: document.getElementById('patientDiagnosis').value,
            medications: document.getElementById('patientMedications').value,
            allergies: document.getElementById('patientAllergies').value,
            emergencyContact: document.getElementById('patientEmergencyContact').value,
            doctor: document.getElementById('patientDoctor').value
        };

        const result = await dbHandler.savePatient(patientData);
        if (result.success) {
            alert('Patient information saved successfully!');
            this.hidePatientModal();
        } else {
            alert('Error saving patient information: ' + result.error);
        }
    }

    // Load seizures from Firebase
    loadSeizuresFromFirebase() {
        this.unsubscribeSeizures = dbHandler.listenToSeizures((seizures) => {
            this.seizures = seizures;
            this.displaySeizures();
            this.updateStatistics();
        });
    }

    // Handle form submission
    async handleFormSubmit(e) {
        e.preventDefault();

        const seizureData = {
            date: document.getElementById('seizureDate').value,
            time: document.getElementById('seizureTime').value,
            duration: document.getElementById('seizureDuration').value,
            type: document.getElementById('seizureType').value,
            triggers: document.getElementById('seizureTriggers').value,
            notes: document.getElementById('seizureNotes').value,
            videoUrl: null
        };

        // Handle video upload to Firebase Storage
        if (this.currentVideoFile) {
            const tempId = this.editingId || Date.now().toString();
            const uploadResult = await dbHandler.uploadVideo(this.currentVideoFile, tempId);
            if (uploadResult.success) {
                seizureData.videoUrl = uploadResult.url;
            }
        }

        let result;
        if (this.editingId) {
            // Update existing seizure
            result = await dbHandler.updateSeizure(this.editingId, seizureData);
            this.editingId = null;
            this.toggleEditMode(false);
        } else {
            // Add new seizure
            result = await dbHandler.addSeizure(seizureData);
        }

        if (result.success) {
            this.resetForm();
        } else {
            alert('Error saving seizure: ' + result.error);
        }
    }

    // Edit a seizure
    editSeizure(id) {
        const seizure = this.seizures.find(s => s.id === id);
        if (!seizure) return;

        this.editingId = id;
        document.getElementById('seizureDate').value = seizure.date;
        document.getElementById('seizureTime').value = seizure.time;
        document.getElementById('seizureDuration').value = seizure.duration;
        document.getElementById('seizureType').value = seizure.type;
        document.getElementById('seizureTriggers').value = seizure.triggers;
        document.getElementById('seizureNotes').value = seizure.notes;

        // Show existing video if available
        if (seizure.videoUrl) {
            this.showVideoPreview(seizure.videoUrl);
        }

        this.toggleEditMode(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Toggle edit mode UI
    toggleEditMode(isEditing) {
        const formBtnText = document.getElementById('formBtnText');
        const cancelBtn = document.getElementById('cancelBtn');

        if (isEditing) {
            formBtnText.textContent = 'Update Event';
            cancelBtn.style.display = 'inline-block';
        } else {
            formBtnText.textContent = 'Add Event';
            cancelBtn.style.display = 'none';
        }
    }

    // Cancel editing
    cancelEdit() {
        this.editingId = null;
        this.toggleEditMode(false);
        this.resetForm();
    }

    // Delete a seizure
    async deleteSeizure(id) {
        if (confirm('Are you sure you want to delete this seizure event?')) {
            const result = await dbHandler.deleteSeizure(id);
            if (!result.success) {
                alert('Error deleting seizure: ' + result.error);
            }
        }
    }

    // Display seizures in the list
    displaySeizures() {
        const eventsList = document.getElementById('eventsList');
        const emptyState = document.getElementById('emptyState');

        if (this.seizures.length === 0) {
            eventsList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        eventsList.style.display = 'flex';
        emptyState.style.display = 'none';

        eventsList.innerHTML = this.seizures.map(seizure => this.createEventCard(seizure)).join('');

        // Attach event listeners to action buttons
        eventsList.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => this.editSeizure(btn.dataset.id));
        });

        eventsList.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', () => this.deleteSeizure(btn.dataset.id));
        });
    }

    // Create event card HTML
    createEventCard(seizure) {
        const dateObj = new Date(`${seizure.date}T${seizure.time}`);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        const formattedTime = dateObj.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return `
            <div class="event-card">
                <div class="event-header">
                    <div class="event-date-time">
                        <strong>${formattedDate}</strong>
                        <span>at ${formattedTime}</span>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-edit" data-action="edit" data-id="${seizure.id}">Edit</button>
                        <button class="btn btn-danger" data-action="delete" data-id="${seizure.id}">Delete</button>
                    </div>
                </div>
                <div class="event-details">
                    ${seizure.duration ? `<div class="event-detail"><strong>Duration:</strong> ${seizure.duration} min</div>` : ''}
                    ${seizure.type ? `<div class="event-detail"><strong>Type:</strong> ${seizure.type}</div>` : ''}
                    ${seizure.triggers ? `<div class="event-detail"><strong>Triggers:</strong> ${seizure.triggers}</div>` : ''}
                </div>
                ${seizure.notes ? `<div class="event-notes">${seizure.notes}</div>` : ''}
                ${seizure.videoUrl ? `
                    <div class="event-video">
                        <strong>Video Recording:</strong>
                        <video controls class="event-video-player">
                            <source src="${seizure.videoUrl}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Update statistics
    updateStatistics() {
        const totalEvents = document.getElementById('totalEvents');
        const monthEvents = document.getElementById('monthEvents');
        const lastEvent = document.getElementById('lastEvent');

        // Total events
        totalEvents.textContent = this.seizures.length;

        // Events this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthCount = this.seizures.filter(s => {
            const seizureDate = new Date(s.date);
            return seizureDate.getMonth() === currentMonth && seizureDate.getFullYear() === currentYear;
        }).length;
        monthEvents.textContent = thisMonthCount;

        // Last event
        if (this.seizures.length > 0) {
            const lastSeizure = this.seizures[0];
            const daysSince = this.getDaysSince(lastSeizure.date);
            lastEvent.textContent = daysSince === 0 ? 'Today' : `${daysSince}d ago`;
        } else {
            lastEvent.textContent = 'None';
        }
    }

    // Calculate days since a date
    getDaysSince(dateString) {
        const seizureDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        seizureDate.setHours(0, 0, 0, 0);
        const diffTime = today - seizureDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Handle video selection
    handleVideoSelection(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('video/')) {
            this.currentVideoFile = file;
            const videoURL = URL.createObjectURL(file);
            this.showVideoPreview(videoURL);
        }
    }

    // Show video preview
    showVideoPreview(videoURL) {
        const previewContainer = document.getElementById('videoPreview');
        const previewPlayer = document.getElementById('previewPlayer');
        
        previewPlayer.src = videoURL;
        previewContainer.style.display = 'block';
    }

    // Remove video
    removeVideo() {
        this.currentVideoFile = null;
        const videoInput = document.getElementById('seizureVideo');
        const previewContainer = document.getElementById('videoPreview');
        const previewPlayer = document.getElementById('previewPlayer');
        
        videoInput.value = '';
        previewPlayer.src = '';
        previewContainer.style.display = 'none';
    }

    // Reset form
    resetForm() {
        document.getElementById('seizureForm').reset();
        this.setDefaultDateTime();
        this.removeVideo();
    }

    // Export data as JSON
    exportData() {
        if (this.seizures.length === 0) {
            alert('No data to export');
            return;
        }

        const dataStr = JSON.stringify(this.seizures, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `seizure-tracker-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SeizureTracker();
});
