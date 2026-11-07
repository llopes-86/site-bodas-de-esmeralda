export function initNavbar() {
    const nav = document.getElementById('navbar');
    const menu = document.getElementById('nav-mobile');
    const toggle = document.getElementById('nav-toggle');

    let navTicking = false;
    window.addEventListener('scroll', () => {
        if (navTicking) return;
        navTicking = true;
        requestAnimationFrame(() => {
            if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
            navTicking = false;
        });
    }, { passive: true });

    if (toggle) {
        toggle.addEventListener('click', () => {
            const open = menu.classList.toggle('open');
            toggle.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Fechar Menu' : 'Abrir Menu');
            toggle.innerHTML = open ? '<i class="fas fa-times" aria-hidden="true"></i>' : '<i class="fas fa-bars" aria-hidden="true"></i>';
            if (open) menu.querySelector('a')?.focus();
        });
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'nav-mobile');
        // Harden: ícone inicial também decorativo.
        const initialIcon = toggle.querySelector('i');
        initialIcon?.setAttribute('aria-hidden', 'true');
        // Harden: Escape fecha o menu móvel e devolve o foco ao botão.
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('open')) {
                menu.classList.remove('open');
                toggle.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Abrir Menu');
                toggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
                toggle.focus();
            }
        });
    }

    menu?.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
        menu.classList.remove('open');
        if (toggle) {
            toggle.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Abrir Menu');
            toggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
        }
    }));
}