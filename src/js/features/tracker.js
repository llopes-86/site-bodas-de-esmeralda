// ============================================================
// Tracker manual do Umami Analytics
//
// Implementa o protocolo oficial do Umami v2 para coleta de eventos,
// persistindo o cache JWT em localStorage. Isso garante que a mesma
// sessao seja mantida entre recarregamentos de pagina.
//
// Protocolo:
// 1. Envia pageview/evento para /a/t/api/send.
// 2. Servidor retorna { cache, sessionId, visitId }.
// 3. Cache (JWT) e salvo em localStorage.
// 4. Proximas requisicoes enviam o cache no header x-umami-cache.
// 5. Servidor reutiliza a mesma sessao.
// ============================================================

import { UMAMI_WEBSITE_ID } from '../config.js';

const COLLECT_URL = '/a/t/api/send';
const CACHE_KEY = 'umami.cache';
const CURRENT_URL = location.pathname + location.search;
const CURRENT_REF = document.referrer.startsWith(location.origin) ? '' : document.referrer;

function getPayload() {
    return {
        website: UMAMI_WEBSITE_ID,
        hostname: location.hostname,
        screen: screen.width + 'x' + screen.height,
        language: navigator.language || 'pt-BR',
        title: document.title,
        url: CURRENT_URL,
        referrer: CURRENT_REF || ''
    };
}

function getCache() {
    try {
        return localStorage.getItem(CACHE_KEY) || undefined;
    } catch (e) {
        return undefined;
    }
}

function setCache(value) {
    try {
        if (value) {
            localStorage.setItem(CACHE_KEY, value);
        } else {
            localStorage.removeItem(CACHE_KEY);
        }
    } catch (e) {
        // localStorage pode estar indisponivel (modo privado restrito)
    }
}

async function sendEvent(payload, type = 'event') {
    if (!UMAMI_WEBSITE_ID) {
        console.warn('[tracker] UMAMI_WEBSITE_ID nao configurado.');
        return;
    }

    const cache = getCache();
    const headers = {
        'Content-Type': 'application/json',
        'x-umami-website-id': UMAMI_WEBSITE_ID,
        'x-umami-hostname': location.hostname
    };
    if (cache) headers['x-umami-cache'] = cache;

    try {
        const response = await fetch(COLLECT_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({ type, payload }),
            credentials: 'same-origin',
            keepalive: true
        });

        if (!response.ok) return;

        const data = await response.json().catch(() => ({}));
        if (data.cache) setCache(data.cache);
    } catch (e) {
        // Falha silenciosa: nao quebra a experiencia do site
    }
}

export function trackPageView() {
    sendEvent(getPayload(), 'event');
}

export function trackEvent(name, data = {}) {
    sendEvent({ ...getPayload(), name, data }, 'event');
}

export function initTracker() {
    if (!UMAMI_WEBSITE_ID) return;

    if (document.readyState === 'complete') {
        trackPageView();
    } else {
        window.addEventListener('load', trackPageView);
    }
}

// Expor API global para uso em scripts inline (como fallback)
if (typeof window !== 'undefined') {
    window.siteTracker = { trackPageView, trackEvent };
}
