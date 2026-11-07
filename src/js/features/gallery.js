import { createSlideshow } from '../components/slideshow.js';
import { attachModalNav } from '../components/modal-swipe.js';

export function initGallery() {
    const dialog = document.getElementById('lightbox-modal');
    if (!dialog) return;

    const imgEl = document.getElementById('lightbox-img');
    const items = document.querySelectorAll('.gallery-item img');
    let images = Array.from(items).map(img => img.src);
    let currentIdx = 0;

    items.forEach((img, idx) => {
        const item = img.parentElement;
        // Harden: nome acessível derivado do alt real (sem inventar conteúdo).
        const alt = img.getAttribute('alt') || `Foto ${idx + 1} do casal`;
        if (!item.hasAttribute('aria-label')) item.setAttribute('aria-label', `Ampliar ${alt}`);
        if (!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '0');
        if (!item.hasAttribute('role')) item.setAttribute('role', 'button');
        item.addEventListener('click', () => openLightbox(idx));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); }
        });
    });

    const close = () => { dialog.close(); imgEl.classList.remove('zoomed'); imgEl.style.transform = ''; imgEl.style.left = ''; imgEl.style.top = ''; };
    const next = () => { currentIdx = (currentIdx + 1) % images.length; syncLightbox(); };
    const prev = () => { currentIdx = (currentIdx - 1 + images.length) % images.length; syncLightbox(); };
    const alts = Array.from(items).map(img => img.getAttribute('alt') || 'Foto do casal');

    function syncLightbox() {
        imgEl.src = images[currentIdx];
        imgEl.alt = alts[currentIdx];
        imgEl.classList.remove('zoomed'); imgEl.style.transform = ''; imgEl.style.left = ''; imgEl.style.top = '';
    }

    let lastFocused = null;
    function openLightbox(idx) {
        currentIdx = idx;
        lastFocused = document.activeElement;
        syncLightbox();
        if (!dialog.open) dialog.showModal();
        document.getElementById('lightbox-close')?.focus();
    }
    // Retorna o foco só se o card ainda está visível — focar slide fora da
    // tela (track transladado) rola a página descontroladamente.
    dialog.addEventListener('close', () => {
        if (!lastFocused?.isConnected) return;
        const r = lastFocused.getBoundingClientRect();
        const visible = r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
        if (visible) lastFocused.focus?.();
    });

    attachModalNav({
        dialog,
        closeBtn: document.getElementById('lightbox-close'),
        prevBtn: document.getElementById('lightbox-prev'),
        nextBtn: document.getElementById('lightbox-next'),
        onClose: close,
        onPrev: prev,
        onNext: next
    });

    /* ── Zoom + arraste no lightbox ── */
    let dragging = false, touchMoved = false, dragX = 0, dragY = 0, posX = 0, posY = 0;

    imgEl.addEventListener('click', function (e) {
        if (dragging || touchMoved) { touchMoved = false; return; }
        imgEl.classList.toggle('zoomed');
        if (!imgEl.classList.contains('zoomed')) {
            imgEl.style.transform = '';
            imgEl.style.left = '';
            imgEl.style.top = '';
            posX = 0; posY = 0;
        }
    });

    imgEl.addEventListener('mousedown', function (e) {
        if (!imgEl.classList.contains('zoomed')) return;
        dragging = true;
        dragX = e.clientX - posX;
        dragY = e.clientY - posY;
        e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
        if (!dragging) return;
        posX = e.clientX - dragX;
        posY = e.clientY - dragY;
        imgEl.style.transform = 'translate(' + posX + 'px, ' + posY + 'px)';
    });

    window.addEventListener('mouseup', function () {
        dragging = false;
    });

    imgEl.addEventListener('touchstart', function (e) {
        if (!imgEl.classList.contains('zoomed') || e.touches.length !== 1) return;
        e.stopPropagation();
        e.preventDefault();
        dragging = true;
        touchMoved = false;
        dragX = e.touches[0].clientX - posX;
        dragY = e.touches[0].clientY - posY;
    });

    imgEl.addEventListener('touchmove', function (e) {
        if (!dragging) return;
        e.preventDefault();
        const newX = e.touches[0].clientX - dragX;
        const newY = e.touches[0].clientY - dragY;
        if (Math.abs(newX - posX) > 3 || Math.abs(newY - posY) > 3) {
            touchMoved = true;
        }
        posX = newX;
        posY = newY;
        imgEl.style.transform = 'translate(' + posX + 'px, ' + posY + 'px)';
    });

    imgEl.addEventListener('touchend', function (e) {
        if (!imgEl.classList.contains('zoomed')) return;
        e.stopPropagation();
        if (!touchMoved) {
            imgEl.classList.remove('zoomed');
            imgEl.style.transform = '';
            imgEl.style.left = '';
            imgEl.style.top = '';
            posX = 0; posY = 0;
        }
        dragging = false;
    });

    initSlideshow();
}

function initSlideshow() {
    const slideshow = document.querySelector('.gallery-slideshow');
    if (!slideshow) return;

    createSlideshow({
        container: slideshow,
        track: slideshow.querySelector('.slideshow-track'),
        slides: slideshow.querySelectorAll('.slideshow-slide'),
        dots: slideshow.querySelectorAll('.slideshow-dots .dot'),
        prevBtn: slideshow.querySelector('.slideshow-prev'),
        nextBtn: slideshow.querySelector('.slideshow-next'),
        interval: 4000
    });
}
