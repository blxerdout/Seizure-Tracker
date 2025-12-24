// Seizure Tracker App
class SeizureTracker {
    constructor() {
        this.seizures = this.loadSeizures();
        this.editingId = null;
        this.currentVideoFile = null;
        this.initializeApp();
    }

    // Initialize the application
    initializeApp() {
        this.setDefaultDateTime();
        this.attachEventListeners();
        this.displaySeizures();
        this.updateStatistics();
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
        const form = document.getElementById('seizureForm');
        const cancelBtn = document.getElementById('cancelBtn');
        const exportBtn = document.getElementById('exportBtn');
        const videoInput = document.getElementById('seizureVideo');
        const removeVideoBtn = document.getElementById('removeVideo');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        cancelBtn.addEventListener('click', () => this.cancelEdit());
        exportBtn.addEventListener('click', () => this.exportData());
        videoInput.addEventListener('change', (e) => this.handleVideoSelection(e));
    async handleFormSubmit(e) {
        e.preventDefault();

        const seizureData = {
            id: this.editingId || Date.now(),
            date: document.getElementById('seizureDate').value,
            time: document.getElementById('seizureTime').value,
            duration: document.getElementById('seizureDuration').value,
            type: document.getElementById('seizureType').value,
            triggers: document.getElementById('seizureTriggers').value,
            notes: document.getElementById('seizureNotes').value,
            video: null
        };

        // Handle video upload
        if (this.currentVideoFile) {
            seizureData.video = await this.convertVideoToBase64(this.currentVideoFile);
        } else if (this.editingId) {
            // Preserve existing video when editing
            const existingSeizure = this.seizures.find(s => s.id === this.editingId);
            if (existingSeizure && existingSeizure.video) {
                seizureData.video = existingSeizure.video;
            }
        }  duration: document.getElementById('seizureDuration').value,
            type: document.getElementById('seizureType').value,
            triggers: document.getElementById('seizureTriggers').value,
            notes: document.getElementById('seizureNotes').value
        };

        if (this.editingId) {
            // Update existing seizure
            const index = this.seizures.findIndex(s => s.id === this.editingId);
            this.seizures[index] = seizureData;
            this.editingId = null;
            this.toggleEditMode(false);
        } else {
            // Add new seizure
            this.seizures.unshift(seizureData);
        }

        this.saveSeizures();
        this.displaySeizures();
        this.updateStatistics();
        // Show existing video if available
        if (seizure.video) {
            this.showVideoPreview(seizure.video);
        }

        this.resetForm();
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
    deleteSeizure(id) {
        if (confirm('Are you sure you want to delete this seizure event?')) {
            this.seizures = this.seizures.filter(s => s.id !== id);
            this.saveSeizures();
            this.displaySeizures();
            this.updateStatistics();
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
            btn.addEventListener('click', () => this.editSeizure(parseInt(btn.dataset.id)));
        });

        eventsList.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', () => this.deleteSeizure(parseInt(btn.dataset.id)));
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
                ${seizure.video ? `
                    <div class="event-video">
                        <strong>Video Recording:</strong>
                        <video controls class="event-video-player">
                            <source src="${seizure.video}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ` : ''}
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
       Handle video selection
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

    // Convert video to base64
    convertVideoToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Reset form
    resetForm() {
        document.getElementById('seizureForm').reset();
        this.setDefaultDateTime();
        this.removeVideo = thisMonthCount;

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

    // Reset form
    resetForm() {
        document.getElementById('seizureForm').reset();
        this.setDefaultDateTime();
    }

    // Save seizures to localStorage
    saveSeizures() {
        localStorage.setItem('seizures', JSON.stringify(this.seizures));
    }

    // Load seizures from localStorage
    loadSeizures() {
        const stored = localStorage.getItem('seizures');
        return stored ? JSON.parse(stored) : [];
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
