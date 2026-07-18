/* ==========================================================================
   SETTINGS.JS - Lógica de la página de configuración
   ========================================================================== */

// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadPreferences();
    setupEventListeners();
});

// ==========================================================================
// CARGAR PERFIL DE USUARIO
// ==========================================================================

function loadUserProfile() {
    const userData = JSON.parse(localStorage.getItem('bibliotech_user') || '{}');
    
    // Actualizar campos del perfil
    const nameField = document.getElementById('settingsName');
    const emailField = document.getElementById('settingsEmail');
    const avatarLetter = document.getElementById('settingsAvatar');
    
    if (nameField && userData.name) {
        nameField.value = userData.name;
    }
    if (emailField && userData.email) {
        emailField.value = userData.email;
    }
    
    // Actualizar avatar
    const displayName = nameField ? nameField.value : 'Admin@bibliotech.com';
    const initial = displayName.charAt(0).toUpperCase();
    if (avatarLetter) {
        avatarLetter.textContent = initial;
    }
    
    // Sincronizar con el perfil del topbar
    syncTopbarProfile(displayName);
}

function syncTopbarProfile(name) {
    const topbarAvatar = document.getElementById('avatarLetter');
    const topbarEmail = document.getElementById('profileEmail');
    const topbarRole = document.querySelector('.user-role');
    
    if (topbarAvatar) {
        topbarAvatar.textContent = name.charAt(0).toUpperCase();
    }
    if (topbarEmail) {
        topbarEmail.textContent = name;
    }
    if (topbarRole) {
        topbarRole.textContent = 'Bibliotecario Administrador';
    }
}

// ==========================================================================
// GUARDAR PERFIL
// ==========================================================================

function saveProfile() {
    const nameField = document.getElementById('settingsName');
    const emailField = document.getElementById('settingsEmail');
    
    if (!nameField || !emailField) return;
    
    const name = nameField.value.trim();
    const email = emailField.value.trim();
    
    // Validaciones
    if (!name) {
        showNotification('Por favor, ingresa tu nombre', 'error');
        nameField.focus();
        return;
    }
    
    if (!email || !isValidEmail(email)) {
        showNotification('Por favor, ingresa un correo válido', 'error');
        emailField.focus();
        return;
    }
    
    // Guardar en localStorage
    const userData = {
        name: name,
        email: email,
        role: 'Bibliotecario Administrador'
    };
    
    localStorage.setItem('bibliotech_user', JSON.stringify(userData));
    
    // Actualizar avatar
    const avatarLetter = document.getElementById('settingsAvatar');
    if (avatarLetter) {
        avatarLetter.textContent = name.charAt(0).toUpperCase();
    }
    
    // Sincronizar topbar
    syncTopbarProfile(name);
    
    showNotification('Perfil actualizado correctamente', 'success');
}

// ==========================================================================
// PREFERENCIAS DEL SISTEMA
// ==========================================================================

function loadPreferences() {
    const preferences = JSON.parse(localStorage.getItem('bibliotech_preferences') || '{}');
    
    // Modo Oscuro
    const darkModeToggle = document.getElementById('toggleDarkMode');
    if (darkModeToggle) {
        darkModeToggle.checked = preferences.darkMode || false;
        if (preferences.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }
    
    // Notificaciones
    const notificationsToggle = document.getElementById('toggleNotifications');
    if (notificationsToggle) {
        notificationsToggle.checked = preferences.notifications !== false;
    }
    
    // Idioma
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect && preferences.language) {
        languageSelect.value = preferences.language;
    }
}

function savePreferences() {
    const darkModeToggle = document.getElementById('toggleDarkMode');
    const notificationsToggle = document.getElementById('toggleNotifications');
    const languageSelect = document.getElementById('languageSelect');
    
    const preferences = {
        darkMode: darkModeToggle ? darkModeToggle.checked : false,
        notifications: notificationsToggle ? notificationsToggle.checked : true,
        language: languageSelect ? languageSelect.value : 'es'
    };
    
    localStorage.setItem('bibliotech_preferences', JSON.stringify(preferences));
}

// ==========================================================================
// MODO OSCURO
// ==========================================================================

function toggleDarkMode() {
    const darkModeToggle = document.getElementById('toggleDarkMode');
    if (!darkModeToggle) return;
    
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        showNotification('Modo oscuro activado', 'success');
    } else {
        document.body.classList.remove('dark-mode');
        showNotification('Modo claro activado', 'success');
    }
    
    savePreferences();
}

// ==========================================================================
// NOTIFICACIONES
// ==========================================================================

function toggleNotifications() {
    const notificationsToggle = document.getElementById('toggleNotifications');
    if (!notificationsToggle) return;
    
    if (notificationsToggle.checked) {
        showNotification('Notificaciones activadas', 'success');
    } else {
        showNotification('Notificaciones desactivadas', 'info');
    }
    
    savePreferences();
}

// ==========================================================================
// IDIOMA
// ==========================================================================

function changeLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    if (!languageSelect) return;
    
    const language = languageSelect.value;
    const languageNames = {
        'es': 'Español',
        'en': 'English',
        'fr': 'Français',
        'pt': 'Português'
    };
    
    showNotification(`Idioma cambiado a ${languageNames[language] || language}`, 'success');
    savePreferences();
}

// ==========================================================================
// SEGURIDAD
// ==========================================================================

function openPasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Limpiar campos
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        // Focus en el primer campo
        setTimeout(() => {
            document.getElementById('currentPassword').focus();
        }, 100);
    }
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function savePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validaciones
    if (!currentPassword) {
        showNotification('Por favor, ingresa tu contraseña actual', 'error');
        document.getElementById('currentPassword').focus();
        return;
    }
    
    if (!newPassword) {
        showNotification('Por favor, ingresa la nueva contraseña', 'error');
        document.getElementById('newPassword').focus();
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        document.getElementById('newPassword').focus();
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        document.getElementById('confirmPassword').focus();
        return;
    }
    
    // Simular cambio de contraseña (en una app real, esto iría al backend)
    showNotification('Contraseña actualizada correctamente', 'success');
    closePasswordModal();
}

function toggle2FA() {
    const toggle2FA = document.getElementById('toggle2FA');
    if (!toggle2FA) return;
    
    if (toggle2FA.checked) {
        showNotification('Autenticación de dos factores activada', 'success');
    } else {
        showNotification('Autenticación de dos factores desactivada', 'info');
    }
}

// ==========================================================================
// CAMBIAR AVATAR
// ==========================================================================

function changeAvatar() {
    // En una app real, esto abriría un selector de archivos o un modal de avatares
    const colors = [
        'linear-gradient(135deg, #1E4B65, #2D6A8F)',
        'linear-gradient(135deg, #059669, #10B981)',
        'linear-gradient(135deg, #D97706, #F59E0B)',
        'linear-gradient(135deg, #DC2626, #EF4444)',
        'linear-gradient(135deg, #7C3AED, #8B5CF6)',
        'linear-gradient(135deg, #0891B2, #06B6D4)'
    ];
    
    const avatar = document.getElementById('settingsAvatar');
    if (avatar) {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        avatar.style.background = randomColor;
        showNotification('Avatar actualizado', 'success');
    }
}

// ==========================================================================
// UTILIDADES
// ==========================================================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remover notificaciones existentes
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' : 
              type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>' :
              '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'}
        </svg>
        <span>${message}</span>
    `;
    
    // Estilos inline para la notificación
    notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.querySelector('svg').style.cssText = 'width: 20px; height: 20px;';
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================

function setupEventListeners() {
    // Cerrar modal al hacer clic fuera
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) {
        passwordModal.addEventListener('click', function(e) {
            if (e.target === passwordModal) {
                closePasswordModal();
            }
        });
    }
    
    // Cerrar modal con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePasswordModal();
        }
    });
    
    // Guardar preferencias al cambiar cualquier toggle
    document.querySelectorAll('.toggle-switch input').forEach(toggle => {
        toggle.addEventListener('change', savePreferences);
    });
}

// ==========================================================================
// ANIMACIONES CSS ADICIONALES
// ==========================================================================

// Añadir estilos de animación si no existen
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    /* Dark mode styles */
    body.dark-mode {
        --bg-primary: #0F172A;
        --bg-secondary: #1E293B;
        --bg-card: #1E293B;
        --text-primary: #F1F5F9;
        --text-secondary: #94A3B8;
        --border-color: #334155;
    }
    
    body.dark-mode .sidebar {
        background: #1E293B;
        border-right-color: #334155;
    }
    
    body.dark-mode .sidebar-logo {
        color: #F1F5F9;
    }
    
    body.dark-mode .menu-item {
        color: #94A3B8;
    }
    
    body.dark-mode .menu-item:hover,
    body.dark-mode .menu-item.active {
        background: rgba(255, 255, 255, 0.1);
        color: #FFFFFF;
    }
    
    body.dark-mode .topbar {
        background: #1E293B;
        border-bottom-color: #334155;
    }
    
    body.dark-mode .topbar-title {
        color: #F1F5F9;
    }
    
    body.dark-mode .user-name {
        color: #F1F5F9;
    }
    
    body.dark-mode .user-role {
        color: #64748B;
    }
    
    body.dark-mode .settings-card {
        background: #1E293B;
    }
    
    body.dark-mode .settings-card-header {
        border-bottom-color: #334155;
    }
    
    body.dark-mode .settings-card-title {
        color: #F1F5F9;
    }
    
    body.dark-mode .settings-card-subtitle {
        color: #64748B;
    }
    
    body.dark-mode .settings-card-body {
        background: #1E293B;
    }
    
    body.dark-mode .settings-toggle-item {
        background: #0F172A;
    }
    
    body.dark-mode .settings-toggle-item:hover {
        background: #334155;
    }
    
    body.dark-mode .toggle-label {
        color: #F1F5F9;
    }
    
    body.dark-mode .settings-field input {
        background: #0F172A;
        border-color: #334155;
        color: #F1F5F9;
    }
    
    body.dark-mode .settings-field input:focus {
        background: #0F172A;
        border-color: #3B82F6;
    }
    
    body.dark-mode .language-select {
        background: #0F172A;
        border-color: #334155;
        color: #F1F5F9;
    }
    
    body.dark-mode .security-item {
        background: #0F172A;
    }
    
    body.dark-mode .security-item:hover {
        background: #334155;
    }
    
    body.dark-mode .security-info h4 {
        color: #F1F5F9;
    }
    
    body.dark-mode .btn-security {
        background: #1E293B;
        border-color: #3B82F6;
        color: #3B82F6;
    }
    
    body.dark-mode .btn-security:hover {
        background: #3B82F6;
        color: #FFFFFF;
    }
    
    body.dark-mode .settings-actions {
        border-top-color: #334155;
    }
    
    body.dark-mode .modal-content {
        background: #1E293B;
    }
    
    body.dark-mode .modal-title {
        color: #F1F5F9;
    }
    
    body.dark-mode .input-pill input {
        background: #0F172A;
        border-color: #334155;
        color: #F1F5F9;
    }
    
    body.dark-mode .input-pill input:focus {
        background: #0F172A;
        border-color: #3B82F6;
    }
    
    body.dark-mode .modal-close {
        color: #94A3B8;
    }
    
    body.dark-mode .modal-close:hover {
        color: #F1F5F9;
    }
`;
document.head.appendChild(styleSheet);