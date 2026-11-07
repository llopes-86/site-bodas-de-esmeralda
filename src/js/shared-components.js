import { EVENT_DATE_DISPLAY, APP_VERSION } from './config.js';

function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path === '/index.html';
}

function getRsvpHref() {
    return isHomePage() ? '#rsvp' : '/#rsvp';
}

export function renderNotificationBanner() {
    const template = `
        <div id="notification-banner" class="notification-banner" role="status" aria-live="polite" aria-atomic="true">
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            <div class="notification-text">
                <h4 id="notification-title">Mensagem</h4>
                <p id="notification-msg">Ação realizada.</p>
            </div>
            <button id="close-notification" class="close-notification" aria-label="Fechar notificação">&times;</button>
        </div>`;
    document.body.insertAdjacentHTML('afterbegin', template);
}

export function renderFloatBtn() {
    const href = getRsvpHref();
    const template = `
        <a href="${href}" id="rsvp-float-btn" class="rsvp-float-btn">
            <i class="fas fa-heart" aria-hidden="true"></i><span>Confirmar Presença</span>
        </a>`;
    document.body.insertAdjacentHTML('afterbegin', template);
}

export function renderScrollNav() {
    const template = `
        <button id="scroll-up-btn" class="scroll-nav-btn scroll-up-btn" aria-label="Voltar ao topo">
            <span id="scroll-count" class="hidden"></span>
            <i class="fas fa-chevron-up" aria-hidden="true"></i>
        </button>
        <button id="scroll-down-btn" class="scroll-nav-btn scroll-down-btn" aria-label="Ir para o final">
            <i class="fas fa-chevron-down" aria-hidden="true"></i>
        </button>`;
    document.body.insertAdjacentHTML('afterbegin', template);
}

export function renderFooter() {
    let barDivs = '';
    for (let i = 0; i < 38; i++) {
        barDivs += '<div class="footer-bar-stripe"></div>';
    }

    const heartSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    const heartDividerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="M50 88 C25 65 10 50 10 35 C10 20 22 10 35 10 C42 10 48 14 50 18 C52 14 58 10 65 10 C78 10 90 20 90 35 C90 50 75 65 50 88Z"/></svg>`;
    const githubSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.73 1.8 0 1.3-.01 2.35-.01 2.67 0 .21-.15.46-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>`;

    const template = `<footer class="footer">
        <div class="footer-bar">${barDivs}</div>
        <div class="footer-inner">
            <div class="footer-container">
                <div class="footer-heart-divider">
                    <div class="footer-divider-line footer-divider-left"></div>
                    ${heartDividerSvg}
                    <div class="footer-divider-line footer-divider-right"></div>
                </div>
                <p class="footer-name">M &amp; L</p>
                <p class="footer-date">${EVENT_DATE_DISPLAY}</p>
                <p class="footer-meta"><span class="footer-version" title="Versão do site">v${APP_VERSION}</span><span class="footer-credits">Feito com ${heartSvg} e ancestralidade</span><span class="footer-dev">Desenvolvido por Leandro Lopes <a class="footer-github" href="https://github.com/llopes-86" target="_blank" rel="noopener" aria-label="GitHub de Leandro Lopes">${githubSvg}</a></span></p>
            </div>
        </div>
    </footer>`;
    document.body.insertAdjacentHTML('beforeend', template);
}

export function renderLightbox() {
    const template = `<dialog id="lightbox-modal" class="lightbox" role="dialog" aria-modal="true" aria-label="Imagem ampliada"><button id="lightbox-close" class="lightbox-close" aria-label="Fechar">&times;</button><button id="lightbox-prev" class="lightbox-prev" aria-label="Foto anterior">&#10094;</button><img id="lightbox-img" src="" alt="Imagem Ampliada"><button id="lightbox-next" class="lightbox-next" aria-label="Próxima foto">&#10095;</button></dialog>`;
    document.body.insertAdjacentHTML('afterbegin', template);
}

export function renderMessageModal() {
    const template = `<dialog id="message-modal" class="lightbox" role="dialog" aria-modal="true" aria-label="Mensagem do mural"><button id="msg-close" class="lightbox-close" aria-label="Fechar">&times;</button><button id="msg-prev" class="lightbox-prev" aria-label="Mensagem anterior">&#10094;</button><div class="msg-modal-content"><h4 id="msg-modal-name">Nome</h4><span id="msg-modal-date" class="msg-modal-date"></span><div class="section-divider msg-modal-divider"></div><p id="msg-modal-text">Mensagem</p></div><button id="msg-next" class="lightbox-next" aria-label="Próxima mensagem">&#10095;</button></dialog>`;
    document.body.insertAdjacentHTML('afterbegin', template);
}
