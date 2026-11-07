export function initAudio() {
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    if (!bgMusic || !musicBtn) return;

    let isPlaying = false;

    try {
        if (sessionStorage.getItem('musicTime')) {
            bgMusic.currentTime = parseFloat(sessionStorage.getItem('musicTime'));
        }
        // Restaura o estado de reprodução navegando entre páginas.
        if (sessionStorage.getItem('musicPlaying') === 'true') {
            isPlaying = true;
        }
    } catch (e) {}

    const updateBtn = () => {
        musicBtn.innerHTML = isPlaying
            ? '<i class="fas fa-pause" aria-hidden="true"></i>'
            : '<i class="fas fa-play" aria-hidden="true"></i>';
        musicBtn.setAttribute('aria-label', isPlaying ? 'Pausar Música' : 'Tocar Música');
        musicBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    };

    // Se a música devia estar tocando (sessão ativa), retoma o áudio.
    if (isPlaying) {
        bgMusic.play().then(() => {}).catch(() => { isPlaying = false; updateBtn(); });
    }

    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        if (isPlaying) {
            bgMusic.pause();
            isPlaying = false;
            try { sessionStorage.setItem('musicPlaying', 'false'); } catch (e) {}
        } else {
            bgMusic.play().then(() => {
                isPlaying = true;
                try { sessionStorage.setItem('musicPlaying', 'true'); } catch (e) {}
            }).catch(() => {});
        }
        updateBtn();
    });

    updateBtn();

    setInterval(() => {
        if (isPlaying) {
            try { sessionStorage.setItem('musicTime', bgMusic.currentTime); } catch (e) {}
        }
    }, 500);

    window.addEventListener('beforeunload', () => {
        try { sessionStorage.setItem('musicTime', bgMusic.currentTime); } catch (e) {}
    });
}
