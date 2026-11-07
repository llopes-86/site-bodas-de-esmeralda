// Navegacao padrao de modais <dialog>: botoes fechar/anterior/proximo,
// clique fora para fechar e swipe horizontal no touch.
// Usado pelo lightbox da galeria e pelo modal de mensagem do mural.

export function attachModalNav({ dialog, closeBtn, prevBtn, nextBtn, onClose, onPrev, onNext }) {
    closeBtn?.addEventListener('click', onClose);
    nextBtn?.addEventListener('click', onNext);
    prevBtn?.addEventListener('click', onPrev);

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) onClose();
    });

    let touchStartX = 0, touchStartY = 0;

    dialog.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    dialog.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) onPrev();
            else onNext();
        }
    });
}
