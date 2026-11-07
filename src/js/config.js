// ============================================================
// Configuracao central do site - FONTE UNICA DE VERDADE
// Alterou aqui, vale para todas as paginas.
// ============================================================

// Data do evento (formato para new Date())
export const EVENT_DATE = 'Nov 29, 2026 10:00:00';

// Data do evento (formato para exibicao)
export const EVENT_DATE_DISPLAY = '29 de Novembro de 2026';

// Endpoint do PocketBase (proxy Nginx -> PocketBase interno)
export const PB_URL = '/api/pb';

// Colecoes do PocketBase
export const PB_RSVP_COLLECTION = 'rsvp';
export const PB_MESSAGES_COLLECTION = 'messages';

// Intervalo minimo entre envios de formulario (ms)
export const RATE_LIMIT_MS = 3000;

// Tamanho da pagina do mural completo
export const MURAL_PAGE_SIZE = 10;

// Pix (fonte unica de verdade - o QR estatico esta em public/img/pix-qr.webp)
export const PIX_EMAIL = 'marialuizavilaca9@gmail.com';

// Umami Analytics
export const UMAMI_WEBSITE_ID = '2de5798d-49a7-49f1-aa82-80d664478215';

// Versao do site (SemVer — fonte unica de verdade, exibida no rodape).
// MAJOR: quebra compatibilidade (contrato Sheets/PocketBase, fluxo RSVP, deploy/nginx).
// MINOR: feature compativel (nova secao, srcset, a11y, motion).
// PATCH: fix (contraste, typo, raio, copy).
export const APP_VERSION = '1.15.10';
