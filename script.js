// Cloudinary Configuration
const cloudinaryConfig = {
    cloudName: 'dmnyvpqhr',
    uploadPreset: 'docvault_uploads',
    apiKey: '831699848165338'
};

// EmailJS Configuration
const emailConfig = {
    publicKey: '6gwUhzhyxF_mAox_I',
    serviceID: 'service_pncmjat',
    templateID: 'template_zwpu3m5'
};

// Initialize EmailJS with proper error handling
function initEmailJS() {
    return new Promise((resolve, reject) => {
        try {
            // EmailJS is already initialized in the HTML
            resolve(true);
        } catch (error) {
            console.error('EmailJS initialization error:', error);
            reject(error);
        }
    });
}

// Common Functions
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    // Remove existing alerts
    const existingAlerts = alertContainer.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show text-center`;
    alert.style.fontSize = '1rem';
    alert.style.fontWeight = '500';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alert);

    // Auto dismiss success alerts after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (alert && alert.parentElement) {
                alert.remove();
            }
        }, 3000);
    }
}

function toggleLoading(button, show) {
    if (!button) return;
    const buttonText = button.querySelector('.button-text');
    const loading = button.querySelector('.loading');
    if (show) {
        buttonText.classList.add('d-none');
        loading.classList.remove('d-none');
        button.disabled = true;
    } else {
        buttonText.classList.remove('d-none');
        loading.classList.add('d-none');
        button.disabled = false;
    }
}

function togglePasswordVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    button.querySelector('i').classList.toggle('fa-eye');
    button.querySelector('i').classList.toggle('fa-eye-slash');
}

// Login Page
if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    const forgotCredentials = document.getElementById('forgot-credentials');
    
    // Initialize EmailJS when page loads
    window.addEventListener('DOMContentLoaded', async () => {
        try {
            await initEmailJS();
            console.log('EmailJS initialized on page load');
        } catch (error) {
            console.error('Failed to initialize EmailJS:', error);
            showAlert('Email service initialization failed. Some features may not work.', 'error');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginButton = document.getElementById('login-button');

        toggleLoading(loginButton, true);
        try {
            const userDetails = JSON.parse(localStorage.getItem('userDetails'));
            
            if (!userDetails) {
                showAlert('No registered users found. Please register first.', 'error');
                return;
            }

            if (username === userDetails.username && password === userDetails.password) {
                localStorage.setItem('isLoggedIn', 'true');
                showAlert('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
            } else {
                showAlert('Invalid username or password', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('Error during login. Please try again.', 'error');
        } finally {
            toggleLoading(loginButton, false);
        }
    });

    forgotCredentials.addEventListener('click', async (e) => {
        e.preventDefault();

        try {
            const userDetails = JSON.parse(localStorage.getItem('userDetails'));
            console.log('Retrieved user details:', userDetails);

            if (!userDetails || !userDetails.email) {
                showAlert('No account found. Please register first.', 'error');
                return;
            }

            showAlert('Sending recovery email...', 'info');

            // Create template parameters exactly matching your EmailJS template
            const templateParams = {
                name: userDetails.username,
                email: userDetails.email,
                username: userDetails.username,
                password: userDetails.password
            };

            console.log('Sending email with params:', templateParams);

            // Send email using the new EmailJS method
            const response = await emailjs.send(
                emailConfig.serviceID,
                emailConfig.templateID,
                templateParams,
                emailConfig.publicKey // Add public key here
            );

            console.log('Email sent successfully:', response);
            showAlert('Recovery email sent! Please check your inbox.', 'success');

        } catch (error) {
            console.error('Detailed email error:', error);
            let errorMessage = 'Error sending recovery email. Please try again.';
            
            if (error.text) {
                if (error.text.includes('Account not found')) {
                    errorMessage = 'EmailJS account not properly configured. Please check your EmailJS settings.';
                } else {
                    errorMessage = `Error: ${error.text}`;
                }
            }
            
            showAlert(errorMessage, 'error');
        }
    });

    // Registration success handler
    if (new URLSearchParams(window.location.search).get('registered') === 'true') {
        showAlert('Registration successful! Please login with your credentials.', 'success');
    }
}

// Registration Page
if (document.getElementById('register-form')) {
    const registerForm = document.getElementById('register-form');
    const registerButton = document.getElementById('register-button');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'error');
            return;
        }

        toggleLoading(registerButton, true);
        try {
            const userDetails = {
                username: username,
                email: email,
                password: password,
                registrationDate: new Date().toISOString()
            };
            localStorage.setItem('userDetails', JSON.stringify(userDetails));
            console.log('User registered:', userDetails); // Debug log

            showAlert('Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html?registered=true';
            }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('Registration failed. Please try again.', 'error');
        } finally {
            toggleLoading(registerButton, false);
        }
    });
}

// Home Page
if (document.getElementById('upload-btn')) {
    const uploadBtn = document.getElementById('upload-btn');
    const uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));
    const uploadForm = document.getElementById('upload-form');
    const uploadSubmit = document.getElementById('upload-submit');

    // Initialize Cloudinary Upload Widget
    const myWidget = cloudinary.createUploadWidget(
        {
            cloudName: cloudinaryConfig.cloudName,
            uploadPreset: cloudinaryConfig.uploadPreset,
            multiple: false,
            showAdvancedOptions: false,
            showUploadMoreButton: false,
            sources: ['local', 'url', 'camera'],
            defaultSource: 'local',
            styles: {
                palette: {
                    window: '#FFFFFF',
                    windowBorder: '#90A0B3',
                    tabIcon: '#0078FF',
                    menuIcons: '#5A616A',
                    textDark: '#000000',
                    textLight: '#FFFFFF',
                    link: '#0078FF',
                    action: '#FF620C',
                    inactiveTabIcon: '#0E2F5A',
                    error: '#F44235',
                    inProgress: '#0078FF',
                    complete: '#20B832',
                    sourceBg: '#E4EBF1'
                }
            }
        },
        (error, result) => {
            if (!error && result && result.event === 'success') {
                const file = result.info;
                const password = document.getElementById('file-password').value;

                // Store file metadata in localStorage
                const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
                files.push({
                    name: file.original_filename,
                    size: file.bytes,
                    type: file.format || file.resource_type,
                    url: password ? encryptData(file.secure_url, password) : file.secure_url,
                    public_id: file.public_id,
                    hasPassword: !!password,
                    uploadDate: new Date().toISOString(),
                    thumbnail: file.thumbnail_url || file.secure_url
                });
                localStorage.setItem('uploadedFiles', JSON.stringify(files));

                showAlert('File uploaded successfully!');
                uploadForm.reset();
                uploadModal.hide();

                // Redirect to stored files page
                setTimeout(() => {
                    window.location.href = 'storedfiles.html';
                }, 1500);
            }
            if (error) {
                console.error('Upload error:', error);
                showAlert('Upload failed: ' + (error.message || 'Unknown error'), 'error');
            }
        }
    );

    uploadBtn.addEventListener('click', () => {
        uploadModal.show();
    });

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        myWidget.open();
    });
}

// Stored Files Page
if (document.getElementById('file-grid')) {
    const fileGrid = document.getElementById('file-grid');
    const noFilesMessage = document.getElementById('no-files-message');
    const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
    const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));

    // Function to load and display files
    async function loadFiles() {
        try {
            const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
            
            if (files.length === 0) {
                noFilesMessage.classList.remove('d-none');
                fileGrid.classList.add('d-none');
            } else {
                noFilesMessage.classList.add('d-none');
                fileGrid.classList.remove('d-none');
                displayFiles(files);
            }
        } catch (error) {
            console.error('Error loading files:', error);
            showAlert('Error loading files', 'error');
        }
    }

    // Function to display files in grid
    function displayFiles(files) {
        fileGrid.innerHTML = '';
        files.forEach(file => {
            const fileCard = createFileCard(file);
            fileGrid.appendChild(fileCard);
        });
    }

    // Function to create file card
    function createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card';
        
        // Determine file icon based on file type
        let fileIcon = 'fa-file';
        if (file.type.includes('image')) fileIcon = 'fa-file-image';
        else if (file.type.includes('pdf')) fileIcon = 'fa-file-pdf';
        else if (file.type.includes('word')) fileIcon = 'fa-file-word';
        else if (file.type.includes('excel')) fileIcon = 'fa-file-excel';

        const thumbnailHtml = file.thumbnail ? 
            `<img src="${file.thumbnail}" alt="${file.name}" class="file-thumbnail mb-2" style="max-width: 100px;">` :
            `<i class="fas ${fileIcon} fa-2x mb-2"></i>`;

        card.innerHTML = `
            <div class="file-info">
                ${thumbnailHtml}
                <h5>${file.name}</h5>
                <p class="text-muted">${formatFileSize(file.size)}</p>
                ${file.hasPassword ? '<span class="badge bg-warning text-dark"><i class="fas fa-lock"></i> Password Protected</span>' : ''}
            </div>
            <div class="file-actions">
                <i class="fas fa-download" title="Download" data-url="${file.url}"></i>
                <i class="fas fa-share-alt" title="Share" data-url="${file.url}"></i>
                <i class="fas fa-eye" title="View" data-url="${file.url}"></i>
                <i class="fas fa-trash" title="Delete" data-public-id="${file.public_id}"></i>
            </div>
        `;

        // Add event listeners for file actions
        const downloadBtn = card.querySelector('.fa-download');
        const shareBtn = card.querySelector('.fa-share-alt');
        const viewBtn = card.querySelector('.fa-eye');
        const deleteBtn = card.querySelector('.fa-trash');

        downloadBtn.addEventListener('click', () => handleFileAction('download', file));
        shareBtn.addEventListener('click', () => handleFileAction('share', file));
        viewBtn.addEventListener('click', () => handleFileAction('view', file));
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (file.hasPassword) {
                // Show password modal for password-protected files
                const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
                const passwordForm = document.getElementById('password-form');
                passwordForm.reset();
                passwordModal.show();
                passwordForm.onsubmit = async (event) => {
                    event.preventDefault();
                    const password = document.getElementById('file-password-input').value;
                    // Decrypt the URL to check password
                    const decryptedUrl = decryptData(file.url, password);
                    if (!decryptedUrl) {
                        showAlert('Incorrect password', 'error');
                        return;
                    }
                    passwordModal.hide();
                    if (confirm('Are you sure you want to delete this file?')) {
                        try {
                            // Remove file from localStorage
                            const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
                            const updatedFiles = files.filter(f => f.public_id !== file.public_id);
                            localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
                            // Remove the file card from the UI immediately
                            card.remove();
                            // Check if there are any files left
                            const fileGrid = document.getElementById('file-grid');
                            const noFilesMessage = document.getElementById('no-files-message');
                            if (fileGrid.children.length === 0) {
                                noFilesMessage.classList.remove('d-none');
                                fileGrid.classList.add('d-none');
                            }
                            showAlert('File deleted successfully');
                            // Remove file from Cloudinary (optional, can fail silently)
                            try {
                                const cloudName = 'your_cloud_name';
                                const apiKey = 'your_api_key';
                                const apiSecret = 'your_api_secret';
                                const timestamp = Math.floor(Date.now() / 1000);
                                const signature = await generateSignature(apiSecret, timestamp, file.public_id);
                                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        public_id: file.public_id,
                                        timestamp: timestamp,
                                        api_key: apiKey,
                                        signature: signature
                                    })
                                });
                                if (!response.ok) {
                                    throw new Error('Failed to delete file from Cloudinary');
                                }
                            } catch (cloudErr) {
                                console.warn('Cloudinary deletion failed:', cloudErr);
                            }
                        } catch (error) {
                            console.error('Delete error:', error);
                            showAlert('Error deleting file: ' + (error.message || 'Unknown error'), 'error');
                        }
                    }
                };
            } else {
                if (confirm('Are you sure you want to delete this file?')) {
                    try {
                        // Remove file from localStorage
                        const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
                        const updatedFiles = files.filter(f => f.public_id !== file.public_id);
                        localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
                        // Remove the file card from the UI immediately
                        card.remove();
                        // Check if there are any files left
                        const fileGrid = document.getElementById('file-grid');
                        const noFilesMessage = document.getElementById('no-files-message');
                        if (fileGrid.children.length === 0) {
                            noFilesMessage.classList.remove('d-none');
                            fileGrid.classList.add('d-none');
                        }
                        showAlert('File deleted successfully');
                        // Remove file from Cloudinary (optional, can fail silently)
                        try {
                            const cloudName = 'your_cloud_name';
                            const apiKey = 'your_api_key';
                            const apiSecret = 'your_api_secret';
                            const timestamp = Math.floor(Date.now() / 1000);
                            const signature = await generateSignature(apiSecret, timestamp, file.public_id);
                            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    public_id: file.public_id,
                                    timestamp: timestamp,
                                    api_key: apiKey,
                                    signature: signature
                                })
                            });
                            if (!response.ok) {
                                throw new Error('Failed to delete file from Cloudinary');
                            }
                        } catch (cloudErr) {
                            console.warn('Cloudinary deletion failed:', cloudErr);
                        }
                    } catch (error) {
                        console.error('Delete error:', error);
                        showAlert('Error deleting file: ' + (error.message || 'Unknown error'), 'error');
                    }
                }
            }
        });

        return card;
    }

    // Function to handle file actions
    async function handleFileAction(action, file) {
        if (file.hasPassword) {
            // Show password modal for password-protected files
            const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));
            const passwordForm = document.getElementById('password-form');
            
            // Reset form
            passwordForm.reset();
            
            // Show modal
            passwordModal.show();
            
            // Handle password submission
            passwordForm.onsubmit = async (e) => {
                e.preventDefault();
                const password = document.getElementById('file-password-input').value;
                
                // Decrypt the URL
                const decryptedUrl = decryptData(file.url, password);
                
                if (!decryptedUrl) {
                    showAlert('Incorrect password', 'error');
                    return;
                }
                
                // Create a temporary file object with the decrypted URL
                const tempFile = { ...file, url: decryptedUrl };
                
                // Close modal
                passwordModal.hide();
                
                // Proceed with the action
                switch (action) {
                    case 'download':
                        try {
                            const response = await fetch(tempFile.url);
                            const blob = await response.blob();
                            const blobUrl = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = blobUrl;
                            link.download = tempFile.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(blobUrl);
                        } catch (error) {
                            console.error('Download error:', error);
                            showAlert('Error downloading file: ' + (error.message || 'Unknown error'), 'error');
                        }
                        break;

                    case 'share':
                        try {
                            if (navigator.share) {
                                await navigator.share({
                                    title: tempFile.name,
                                    text: `Sharing file from DocVault: ${tempFile.name}`,
                                    url: tempFile.url
                                });
                                showAlert('File shared successfully');
                            } else {
                                const input = document.createElement('input');
                                input.value = tempFile.url;
                                document.body.appendChild(input);
                                input.select();
                                document.execCommand('copy');
                                document.body.removeChild(input);
                                showAlert('Link copied to clipboard! You can now paste it in any messaging app.');
                            }
                        } catch (error) {
                            console.error('Share error:', error);
                            showAlert('Error sharing file: ' + (error.message || 'Unknown error'), 'error');
                        }
                        break;

                    case 'view':
                        window.open(tempFile.url, '_blank');
                        break;

                    case 'delete':
                        try {
                            // Remove file from localStorage
                            const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
                            const updatedFiles = files.filter(f => f.public_id !== file.public_id);
                            localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
                            
                            // Remove file from Cloudinary
                            const cloudName = 'your_cloud_name'; // Replace with your Cloudinary cloud name
                            const apiKey = 'your_api_key'; // Replace with your Cloudinary API key
                            const apiSecret = 'your_api_secret'; // Replace with your Cloudinary API secret
                            
                            const timestamp = Math.floor(Date.now() / 1000);
                            const signature = await generateSignature(apiSecret, timestamp, file.public_id);
                            
                            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    public_id: file.public_id,
                                    timestamp: timestamp,
                                    api_key: apiKey,
                                    signature: signature
                                })
                            });
                            
                            if (!response.ok) {
                                throw new Error('Failed to delete file from Cloudinary');
                            }
                            
                            // Remove the file card from the UI immediately
                            const fileCard = event.target.closest('.file-card');
                            if (fileCard) {
                                fileCard.remove();
                            }
                            
                            // Check if there are any files left
                            const fileGrid = document.getElementById('file-grid');
                            const noFilesMessage = document.getElementById('no-files-message');
                            
                            if (fileGrid.children.length === 0) {
                                noFilesMessage.classList.remove('d-none');
                                fileGrid.classList.add('d-none');
                            }
                            
                            showAlert('File deleted successfully');
                        } catch (error) {
                            console.error('Delete error:', error);
                            showAlert('Error deleting file: ' + (error.message || 'Unknown error'), 'error');
                        }
                        break;
                }
            };
        } else {
            // Handle non-password protected files
            switch (action) {
                case 'download':
                    try {
                        const response = await fetch(file.url);
                        const blob = await response.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = file.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                    } catch (error) {
                        console.error('Download error:', error);
                        showAlert('Error downloading file: ' + (error.message || 'Unknown error'), 'error');
                    }
                    break;

                case 'share':
                    try {
                        if (navigator.share) {
                            await navigator.share({
                                title: file.name,
                                text: `Sharing file from DocVault: ${file.name}`,
                                url: file.url
                            });
                            showAlert('File shared successfully');
                        } else {
                            const input = document.createElement('input');
                            input.value = file.url;
                            document.body.appendChild(input);
                            input.select();
                            document.execCommand('copy');
                            document.body.removeChild(input);
                            showAlert('Link copied to clipboard! You can now paste it in any messaging app.');
                        }
                    } catch (error) {
                        console.error('Share error:', error);
                        showAlert('Error sharing file: ' + (error.message || 'Unknown error'), 'error');
                    }
                    break;

                case 'view':
                    window.open(file.url, '_blank');
                    break;

                case 'delete':
                    try {
                        // Remove file from localStorage
                        const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
                        const updatedFiles = files.filter(f => f.public_id !== file.public_id);
                        localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
                        
                        // Remove file from Cloudinary
                        const cloudName = 'your_cloud_name'; // Replace with your Cloudinary cloud name
                        const apiKey = 'your_api_key'; // Replace with your Cloudinary API key
                        const apiSecret = 'your_api_secret'; // Replace with your Cloudinary API secret
                        
                        const timestamp = Math.floor(Date.now() / 1000);
                        const signature = await generateSignature(apiSecret, timestamp, file.public_id);
                        
                        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                public_id: file.public_id,
                                timestamp: timestamp,
                                api_key: apiKey,
                                signature: signature
                            })
                        });
                        
                        if (!response.ok) {
                            throw new Error('Failed to delete file from Cloudinary');
                        }
                        
                        // Remove the file card from the UI immediately
                        const fileCard = event.target.closest('.file-card');
                        if (fileCard) {
                            fileCard.remove();
                        }
                        
                        // Check if there are any files left
                        const fileGrid = document.getElementById('file-grid');
                        const noFilesMessage = document.getElementById('no-files-message');
                        
                        if (fileGrid.children.length === 0) {
                            noFilesMessage.classList.remove('d-none');
                            fileGrid.classList.add('d-none');
                        }
                        
                        showAlert('File deleted successfully');
                    } catch (error) {
                        console.error('Delete error:', error);
                        showAlert('Error deleting file: ' + (error.message || 'Unknown error'), 'error');
                    }
                    break;
            }
        }
    }

    // Load files when page loads
    loadFiles();
}

// Update Details Page
if (document.getElementById('update-username-form')) {
    const updateUsernameForm = document.getElementById('update-username-form');
    const updatePasswordForm = document.getElementById('update-password-form');
    const updateUsernameBtn = document.getElementById('update-username-btn');
    const updatePasswordBtn = document.getElementById('update-password-btn');

    // Load and display current username
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    if (userDetails.username) {
        document.getElementById('current-username').value = userDetails.username;
    }

    updateUsernameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentUsername = document.getElementById('current-username').value;
        const newUsername = document.getElementById('new-username').value;

        // Show loading state
        updateUsernameBtn.disabled = true;
        updateUsernameBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';

        try {
            // Get current user details
            const userDetails = JSON.parse(localStorage.getItem('userDetails'));
            
            if (!userDetails) {
                showAlert('User details not found. Please login again.', 'error');
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }

            // Verify current username
            if (currentUsername !== userDetails.username) {
                showAlert('Current username is incorrect', 'error');
                return;
            }

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update username
            userDetails.username = newUsername;
            localStorage.setItem('userDetails', JSON.stringify(userDetails));

            // Show success message
            showAlert('Username updated successfully! Redirecting to login...', 'success');
            
            // Reset form and button
            updateUsernameForm.reset();
            
            // Force logout and redirect
            setTimeout(() => {
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Username update error:', error);
            showAlert('Update failed. Please try again.', 'error');
        } finally {
            // Reset button state if error occurs
            updateUsernameBtn.disabled = false;
            updateUsernameBtn.innerHTML = 'Update Username';
        }
    });

    updatePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;

        if (newPassword !== confirmNewPassword) {
            showAlert('New passwords do not match', 'error');
            return;
        }

        // Show loading state
        updatePasswordBtn.disabled = true;
        updatePasswordBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';

        try {
            // Get current user details
            const userDetails = JSON.parse(localStorage.getItem('userDetails'));
            
            if (!userDetails) {
                showAlert('User details not found. Please login again.', 'error');
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }

            // Verify current password
            if (currentPassword !== userDetails.password) {
                showAlert('Current password is incorrect', 'error');
                updatePasswordBtn.disabled = false;
                updatePasswordBtn.innerHTML = 'Update Password';
                return;
            }

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update password
            userDetails.password = newPassword;
            localStorage.setItem('userDetails', JSON.stringify(userDetails));

            // Show success message
            showAlert('Password updated successfully! Redirecting to login...', 'success');
            
            // Reset form
            updatePasswordForm.reset();

            // Force logout and redirect
            setTimeout(() => {
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Password update error:', error);
            showAlert('Update failed. Please try again.', 'error');
        } finally {
            // Reset button state if error occurs
            updatePasswordBtn.disabled = false;
            updatePasswordBtn.innerHTML = 'Update Password';
        }
    });
}

// Common Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Password visibility toggles
    const passwordToggles = document.querySelectorAll('[id^="toggle-"]');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const inputId = toggle.id.replace('toggle-', '');
            togglePasswordVisibility(inputId, toggle.id);
        });
    });

    // Logout functionality
    const logoutLinks = document.querySelectorAll('#logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Implement logout logic
            window.location.href = 'index.html';
        });
    });
});

// Form switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const sectionTitles = document.querySelectorAll('.section-title');
    const forms = document.querySelectorAll('.update-form');

    // Function to show form
    function showForm(formId) {
        forms.forEach(form => {
            if (form.id === formId) {
                form.style.display = 'block';
                form.classList.add('active');
                setTimeout(() => form.style.opacity = '1', 10);
            } else {
                form.style.opacity = '0';
                setTimeout(() => {
                    form.style.display = 'none';
                    form.classList.remove('active');
                }, 300);
            }
        });
    }

    // Set initial state - show username form
    showForm('username-form');

    sectionTitles.forEach(title => {
        title.addEventListener('click', function() {
            // Update active states for titles
            sectionTitles.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding form
            const targetFormId = `${this.dataset.section}-form`;
            showForm(targetFormId);
        });
    });
});

// Password visibility toggle
document.querySelectorAll('[id^="toggle-"]').forEach(button => {
    button.addEventListener('click', function() {
        const passwordInput = this.previousElementSibling;
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to encrypt/decrypt data
function encryptData(data, password) {
    // Simple XOR encryption for demonstration
    // In production, use a proper encryption library
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ password.charCodeAt(i % password.length));
    }
    return btoa(result);
}

function decryptData(encryptedData, password) {
    try {
        const data = atob(encryptedData);
        let result = '';
        for (let i = 0; i < data.length; i++) {
            result += String.fromCharCode(data.charCodeAt(i) ^ password.charCodeAt(i % password.length));
        }
        return result;
    } catch (error) {
        return null;
    }
} 