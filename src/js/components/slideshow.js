// Slideshow reutilizavel: autoplay, dots, botoes prev/next, swipe touch
// e pausa ao passar o mouse/tocar.
// Usado pela galeria (home) e pelo mural limitado (home).

export function createSlideshow({ container, track, slides, dots, prevBtn, nextBtn, interval = 5000 }) {
    let slideIdx = 0;
    let autoplay;

    // Harden: região de carrossel com nome quando o HTML não trouxe.
    if (!container.getAttribute('aria-label')) {
        container.setAttribute('role', 'region');
        container.setAttribute('aria-roledescription', 'carrossel');
    }

    function goTo(idx) {
        slideIdx = idx;
        track.style.transform = 'translateX(-' + (slideIdx * 100) + '%)';
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === slideIdx);
            // Harden P2: estado do slide atual para leitor de tela.
            d.setAttribute('aria-selected', i === slideIdx ? 'true' : 'false');
            if (d.hasAttribute('aria-current')) d.removeAttribute('aria-current');
            if (i === slideIdx) d.setAttribute('aria-current', 'true');
            if (d.tagName === 'BUTTON' && d.classList.contains('dot')) {
                d.tabIndex = i === slideIdx ? 0 : -1;
            }
        });
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === slideIdx);
            s.setAttribute('aria-hidden', i === slideIdx ? 'false' : 'true');
        });
    }

    // Bugfix: autoplay não avança com lightbox/modal aberto — ao fechar, o
    // focus de retorno miraria um card fora da tela (track transladado) e o
    // navegador rolava a página (às vezes até o topo).
    function nextSlide() {
        if (document.querySelector('dialog[open]')) return;
        goTo((slideIdx + 1) % slides.length);
    }
    function prevSlide() { goTo((slideIdx - 1 + slides.length) % slides.length); }

    function start() { stop(); autoplay = setInterval(nextSlide, interval); }
    function stop() { clearInterval(autoplay); }

    prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); start(); });
    nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); start(); });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', (e) => { e.stopPropagation(); goTo(i); start(); });
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i); start(); }
        });
    });

    // Harden: setas do teclado operam o carrossel focado.
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); start(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); nextSlide(); start(); }
    });

    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    container.addEventListener('touchstart', stop, { passive: true });

    let tx = 0;
    container.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    container.addEventListener('touchend', (e) => {
        const d = e.changedTouches[0].clientX - tx;
        if (Math.abs(d) > 50) { if (d > 0) prevSlide(); else nextSlide(); }
        start();
    });

    start();

    goTo(0);

    return { goTo, nextSlide, prevSlide, start, stop };
}
