import { attachModalNav } from '../components/modal-swipe.js';

let messages = [];
let currentIdx = 0;
let lastFocused = null;

export function initMessageModal() {
    const modal = document.getElementById('message-modal');
    if (!modal) return null;

    const nameEl = document.getElementById('msg-modal-name');
    const textEl = document.getElementById('msg-modal-text');
    const dateEl = document.getElementById('msg-modal-date');

    function open(idx) {
        if (idx < 0 || idx >= messages.length) return;
        currentIdx = idx;
        nameEl.textContent = messages[currentIdx].nome;
        textEl.textContent = `"${messages[currentIdx].mensagem}"`;
        if (dateEl) {
            dateEl.textContent = messages[currentIdx].data || '';
        }
        lastFocused = document.activeElement;
        if (!modal.open) modal.showModal();
        document.getElementById('msg-close')?.focus();
    }

    function close() {
        modal.close();
    }

    // Retorna o foco só se o card ainda está visível — focar slide fora da
    // tela (track transladado pelo autoplay) rola a página até o topo.
    modal.addEventListener('close', () => {
        if (!lastFocused?.isConnected) return;
        const r = lastFocused.getBoundingClientRect();
        const visible = r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
        if (visible) lastFocused.focus?.();
    });

    function next() {
        currentIdx = (currentIdx + 1) % messages.length;
        open(currentIdx);
    }

    function prev() {
        currentIdx = (currentIdx - 1 + messages.length) % messages.length;
        open(currentIdx);
    }

    attachModalNav({
        dialog: modal,
        closeBtn: document.getElementById('msg-close'),
        prevBtn: document.getElementById('msg-prev'),
        nextBtn: document.getElementById('msg-next'),
        onClose: close,
        onPrev: prev,
        onNext: next
    });

    return {
        setMessages(arr) { messages = arr; },
        open
    };
}
