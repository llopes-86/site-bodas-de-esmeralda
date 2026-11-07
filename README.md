# Site — Bodas de Esmeralda M & L

![Bodas de Esmeralda — M & L](public/img/banner.webp)

Site estático do convite das **Bodas de Esmeralda (40 anos) de Mirandir & Luiza** — 29/11/2026, 10h30, Espaço Carrier, Mairiporã/SP.

> **Status:** confirmações de presença (RSVP) **encerradas em 06/11/2026** — o site exibe um aviso no topo orientando a procurar por Luane. A branch `main` preserva a versão funcional **v1.15.10** (RSVP aberto); o encerramento vive em `release/rsvp-encerrado-v1.15.11` (**v1.15.11**). Rodapé exibe a versão (`src/js/config.js`).

## Páginas

| Página | O quê |
|---|---|
| `index.html` | Início, história, fotos, evento, mural, RSVP (oculto), presentes/Pix |
| `galeria.html` | Álbum completo (O Início, A Família Cresceu, Alguns Momentos) |
| `mural.html` | Mural completo de recados |

## Stack

- **Sem build/bundler:** HTML + CSS + JS vanilla (ES modules), sem dependências de build.
- **Dados:** [PocketBase](https://pocketbase.io) via proxy same-origin `/api/pb` (coleções `rsvp` e `messages`, status forçado `Pendente`, consentimento LGPD).
- **Infra:** nginx (`default.conf`) — estático com cache, CSP/headers de segurança, rate-limit e proxies.
- **Observabilidade:** Umami (eventos) + push Gotify a cada novo RSVP (hook externo, fora deste repo).

## Rodar local

```bash
# qualquer servidor estático; PocketBase é opcional (mural/RSVP degradam com aviso)
python -m http.server 8000
# abrir http://localhost:8000
```

## Arquitetura

Diagrama interativo gerado com [archify](https://github.com/browser-use/browser-harness) a partir do código:

👉 **[docs/arquitetura.html](docs/arquitetura.html)** (abrir o arquivo — no GitHub web, baixe e abra localmente para interatividade total)

Fluxo em resumo: visitante → **nginx** (estático + CSP + rate-limit) → páginas; o JS chama **PocketBase** via `/api/pb` (RSVP/mural) e **Umami** via `/a/t`; CDNs servem fontes/ícones/mapas; a cada RSVP, um hook dispara **Gotify**.

## Evolução

- [x] Migração Google Sheets → PocketBase (coleções `rsvp`/`messages`)
- [x] Mural com moderação (`Pendente` → `Aprovado`), Pix/QR, countdown, a11y
- [x] Encerramento do RSVP com aviso reversível (`hidden`), v1.15.11
- [ ] Página de confirmação pós-evento (fotos da festa)
- [ ] GitHub Pages como espelho estático

## Deploy

Subir `index.html`, `galeria.html`, `mural.html`, `public/` e `src/` para o webroot. Ajustar `default.conf`: `server_name`, proxies (`websites_pocketbase`, `n8n_umami`) e CSP conforme o ambiente.

## Segurança e privacidade

- Nenhum segredo no repo (sem tokens, senhas ou chaves). Auditoria de 08/2026 ok.
- `PIX_EMAIL` e `UMAMI_WEBSITE_ID` em `src/js/config.js` são identificadores públicos por necessidade (chave Pix exibida aos convidados).
- `public/img/*` contém fotos da família — repo público por decisão dos donos; redistribuição segue o contexto do evento.
