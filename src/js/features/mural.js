import { MURAL_PAGE_SIZE } from '../config.js';
import { fetchApprovedMessages, submitMessage, getErrorMessage } from '../api/pocketbase.js';
import { showToast } from '../utils/toast.js';
import { sanitizeText } from '../utils/sanitize.js';
import { playChampagneConfetti } from './animations.js';
import { initCharCounter } from './char-counter.js';
import { initMessageModal } from './message-modal.js';
import { createSlideshow } from '../components/slideshow.js';

const PAGE_SIZE = MURAL_PAGE_SIZE;

function createCard(msg, idx, hasModal, modal) {
    const card = document.createElement('div');
    card.className = hasModal ? 'mural-card clickable' : 'mural-card';

    const nameEl = document.createElement('h4');
    nameEl.textContent = msg.nome;
    card.appendChild(nameEl);

    if (msg.data) {
        const dateEl = document.createElement('span');
        dateEl.className = 'mural-card-date';
        dateEl.textContent = msg.data;
        card.appendChild(dateEl);
    }

    const textEl = document.createElement('p');
    textEl.textContent = '\u201C' + msg.mensagem + '\u201D';
    card.appendChild(textEl);

    if (hasModal) {
        card.classList.add('clickable');
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Ler mensagem de ${msg.nome} por inteiro`);
        card.addEventListener('click', () => modal.open(idx));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); modal.open(idx); }
        });
    }

    return card;
}

export function initMural() {
    const container = document.getElementById('mural-container');
    if (!container) return;

    initCharCounter();
    const modal = initMessageModal();
    const maxLimits = container.getAttribute('data-limit');

    if (maxLimits) {
        initLimitedMural(container, modal, parseInt(maxLimits));
    } else {
        initFullMural(container, modal);
    }

    initMessageForm();
}

function initLimitedMural(container, modal, limit) {
    fetchApprovedMessages(limit, 0).then(data => {
        const mensagens = data.mensagens || [];
        if (mensagens.length === 0) {
            container.replaceChildren();
            const empty = document.createElement('p');
            empty.textContent = 'Seja o primeiro a deixar uma mensagem!';
            container.appendChild(empty);
        } else {
            const slideshow = document.createElement('div');
            slideshow.className = 'mural-slideshow';
            slideshow.setAttribute('role', 'region');
            slideshow.setAttribute('aria-roledescription', 'carrossel');
            slideshow.setAttribute('aria-label', 'Recados em destaque');

            const track = document.createElement('div');
            track.className = 'mural-slideshow-track';

            const count = Math.min(mensagens.length, limit);
            mensagens.slice(0, count).forEach(function (msg, idx) {
                const card = createCard(msg, idx, !!modal, modal);

                const envelope = document.createElement('div');
                envelope.className = 'mural-card-envelope';
                envelope.setAttribute('aria-hidden', 'true');
                envelope.innerHTML = '<i class="fas fa-heart" aria-hidden="true"></i>';

                const backWrapper = document.createElement('div');
                backWrapper.className = 'mural-card-back-wrapper';
                backWrapper.appendChild(card);

                const inner = document.createElement('div');
                inner.className = 'mural-card-flip-inner';
                inner.appendChild(envelope);
                inner.appendChild(backWrapper);

                const flip = document.createElement('div');
                flip.className = 'mural-card-flip';
                flip.appendChild(inner);

                const slide = document.createElement('div');
                slide.className = 'mural-slide' + (idx === 0 ? ' active' : '');
                slide.appendChild(flip);
                track.appendChild(slide);
            });

            slideshow.appendChild(track);

            const prevBtn = document.createElement('button');
            prevBtn.className = 'mural-slideshow-prev';
            prevBtn.type = 'button';
            prevBtn.setAttribute('aria-label', 'Recado anterior');
            prevBtn.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';

            const nextBtn = document.createElement('button');
            nextBtn.className = 'mural-slideshow-next';
            nextBtn.type = 'button';
            nextBtn.setAttribute('aria-label', 'Próximo recado');
            nextBtn.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';

            slideshow.appendChild(prevBtn);
            slideshow.appendChild(nextBtn);

            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'mural-slideshow-dots';
            dotsContainer.setAttribute('role', 'tablist');
            dotsContainer.setAttribute('aria-label', 'Escolher recado');
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                dot.setAttribute('aria-label', `Ir para recado ${i + 1} de ${count}`);
                if (i > 0) dot.tabIndex = -1;
                dotsContainer.appendChild(dot);
            }
            slideshow.appendChild(dotsContainer);

            container.replaceChildren(slideshow);

            const observer = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) {
                    slideshow.classList.add('mural-revealed');
                    observer.unobserve(container);
                }
            }, { threshold: 0.2 });
            observer.observe(container);

            createSlideshow({
                container: slideshow,
                track,
                slides: track.querySelectorAll('.mural-slide'),
                dots: dotsContainer.querySelectorAll('.dot'),
                prevBtn,
                nextBtn,
                interval: 5000
            });
        }

        if (modal) modal.setMessages(mensagens.slice(0, limit));

        const countSpan = document.getElementById('msg-count');
        if (countSpan) countSpan.textContent = Math.min(mensagens.length, limit);
    }).catch(function (err) {
        console.error(err);
        container.innerHTML = '<p>Erro ao carregar mensagens.</p>';
    });
}

function initFullMural(container, modal) {
    let allMessages = [];
    let offset = 0;
    let hasMore = true;
    let isLoading = false;
    let totalMessages = 0;
    let isFirstLoad = true;

    const countSpan = document.getElementById('msg-count');
    const scrollCount = document.getElementById('scroll-count');

    const sentinel = document.createElement('div');
    sentinel.id = 'mural-sentinel';
    container.insertAdjacentElement('afterend', sentinel);

    function renderLoader() {
        const existing = document.getElementById('mural-loader');
        if (existing) return;
        const loader = document.createElement('div');
        loader.id = 'mural-loader';
        loader.className = 'mural-loader';
        loader.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Carregando mais mensagens...';
        sentinel.insertAdjacentElement('beforebegin', loader);
    }

    function removeLoader() {
        const loader = document.getElementById('mural-loader');
        if (loader) loader.remove();
    }

    function updateCount() {
        const text = totalMessages > 0 ? allMessages.length + ' / ' + totalMessages : '0';
        if (countSpan) countSpan.textContent = text;
        if (scrollCount) scrollCount.textContent = totalMessages > 0 ? allMessages.length + '/' + totalMessages : '0';
    }

    function clearInitialSpinner() {
        const spinner = container.querySelector('p');
        if (spinner && spinner.innerHTML.includes('fa-spinner')) {
            spinner.remove();
        }
    }

    async function loadPage() {
        if (isLoading || !hasMore) return;
        isLoading = true;

        if (!isFirstLoad) {
            renderLoader();
        }

        try {
            const data = await fetchApprovedMessages(PAGE_SIZE, offset);

            if (!data.hasMore) {
                hasMore = false;
                sentinel.remove();
            }

            totalMessages = data.total;
            const newMessages = data.mensagens || [];

            if (isFirstLoad) {
                clearInitialSpinner();
                isFirstLoad = false;
            }

            newMessages.forEach((msg, i) => {
                const idx = allMessages.length;
                allMessages.push(msg);
                const card = createCard(msg, idx, !!modal, modal);
                card.style.animationDelay = `${i * 0.08}s`;
                container.appendChild(card);
            });

            if (modal) modal.setMessages(allMessages);
            offset += PAGE_SIZE;
            updateCount();

            if (container.children.length === 0 && !hasMore) {
                container.innerHTML = '<p>Nenhuma mensagem aprovada ainda.</p>';
            }
        } catch (err) {
            console.error(err);
            hasMore = false;
            sentinel.remove();
            showToast(false, 'Erro', 'Falha ao carregar mensagens.');
        } finally {
            isLoading = false;
            removeLoader();
        }
    }

    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) loadPage();
    }, { rootMargin: '200px' });

    observer.observe(sentinel);
    loadPage();

    const scrollBtn = document.getElementById('scroll-up-btn');
    const scrollCountSpan = document.getElementById('scroll-count');
    if (scrollCountSpan) scrollCountSpan.classList.remove('hidden');
    if (scrollBtn) {
        scrollBtn.classList.add('has-count');
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (scrollTicking) return;
            scrollTicking = true;
            requestAnimationFrame(() => {
                scrollBtn.classList.toggle('visible', window.scrollY > 600);
                scrollTicking = false;
            });
        }, { passive: true });
    }
}

function initMessageForm() {
    const form = document.getElementById('msg-form');
    if (!form) return;

    const nomeEl = document.getElementById('msg-nome');
    const textoEl = document.getElementById('msg-texto');
    const summary = document.getElementById('msg-erros');

    function setInvalid(input, erroId, invalid) {
        if (!input) return;
        input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
        const erroEl = erroId ? document.getElementById(erroId) : null;
        if (erroEl) erroEl.hidden = !invalid;
    }
    [nomeEl, textoEl].forEach(el => {
        el?.addEventListener('input', () => setInvalid(el, el === nomeEl ? 'msg-nome-erro' : 'msg-texto-erro', false));
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nomeRaw = nomeEl.value;
        const msgRaw = textoEl.value;
        const nomeStr = sanitizeText(nomeRaw, 100);
        const msgStr = sanitizeText(msgRaw, 300);

        const faltando = [];
        if (!nomeStr) faltando.push({ el: nomeEl, erro: 'msg-nome-erro', label: 'Nome e Sobrenome' });
        if (!msgStr) faltando.push({ el: textoEl, erro: 'msg-texto-erro', label: 'Mensagem' });

        if (faltando.length > 0) {
            faltando.forEach(f => setInvalid(f.el, f.erro, true));
            if (summary) {
                const links = faltando.map(f => `<li><a href="#${f.el.id}">${f.label}</a></li>`).join('');
                summary.innerHTML = `<h3>Verifique os campos obrigatórios (${faltando.length})</h3><ul>${links}</ul>`;
                summary.hidden = false;
                summary.focus();
            }
            showToast(false, 'Atenção', 'Os campos Nome e Mensagem são obrigatórios.');
            return;
        }
        setInvalid(nomeEl, 'msg-nome-erro', false);
        setInvalid(textoEl, 'msg-texto-erro', false);
        if (summary) { summary.hidden = true; summary.innerHTML = ''; }

        const btn = form.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Enviando...';
        btn.disabled = true;

        // 'status' é forçado a 'Pendente' em pocketbase.js (submitMessage)
        const payload = { nome: nomeStr, mensagem: msgStr };

        try {
            await submitMessage(payload);
            showToast(true, 'Recado Enviado!', 'Obrigado por deixar seu carinho.');
            playChampagneConfetti();

            form.reset();
            const charCount = document.getElementById('char-count');
            if (charCount) {
                charCount.textContent = '0 / 300';
                charCount.classList.remove('limit');
            }

            const cta = document.querySelector('.mural-cta');
            if (cta) cta.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } catch (err) {
            console.error(err);
            const { title, message } = getErrorMessage(err);
            showToast(false, title, message);
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    });
}