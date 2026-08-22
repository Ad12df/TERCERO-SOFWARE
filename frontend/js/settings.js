/* ==========================================================================
   SETTINGS.JS - Lógica de la página de configuración
   ========================================================================== */

// =========================================================================
// INICIALIZACIÓN
// =========================================================================

document.addEventListener('DOMContentLoaded', function () {
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
    const localUser = (typeof getUserData === 'function') ? getUserData() : null;

    if (localUser) {
        applyProfileToUI(localUser);
    }

    try {
        const res = await authFetch(`${API_URL}/user/profile`);
        const data = await res.json();

        if (data.success && data.data) {
            const u = data.data;
            applyProfileToUI(u);

            // Actualizar localStorage
            const stored = getUserData() || {};
            const updated = { ...stored, name: u.name, email: u.email, role: u.role };
            localStorage.setItem('user', JSON.stringify(updated));
        }
    } catch (err) {
        console.error('Error al cargar perfil:', err);
        showNotification('No se pudo cargar el perfil desde el servidor', 'error');
    }
}

/**
 * Aplica los datos del usuario a todos los elementos del DOM
 */
function applyProfileToUI(user) {
    const name  = user.name  || user.email || '';
    const email = user.email || '';
    const role  = user.role  || 'user';

    // ── Datos de solo lectura en el perfil ──
    const displayName  = document.getElementById('displayName');
    const displayEmail = document.getElementById('displayEmail');
    const roleChip     = document.getElementById('roleChip');

    if (displayName)  displayName.textContent  = name;
    if (displayEmail) displayEmail.textContent = email;
    if (roleChip) {
        roleChip.textContent = formatRole(role);
        roleChip.className = 'role-chip chip-' + String(role).toLowerCase();
    }

    // ── Avatar principal (settings) ──
    updateAvatarFromStorage(name);

    // ── Topbar ──
    syncTopbarProfile(name, role);
}

/**
 * Actualiza el avatar grande de settings y el topbar.
 * Si hay foto en localStorage la usa; de lo contrario muestra inicial.
 */
function updateAvatarFromStorage(nameOrEmail) {
    const initial = (nameOrEmail || 'A').charAt(0).toUpperCase();
    const savedPhoto = localStorage.getItem('avatarPhoto');

    // ── Settings avatar ──
    const settingsAvatar    = document.getElementById('settingsAvatar');
    const settingsAvatarImg = document.getElementById('settingsAvatarImg');

    if (savedPhoto) {
        if (settingsAvatarImg) {
            settingsAvatarImg.src     = savedPhoto;
            settingsAvatarImg.style.display = 'block';
        }
        if (settingsAvatar) settingsAvatar.style.display = 'none';
    } else {
        if (settingsAvatarImg) settingsAvatarImg.style.display = 'none';
        if (settingsAvatar) {
            settingsAvatar.style.display = '';
            settingsAvatar.textContent   = initial;
        }
    }

    // ── Topbar avatar ──
    refreshTopbarAvatar(initial, savedPhoto);
}

function refreshTopbarAvatar(initial, photoDataUrl) {
    const topbarImg    = document.getElementById('topbarAvatarImg');
    const topbarLetter = document.getElementById('avatarLetter');

    if (photoDataUrl) {
        if (topbarImg) {
            topbarImg.src          = photoDataUrl;
            topbarImg.style.display = 'block';
        }
        if (topbarLetter) topbarLetter.style.display = 'none';
    } else {
        if (topbarImg) topbarImg.style.display = 'none';
        if (topbarLetter) {
            topbarLetter.style.display = '';
            topbarLetter.textContent   = initial;
        }
    }
}

function syncTopbarProfile(name, role) {
    const topbarEmail = document.getElementById('profileEmail');
    const topbarRole  = document.querySelector('.user-role');

    if (topbarEmail) topbarEmail.textContent = name;
    if (topbarRole)  topbarRole.textContent  = formatRole(role);

    // Actualizar letra/foto del avatar
    const savedPhoto = localStorage.getItem('avatarPhoto');
    refreshTopbarAvatar((name || 'A').charAt(0).toUpperCase(), savedPhoto);
}

// =========================================================================
// CAMBIO DE FOTO DE PERFIL (solo frontend – guarda en localStorage)
// =========================================================================

function previewAndSaveAvatar(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
        showNotification('Por favor selecciona una imagen válida', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const dataUrl = e.target.result;

        // Guardar en localStorage para persistencia entre páginas
        localStorage.setItem('avatarPhoto', dataUrl);

        // Aplicar inmediatamente
        const user = getUserData() || {};
        updateAvatarFromStorage(user.name || user.email || 'A');
        if (typeof window.renderGlobalAvatar === 'function') {
            window.renderGlobalAvatar();
        }

        showNotification('Foto de perfil actualizada', 'success');
    };
    reader.readAsDataURL(file);
}

// =========================================================================
// FORMATEAR ROL
// =========================================================================

function formatRole(role) {
    const roles = {
        'admin':    'Administrador',
        'escritor': 'Escritor',
        'user':     'Usuario'
    };
    return roles[String(role).toLowerCase()] || 'Usuario';
}

// =========================================================================
// CAMBIAR CONTRASEÑA (PUT /api/user/password)
// =========================================================================

async function changePassword() {
    const currentEl  = document.getElementById('currentPassword');
    const newEl      = document.getElementById('newPassword');
    const confirmEl  = document.getElementById('confirmPassword');

    if (!currentEl || !newEl || !confirmEl) return;

    const currentPassword = currentEl.value;
    const newPassword     = newEl.value;
    const confirmPassword = confirmEl.value;

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

    const btn = document.getElementById('btnSavePassword');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Actualizando...';
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

        currentEl.value = '';
        newEl.value     = '';
        confirmEl.value = '';

        showNotification('Contraseña actualizada correctamente', 'success');
    } catch (err) {
        console.error('Error al cambiar contraseña:', err);
        showNotification('No se pudo conectar con el servidor', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Actualizar Contraseña
            `;
        }
    }
}

// Alias compatibilidad
function savePassword() { return changePassword(); }

// =========================================================================
// SOLICITAR ASCENSO A ESCRITOR
// =========================================================================

function setupWriterRequestButton() {
    const btn  = document.getElementById('btnRequestWriter');
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

        showNotification('Solicitud enviada. Un administrador la revisará pronto.', 'success');

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
            if (desc) desc.textContent = 'Tu solicitud está en revisión. Un administrador la evaluará pronto.';
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
// NOTIFICACIONES
// =========================================================================

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' :
              type === 'error'   ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>' :
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
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 360px;
    `;

    notification.querySelector('svg').style.cssText = 'width: 20px; height: 20px; flex-shrink: 0;';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3500);
}

// =========================================================================
// EVENT LISTENERS
// =========================================================================

function setupEventListeners() {
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('passwordModal');
            if (modal && modal.style.display === 'flex') closePasswordModal();
        }
    });
}

// Funciones de modal legacy (compatibilidad)
function openPasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
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
// ANIMACIONES CSS INYECTADAS
// =========================================================================

const settingsStyleSheet = document.createElement('style');
settingsStyleSheet.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to   { opacity: 0; transform: translateX(100px); }
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .btn-disabled {
        opacity: 0.6 !important;
        cursor: not-allowed !important;
    }
    .spinner {
        display: inline-block;
        width: 14px; height: 14px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        vertical-align: middle;
        margin-right: 6px;
    }
`;
document.head.appendChild(settingsStyleSheet);