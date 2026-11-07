import { PB_URL, PB_RSVP_COLLECTION, PB_MESSAGES_COLLECTION, RATE_LIMIT_MS } from '../config.js';
import PocketBase from '../../lib/pocketbase/pocketbase.esm.js';

const pb = new PocketBase(PB_URL);

let lastSubmitTime = 0;

const MIN_SUBMIT_DURATION_MS = 2000;

function checkRateLimit() {
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
        const err = new Error('Envios muito rapidos. Aguarde.');
        err.code = 'RATE_LIMIT';
        throw err;
    }
    lastSubmitTime = now;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function submitWithMinDuration(submitFn) {
    const start = Date.now();
    const result = await submitFn();
    const elapsed = Date.now() - start;
    const remaining = MIN_SUBMIT_DURATION_MS - elapsed;
    if (remaining > 0) {
        await sleep(remaining);
    }
    return result;
}

function isClientResponseError(err) {
    return err?.name?.includes('ClientResponseError') ||
           err?.constructor?.name?.includes('ClientResponseError');
}

export function getErrorMessage(err) {
    if (err?.code === 'RATE_LIMIT') {
        return { title: 'Aguarde', message: 'Aguarde ao menos 3 segundos antes de enviar novamente.' };
    }

    if (isClientResponseError(err)) {
        if (err.status === 400) {
            return { title: 'Dados inválidos', message: 'Verifique se todos os campos foram preenchidos corretamente.' };
        }
        if (err.status === 403) {
            return { title: 'Erro', message: 'Não foi possível enviar. Tente novamente mais tarde.' };
        }
        if (err.status === 404) {
            return { title: 'Erro', message: 'Serviço temporariamente indisponível. Tente novamente mais tarde.' };
        }
        if (err.status === 429) {
            return { title: 'Muitas tentativas', message: 'Aguarde um momento antes de enviar novamente.' };
        }
        if (err.status >= 500) {
            return { title: 'Erro no servidor', message: 'Tente novamente mais tarde.' };
        }
    }

    if (!navigator.onLine) {
        return { title: 'Sem conexão', message: 'Verifique sua internet e tente novamente.' };
    }

    return { title: 'Erro', message: 'Não foi possível enviar. Tente novamente.' };
}

function formatDate(isoString) {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export async function submitRSVP(payload) {
    checkRateLimit();
    // O campo 'status' é SEMPRE forçado para 'Pendente' aqui.
    // NÃO confie em status vindo da página: o backend/PocketBase deve
    // validar via API rules (ex.: @request.data.status:set = 'Pendente')
    // para impedir auto-aprovação. Este bloqueio é defesa em profundidade.
    payload.status = 'Pendente';
    return submitWithMinDuration(async () => {
        return pb.collection(PB_RSVP_COLLECTION).create(payload);
    });
}

export async function submitMessage(payload) {
    checkRateLimit();
    // Idem: status forçado para 'Pendente' (moderação manual).
    payload.status = 'Pendente';
    return submitWithMinDuration(async () => {
        return pb.collection(PB_MESSAGES_COLLECTION).create(payload);
    });
}

export async function fetchApprovedMessages(limit = 10, offset = 0) {
    const page = Math.floor(offset / limit) + 1;

    const result = await pb.collection(PB_MESSAGES_COLLECTION).getList(page, limit, {
        filter: "status='Aprovado'",
        sort: '-created'
    });

    return {
        mensagens: result.items.map(item => ({
            nome: item.nome,
            mensagem: item.mensagem,
            data: formatDate(item.created)
        })),
        total: result.totalItems,
        hasMore: page < result.totalPages
    };
}
