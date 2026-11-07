export function showToast(isSuccess, title, message) {
    const banner = document.getElementById('notification-banner');
    if (!banner) return;
    
    const icon = banner.querySelector('i');
    document.getElementById('notification-title').innerText = title;
    document.getElementById('notification-msg').innerText = message;
    
    banner.className = `notification-banner ${isSuccess ? '' : 'error'}`;
    // Harden: erro anuncia como alerta assertivo; sucesso como status educado.
    banner.setAttribute('role', isSuccess ? 'status' : 'alert');
    banner.setAttribute('aria-live', isSuccess ? 'polite' : 'assertive');
    icon.className = isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    icon.setAttribute('aria-hidden', 'true');
    
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 6000);
}

export function initToastCloser() {
    document.getElementById('close-notification')?.addEventListener('click', () => {
        document.getElementById('notification-banner').classList.remove('show');
    });
}