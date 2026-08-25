/* ==========================================================================
   SETTINGS.JS - Logica de la pagina de configuracion (v3 - Con tabs y control parental)
   ========================================================================== */

// =========================================================================
// INICIALIZACION
// =========================================================================

document.addEventListener('DOMContentLoaded', function () {
    if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    loadUserProfile();
    setupEventListeners();
    setupWriterRequestButton();
    initParentalControls();
});

// =========================================================================
// SISTEMA DE TABS
// =========================================================================

/**
 * Cambia el tab activo en la seccion de configuracion
 * @param {string} tabName - Nombre del tab: 'cuenta' | 'parental'
 */
function switchTab(tabName) {
    // Desactivar todos los botones y paneles
    document.querySelectorAll('.settings-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.settings-tab-panel').forEach(panel => panel.classList.remove('active'));

    // Activar el boton seleccionado
    const activeBtn = document.getElementById('tab-btn-' + tabName);
    if (activeBtn) activeBtn.classList.add('active');

    // Activar el panel correspondiente
    const activePanel = document.getElementById('tab-panel-' + tabName);
    if (activePanel) activePanel.classList.add('active');

    // Guardar el tab activo en sessionStorage
    sessionStorage.setItem('settingsActiveTab', tabName);
}

/**
 * Restaura el tab activo al recargar la pagina
 */
function restoreActiveTab() {
    const savedTab = sessionStorage.getItem('settingsActiveTab') || 'cuenta';
    switchTab(savedTab);
}

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
            if (u.foto) {
                localStorage.setItem('avatarPhoto', u.foto);
            }
            applyProfileToUI(u);

            // Actualizar localStorage
            const stored = getUserData() || {};
            const updated = { ...stored, name: u.name, email: u.email, role: u.role, foto: u.foto };
            localStorage.setItem('user', JSON.stringify(updated));
            if (typeof window.renderGlobalAvatar === 'function') {
                window.renderGlobalAvatar();
            }
        }
    } catch (err) {
        console.error('Error al cargar perfil:', err);
        showNotification('No se pudo cargar el perfil desde el servidor', 'error');
    }

    // Restaurar tab activo despues de cargar
    restoreActiveTab();
}

/**
 * Aplica los datos del usuario a todos los elementos del DOM
 * incluyendo el panel lateral de navegacion
 */
function applyProfileToUI(user) {
    const name  = user.name  || user.email || '';
    const email = user.email || '';
    const role  = user.role  || 'user';

    // ── Datos en el panel de navegacion (siempre visible) ──
    const navProfileName  = document.getElementById('navProfileName');
    const navProfileEmail = document.getElementById('navProfileEmail');
    const navRoleChip     = document.getElementById('navRoleChip');

    if (navProfileName)  navProfileName.textContent  = name || '---';
    if (navProfileEmail) navProfileEmail.textContent = email || '---';
    if (navRoleChip) {
        navRoleChip.textContent = formatRole(role);
        navRoleChip.className = 'role-chip chip-' + String(role).toLowerCase();
    }

    // ── Avatar del panel de navegacion ──
    updateNavAvatar(name, user.foto);

    // ── Datos de solo lectura en el perfil del tab Cuenta ──
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
    updateAvatarFromStorage(name, user.foto);

    // ── Topbar ──
    syncTopbarProfile(name, role);
}

/**
 * Actualiza el avatar del panel lateral de navegacion
 */
function updateNavAvatar(nameOrEmail, explicitPhoto) {
    const initial = (nameOrEmail || 'A').charAt(0).toUpperCase();
    const savedPhoto = explicitPhoto || localStorage.getItem('avatarPhoto');

    const navImg    = document.getElementById('navAvatarImg');
    const navLetter = document.getElementById('navAvatarLetter');

    if (savedPhoto) {
        if (navImg) {
            navImg.src          = savedPhoto;
            navImg.style.display = 'block';
        }
        if (navLetter) navLetter.style.display = 'none';
    } else {
        if (navImg) navImg.style.display = 'none';
        if (navLetter) {
            navLetter.style.display = '';
            navLetter.textContent   = initial;
        }
    }
}

/**
 * Actualiza el avatar grande de settings y el topbar.
 */
function updateAvatarFromStorage(nameOrEmail, explicitPhoto) {
    const initial = (nameOrEmail || 'A').charAt(0).toUpperCase();
    const savedPhoto = explicitPhoto || localStorage.getItem('avatarPhoto');

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

    // ── Nav panel avatar ──
    updateNavAvatar(nameOrEmail, savedPhoto);

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
// CAMBIO DE FOTO DE PERFIL (Sube a Supabase Storage y guarda en Neon DB)
// =========================================================================

async function previewAndSaveAvatar(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
        showNotification('Por favor selecciona una imagen valida', 'error');
        return;
    }

    // 1. Mostrar vista previa local mientras se sube
    const reader = new FileReader();
    reader.onload = function (e) {
        updateAvatarFromStorage(null, e.target.result);
    };
    reader.readAsDataURL(file);

    // 2. Subir al backend -> Supabase Storage (bucket 'Perfil') + Neon DB (tabla 'users')
    const formData = new FormData();
    formData.append('foto', file);

    const token = (typeof getToken === 'function') ? getToken() : localStorage.getItem('token');

    try {
        showNotification('Subiendo foto de perfil a Supabase...', 'info');

        const res = await fetch(`${API_URL}/user/avatar`, {
            method: 'PUT',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            showNotification(data.message || 'Error al subir la imagen', 'error');
            return;
        }

        const publicUrl = data.data?.foto;
        if (publicUrl) {
            localStorage.setItem('avatarPhoto', publicUrl);
            const stored = (typeof getUserData === 'function' ? getUserData() : null) || {};
            localStorage.setItem('user', JSON.stringify({ ...stored, foto: publicUrl }));

            updateAvatarFromStorage(stored.name || stored.email || 'A', publicUrl);

            if (typeof window.renderGlobalAvatar === 'function') {
                window.renderGlobalAvatar();
            }
        }

        showNotification('Foto de perfil guardada exitosamente en Supabase y base de datos', 'success');
    } catch (err) {
        console.error('Error al subir foto de perfil:', err);
        showNotification('No se pudo guardar la imagen en el servidor', 'error');
    }
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
// CAMBIAR CONTRASENA (PUT /api/user/password)
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
        showNotification('Por favor, ingresa tu contrasena actual', 'error');
        currentEl.focus();
        return;
    }
    if (!newPassword) {
        showNotification('Por favor, ingresa la nueva contrasena', 'error');
        newEl.focus();
        return;
    }
    if (newPassword.length < 6) {
        showNotification('La nueva contrasena debe tener al menos 6 caracteres', 'error');
        newEl.focus();
        return;
    }
    if (newPassword !== confirmPassword) {
        showNotification('Las contrasenas no coinciden', 'error');
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
            showNotification(data.message || 'Error al cambiar la contrasena', 'error');
            return;
        }

        currentEl.value = '';
        newEl.value     = '';
        confirmEl.value = '';

        showNotification('Contrasena actualizada correctamente', 'success');
    } catch (err) {
        console.error('Error al cambiar contrasena:', err);
        showNotification('No se pudo conectar con el servidor', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Actualizar Contrasena
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
                ? 'Ya tienes el rol mas alto en la plataforma.'
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

        showNotification('Solicitud enviada. Un administrador la revisara pronto.', 'success');

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
            if (desc) desc.textContent = 'Tu solicitud esta en revision. Un administrador la evaluara pronto.';
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
    showNotification('Escribenos a: clickylee@soporte.com', 'info');
}

// =========================================================================
// VISIBILIDAD DE CONTRASENA
// =========================================================================

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
}

// =========================================================================
// CONTROL PARENTAL
// =========================================================================

/** Clave de localStorage para los ajustes de control parental */
const PARENTAL_SETTINGS_KEY = 'parentalSettings';

/** Mapa maestro de filtros con sus categorias asociadas */
const PARENTAL_FILTER_CATEGORIES = {
    'filter-erotico': ['Erótico', 'Erotico'],
    'filter-sexualidad': ['Sexualidad'],
    'filter-romantico': ['Romántico', 'Romantico'],
    'filter-terror': ['Terror'],
    'filter-belico': ['Terrorismo', 'Bélico', 'Belico', 'Nazis'],
    'filter-thriller': ['Thriller', 'Novela Negra', 'Policial', 'Policíaco', 'Policiaco', 'Espionaje'],
    'filter-distopia': ['Distopía', 'Distopia', 'Ucronía', 'Ucronia']
};

/**
 * Normaliza un texto para comparaciones seguras sin tildes ni mayusculas
 */
function normalizeCategoryStr(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/**
 * Lee los ajustes guardados de control parental desde localStorage
 * @returns {{ master: boolean, filters: Object, blockedCategories: string[] }}
 */
function loadParentalSettings() {
    try {
        const raw = localStorage.getItem(PARENTAL_SETTINGS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                master: Boolean(parsed.master),
                filters: parsed.filters || {},
                blockedCategories: Array.isArray(parsed.blockedCategories) ? parsed.blockedCategories : []
            };
        }
    } catch (e) {
        console.warn('Error al parsear parentalSettings:', e);
    }
    return { master: false, filters: {}, blockedCategories: [] };
}

/**
 * Guarda los ajustes de control parental en localStorage y emite evento global
 */
function saveParentalSettings() {
    const master = document.getElementById('toggleParentalMaster')?.checked || false;
    const filters = {};
    const blockedCategories = [];

    document.querySelectorAll('.parental-filter-item input[type="checkbox"]').forEach(cb => {
        filters[cb.id] = cb.checked;
        if (cb.checked) {
            const fromAttr = (cb.getAttribute('data-categories') || '').split(',').map(c => c.trim()).filter(Boolean);
            const fromMap = PARENTAL_FILTER_CATEGORIES[cb.id] || [];
            const combined = Array.from(new Set([...fromAttr, ...fromMap]));
            blockedCategories.push(...combined);
        }
    });

    const settings = {
        master,
        filters,
        blockedCategories: Array.from(new Set(blockedCategories))
    };

    localStorage.setItem(PARENTAL_SETTINGS_KEY, JSON.stringify(settings));

    // Disparar evento personalizado para sincronizar en vivo con books.js y otras vistas
    window.dispatchEvent(new CustomEvent('parentalSettingsChanged', { detail: settings }));
}

/**
 * Inicializa los controles de control parental cargando los ajustes guardados
 */
function initParentalControls() {
    const settings = loadParentalSettings();
    const masterToggle = document.getElementById('toggleParentalMaster');

    if (masterToggle) {
        masterToggle.checked = settings.master;
    }

    // Restaurar estado de cada filtro individual
    if (settings.filters) {
        Object.entries(settings.filters).forEach(([id, checked]) => {
            const el = document.getElementById(id);
            if (el) el.checked = Boolean(checked);
        });
    }

    // Aplicar estado visual inicial y resumen
    applyParentalState(settings.master);
    updateParentalSummary();
}

/**
 * Callback cuando el toggle maestro cambia
 */
function onMasterToggleChange(checkbox) {
    const enabled = checkbox.checked;
    applyParentalState(enabled);
    saveParentalSettings();
    updateParentalSummary();

    if (enabled) {
        showNotification('Control parental activado correctamente', 'success');
    } else {
        showNotification('Control parental desactivado (se muestra todo el catálogo)', 'info');
    }
}

/**
 * Callback cuando cualquier filtro individual cambia
 */
function onParentalFilterChange() {
    saveParentalSettings();
    updateParentalSummary();
}

/**
 * Aplica el estado visual del control parental (activo/inactivo)
 * Habilita o deshabilita los grupos de tarjetas segun el toggle maestro
 */
function applyParentalState(enabled) {
    const groupCards = document.querySelectorAll('.parental-group-card');
    groupCards.forEach(card => {
        if (enabled) {
            card.classList.remove('disabled');
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        } else {
            card.classList.add('disabled');
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
        }
    });

    // Actualizar badge de estado
    const badge    = document.getElementById('parentalStatusBadge');
    const statusEl = document.getElementById('parentalStatusText');

    if (badge && statusEl) {
        if (enabled) {
            badge.className = 'parental-status-badge active';
            badge.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Control parental activo — Filtros aplicados al catálogo de libros</span>
            `;
        } else {
            badge.className = 'parental-status-badge inactive';
            badge.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                <span>Control parental desactivado — Se muestra todo el contenido</span>
            `;
        }
    }
}

/**
 * Actualiza el resumen de categorias bloqueadas al pie de la seccion
 */
function updateParentalSummary() {
    const masterEnabled = document.getElementById('toggleParentalMaster')?.checked || false;
    const summaryCard   = document.getElementById('parentalSummary');
    const tagsContainer = document.getElementById('parentalBlockedTags');

    if (!summaryCard || !tagsContainer) return;

    if (!masterEnabled) {
        summaryCard.style.display = 'none';
        return;
    }

    const blockedCategories = [];

    document.querySelectorAll('.parental-filter-item input[type="checkbox"]:checked').forEach(cb => {
        const fromAttr = (cb.getAttribute('data-categories') || '').split(',').map(c => c.trim()).filter(Boolean);
        const fromMap  = PARENTAL_FILTER_CATEGORIES[cb.id] || [];
        const combined = [...fromAttr, ...fromMap];
        combined.forEach(c => {
            if (!blockedCategories.includes(c)) blockedCategories.push(c);
        });
    });

    if (blockedCategories.length === 0) {
        summaryCard.style.display = 'none';
        return;
    }

    summaryCard.style.display = 'block';
    tagsContainer.innerHTML = blockedCategories.map(cat => `
        <span class="parental-blocked-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
            ${cat}
        </span>
    `).join('');
}

/**
 * Funcion global para que books.js y otros modulos obtengan
 * las categorias actualmente bloqueadas por el control parental.
 *
 * @returns {string[]} - Array de categorias bloqueadas. Vacio si el control parental esta desactivado.
 */
window.getBlockedCategories = function () {
    const settings = loadParentalSettings();
    if (!settings.master) return [];

    if (Array.isArray(settings.blockedCategories) && settings.blockedCategories.length > 0) {
        return settings.blockedCategories;
    }

    const blocked = [];
    if (settings.filters) {
        Object.entries(settings.filters).forEach(([id, checked]) => {
            if (!checked) return;
            const fromMap = PARENTAL_FILTER_CATEGORIES[id] || [];
            blocked.push(...fromMap);
        });
    }
    return Array.from(new Set(blocked));
};

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