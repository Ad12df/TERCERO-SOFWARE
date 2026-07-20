/* ==========================================================================
   SETTINGS.JS - Lógica de la página de configuración
   Conectado al backend: perfil, contraseña y solicitudes de ascenso.
   ========================================================================== */

// =========================================================================
// INICIALIZACIÓN
// =========================================================================

document.addEventListener('DOMContentLoaded', function () {
    // Redirigir si no hay sesión
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    loadUserProfile();
    setupEventListeners();
    setupWriterRequestButton();
});

// =========================================================================
// CARGAR PERFIL DE USUARIO (GET /api/user/profile)
// =========================================================================

async function loadUserProfile() {
    // Datos iniciales desde localStorage para respuesta inmediata
    const localUser = (typeof getUserData === 'function') ? getUserData() : null;

    const nameField = document.getElementById('settingsName');
    const emailField = document.getElementById('settingsEmail');
    const roleField = document.getElementById('settingsRole');

    if (localUser) {
        if (nameField) nameField.value = localUser.name || '';
        if (emailField) emailField.value = localUser.email || '';
        if (roleField) roleField.value = formatRole(localUser.role || 'user');
        updateAvatar(localUser.name || localUser.email || 'A');
        syncTopbarProfile(localUser.name || localUser.email || '', localUser.role || 'user');
    }

    // Cargar datos reales desde el backend
    try {
        const res = await authFetch(`${API_URL}/user/profile`);
        const data = await res.json();

        if (data.success && data.data) {
            const u = data.data;
            if (nameField) nameField.value = u.name || '';
            if (emailField) emailField.value = u.email || '';
            if (roleField) roleField.value = formatRole(u.role || 'user');

            updateAvatar(u.name || u.email || 'A');
            syncTopbarProfile(u.name || u.email || '', u.role || 'user');

            // Actualizar localStorage para que otras páginas vean los cambios
            const stored = getUserData() || {};
            const updated = { ...stored, name: u.name, email: u.email, role: u.role };
            localStorage.setItem('user', JSON.stringify(updated));
        }
    } catch (err) {
        console.error('Error al cargar perfil:', err);
        showNotification('No se pudo cargar el perfil desde el servidor', 'error');
    }
}

function formatRole(role) {
    const roles = {
        'admin': 'Administrador',
        'escritor': 'Escritor',
        'user': 'Usuario'
    };
    return roles[String(role).toLowerCase()] || 'Usuario';
}

function updateAvatar(text) {
    const settingsAvatar = document.getElementById('settingsAvatar');
    if (settingsAvatar) {
        settingsAvatar.textContent = text.charAt(0).toUpperCase();
    }
}

function syncTopbarProfile(name, role) {
    const topbarAvatar = document.getElementById('avatarLetter');
    const topbarEmail = document.getElementById('profileEmail');
    const topbarRole = document.querySelector('.user-role');

    if (topbarAvatar) topbarAvatar.textContent = name.charAt(0).toUpperCase();
    if (topbarEmail) topbarEmail.textContent = name;
    if (topbarRole) topbarRole.textContent = formatRole(role);
}

// =========================================================================
// GUARDAR PERFIL (PUT /api/user/profile)
// =========================================================================

async function saveProfile() {
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

    try {
        const res = await authFetch(`${API_URL}/user/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            showNotification(data.message || 'Error al actualizar el perfil', 'error');
            return;
        }

        // Actualizar localStorage
        const stored = getUserData() || {};
        const updated = { ...stored, name, email };
        localStorage.setItem('user', JSON.stringify(updated));

        updateAvatar(name);
        syncTopbarProfile(name, stored.role || 'user');

        showNotification('Perfil actualizado correctamente', 'success');
    } catch (err) {
        console.error('Error al guardar perfil:', err);
        showNotification('No se pudo conectar con el servidor', 'error');
    }
}

// =========================================================================
// CAMBIAR CONTRASEÑA (PUT /api/user/password)
// =========================================================================

async function changePassword() {
    const currentEl = document.getElementById('currentPassword');
    const newEl = document.getElementById('newPassword');
    const confirmEl = document.getElementById('confirmPassword');

    if (!currentEl || !newEl || !confirmEl) return;

    const currentPassword = currentEl.value;
    const newPassword = newEl.value;
    const confirmPassword = confirmEl.value;

    // Validaciones del lado del cliente
    if (!currentPassword) {
        showNotification('Por favor, ingresa tu contraseña actual', 'error');
        currentEl.focus();
        return;
    }

    if (!newPassword) {
        showNotification('Por favor, ingresa la nueva contraseña', 'error');
        newEl.focus();
        return;
    }

    if (newPassword.length < 6) {
        showNotification('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        newEl.focus();
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        confirmEl.focus();
        return;
    }

    try {
        const res = await authFetch(`${API_URL}/user/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            showNotification(data.message || 'Error al cambiar la contraseña', 'error');
            return;
        }

        // Limpiar campos
        currentEl.value = '';
        newEl.value = '';
        confirmEl.value = '';

        showNotification('Contraseña actualizada correctamente', 'success');
    } catch (err) {
        console.error('Error al cambiar contraseña:', err);
        showNotification('No se pudo conectar con el servidor', 'error');
    }
}

// Alias para compatibilidad con el HTML del modal (si aún se usa savePassword)
function savePassword() {
    return changePassword();
}

// =========================================================================
// SOLICITAR ASCENSO A ESCRITOR (POST /api/moderation/writer-requests)
// =========================================================================

function setupWriterRequestButton() {
    const btn = document.getElementById('btnRequestWriter');
    if (!btn) return;

    const user = getUserData();
    const role = String(user?.role || 'user').toLowerCase();

    if (role === 'admin' || role === 'escritor') {
        btn.disabled = true;
        btn.classList.add('btn-disabled');
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            ${role === 'admin' ? 'Eres Administrador' : 'Eres Escritor'}
        `;
        const desc = document.getElementById('writerRequestDesc');
        if (desc) {
            desc.textContent = role === 'admin'
                ? 'Ya tienes el rol más alto en la plataforma.'
                : 'Ya tienes permisos de escritor para publicar libros.';
        }
    }
}

async function requestWriterPromotion() {
    const user = getUserData();
    const role = String(user?.role || 'user').toLowerCase();

    if (role === 'admin' || role === 'escritor') {
        showNotification(`Ya tienes el rol de ${formatRole(role)}`, 'info');
        return;
    }

    const btn = document.getElementById('btnRequestWriter');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Enviando...';
    }

    try {
        const res = await authFetch(`${API_URL}/moderation/writer-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: 'Solicitud de ascenso a escritor' })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
            showNotification(data.message || 'No se pudo enviar la solicitud', 'error');
            // Rehabilitar botón si el error es recuperable
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Solicitar
                `;
            }
            return;
        }

        showNotification('Solicitud enviada exitosamente. Un administrador la revisará.', 'success');

        if (btn) {
            btn.disabled = true;
            btn.classList.add('btn-disabled');
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Solicitud pendiente
            `;
            const desc = document.getElementById('writerRequestDesc');
            if (desc) {
                desc.textContent = 'Tu solicitud está en revisión. Un administrador la evaluará pronto.';
            }
        }
    } catch (err) {
        console.error('Error al solicitar ascenso:', err);
        showNotification('No se pudo conectar con el servidor', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Solicitar
            `;
        }
    }
}

// =========================================================================
// CONTACTAR ADMIN
// =========================================================================

function openContactModal() {
    showNotification('Escríbenos a: bibliotech@soporte.com', 'info');
}

// =========================================================================
// VISIBILIDAD DE CONTRASEÑA
// =========================================================================

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
}

// =========================================================================
// UTILIDADES
// =========================================================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remover notificaciones existentes
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

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

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =========================================================================
// EVENT LISTENERS
// =========================================================================

function setupEventListeners() {
    // Cerrar modal de contraseña con Escape o clic fuera (si existe el modal)
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) {
        passwordModal.addEventListener('click', function (e) {
            if (e.target === passwordModal) {
                closePasswordModal();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('passwordModal');
            if (modal && modal.style.display === 'flex') {
                closePasswordModal();
            }
        }
    });
}

// Funciones de modal (compatibilidad con el HTML que aún las referencia)
function openPasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        setTimeout(() => {
            const first = document.getElementById('currentPassword');
            if (first) first.focus();
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

// =========================================================================
// ANIMACIONES CSS
// =========================================================================

const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
    .btn-disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        vertical-align: middle;
        margin-right: 6px;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);