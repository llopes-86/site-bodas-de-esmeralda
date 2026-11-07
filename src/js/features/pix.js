import { PIX_EMAIL } from '../config.js';
import { playPixHearts } from './animations.js';
import { trackEvent } from './tracker.js';

function trackPixClick() {
    trackEvent('pix-copiar');
}

export function initPix() {
    const container = document.getElementById('pix-card');
    if (!container) return;

    container.innerHTML = `
        <i class="fab fa-pix pix-icon" aria-hidden="true"></i>
        <h4>Chave Pix</h4>

        <button type="button" class="pix-email-display" title="Copiar Chave Pix" aria-label="Copiar chave Pix ${PIX_EMAIL}">${PIX_EMAIL}</button>

        <div class="pix-qr">
            <img src="./public/img/pix-qr.webp" alt="QR Code Pix" loading="lazy" width="150" height="150">
        </div>

        <button id="btn-copy-pix" class="btn-outline pix-copy-btn" title="Copiar Chave Pix" aria-live="off">
            <i class="far fa-credit-card" aria-hidden="true"></i> Copiar Chave
        </button>

        <div id="copy-msg" class="copy-msg" role="status" aria-live="polite">Chave Pix Copiada</div>
    `;

    document.getElementById('btn-copy-pix').addEventListener('click', copyPix);
    document.querySelector('.pix-email-display')?.addEventListener('click', copyPix);

    async function copyPix() {
        trackPixClick();

        try {
            await navigator.clipboard.writeText(PIX_EMAIL);
            flashMsg();
            playPixHearts();
        } catch (err) {
            fallbackCopy(PIX_EMAIL);
        }
    }

    function flashMsg() {
        const msg = document.getElementById('copy-msg');
        msg.classList.add('show');
        setTimeout(() => msg.classList.remove('show'), 3000);
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            flashMsg();
            playPixHearts();
        } catch (err) {
            alert('Chave Pix: ' + text);
        }
        document.body.removeChild(textarea);
    }
}
