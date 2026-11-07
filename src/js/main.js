import { APP_VERSION } from './config.js';
import { initToastCloser } from './utils/toast.js';
import { initAudio } from './utils/audio.js';
import { initNavbar } from './features/navbar.js';
import { initTracker } from './features/tracker.js';
import {
    renderNotificationBanner,
    renderFloatBtn,
    renderScrollNav,
    renderFooter,
    renderLightbox,
    renderMessageModal
} from './shared-components.js';

// Controle do splash entre paginas (nao vaza entre abas, ao contrario de window.name)
const SKIP_SPLASH_KEY = 'skipSplash';

function consumeSkipSplash() {
    try {
        if (sessionStorage.getItem(SKIP_SPLASH_KEY)) {
            sessionStorage.removeItem(SKIP_SPLASH_KEY);
            return true;
        }
    } catch (e) {}
    return false;
}

window.addEventListener('pageshow', function (e) {
    const overlay = document.getElementById('page-transition-overlay');
    if (overlay) overlay.remove();

    if (e.persisted) {
        const splash = document.getElementById('splash');
        if (splash && consumeSkipSplash()) {
            splash.classList.add('quick-fade-out');
            setTimeout(function () {
                if (splash.parentNode) splash.remove();
            }, 200);
        }
    }
});

function initReveal() {
    const els = document.querySelectorAll('.reveal');
    let revealTicking = false;
    const onScroll = () => {
        if (revealTicking) return;
        revealTicking = true;
        requestAnimationFrame(() => {
            els.forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight - 80) el.classList.add('visible');
            });
            revealTicking = false;
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function navigateTo(url) {
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('active'); });
    setTimeout(function () { window.location = url; }, 350);
}

function initPageTransitions() {
    if (!document.getElementById('splash')) {
        document.body.classList.add('page-in');
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link || link.target) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('//')) return;

        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', href);
            }
            return;
        }

        try { sessionStorage.setItem(SKIP_SPLASH_KEY, '1'); } catch (err) {}
        e.preventDefault();

        if (link.dataset.back !== undefined) {
            if (window.history.length > 1) {
                history.back();
                return;
            }
        }

        navigateTo(href);
    });
}

function initSplash() {
    const splash = document.getElementById('splash');
    if (!splash) return;

    if (window.location.pathname !== '/') {
        splash.remove();
        return;
    }

    if (consumeSkipSplash()) {
        splash.classList.add('quick-fade-out');
        setTimeout(function () { splash.remove(); }, 200);
        return;
    }

    setTimeout(function() {
        splash.classList.add('fade-out');
        setTimeout(function() {
            splash.remove();
        }, 600);
    }, 2500);
}

function initFloatBtn() {
    const rsvpFloatBtn = document.getElementById('rsvp-float-btn');
    const rsvpSection = document.getElementById('rsvp');
    let footerVisible = false;

    const update = () => {
        if (!rsvpFloatBtn) return;

        // Some ao alcançar o rodapé (fim de presentes/conteúdo) em todas as páginas
        if (footerVisible) {
            rsvpFloatBtn.classList.remove('show');
            return;
        }

        if (!rsvpSection) {
            rsvpFloatBtn.classList.add('show');
            return;
        }

        if (window.scrollY <= 400) {
            rsvpFloatBtn.classList.remove('show');
            return;
        }

        const rect = rsvpSection.getBoundingClientRect();
        const rsvpAbove = rect.bottom <= 80;
        const rsvpBelow = rect.top >= window.innerHeight;

        rsvpFloatBtn.classList.toggle('show', rsvpAbove || rsvpBelow);
    };

    const footer = document.querySelector('.footer');
    if (footer && 'IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            footerVisible = entries[0].isIntersecting;
            update();
        }, { threshold: 0 }).observe(footer);
    }

    let floatTicking = false;
    window.addEventListener('scroll', () => {
        if (floatTicking) return;
        floatTicking = true;
        requestAnimationFrame(() => { update(); floatTicking = false; });
    }, { passive: true });
    update();

    if (rsvpFloatBtn && rsvpSection) {
        rsvpFloatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            rsvpSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function initScrollNav() {
    const upBtn = document.getElementById('scroll-up-btn');
    const downBtn = document.getElementById('scroll-down-btn');
    if (!upBtn || !downBtn) return;

    upBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    downBtn.addEventListener('click', function () {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    // 'subir' aparece depois de rolar para baixo; 'descer' aparece no topo.
    function update(showUp, showDown) {
        upBtn.classList.toggle('visible', showUp);
        downBtn.classList.toggle('visible', showDown);
    }

    const hero = document.getElementById('inicio') || document.querySelector('.gallery-header');
    if (hero) {
        let atTop = true;
        const observer = new IntersectionObserver(function (entries) {
            atTop = entries[0].isIntersecting;
            update(!atTop, atTop);
        }, { threshold: 0 });
        observer.observe(hero);
        // Bônus: garante que ambos somem no meio da página (evita flutuar sobre conteúdo)
        let navTicking = false;
        window.addEventListener('scroll', function () {
            if (navTicking) return;
            navTicking = true;
            requestAnimationFrame(function () {
                const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 120);
                if (!atTop && !nearBottom) update(false, false);
                navTicking = false;
            });
        }, { passive: true });
    } else {
        let ticking = false;
        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                const atTop = window.scrollY < 100;
                update(!atTop, atTop);
                ticking = false;
            });
        }, { passive: true });
    }
}

// Nucleo comum a todas as paginas. Cada pagina chama initCore()
// e depois inicializa apenas as features que ela usa.
export function initCore() {
    console.log('%cBodas M&L v' + APP_VERSION, 'color:#c38322');
    initTracker();
    initSplash();

    renderNotificationBanner();
    renderScrollNav();
    renderFloatBtn();
    renderFooter();
    renderLightbox();
    renderMessageModal();

    document.body.classList.add('js-ready');

    initToastCloser();
    initAudio();
    initReveal();
    initPageTransitions();
    initScrollNav();
    initFloatBtn();
    initNavbar();
}
