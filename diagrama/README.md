# Diagrama animado — spike VectorCraft + EffectCraft vs Archify

Diretório de teste para produzir um diagrama de arquitetura **animado em GIF** para o README.
Tudo fica local aqui: binários, projetos, scripts e saídas. Os binários e as saídas são
ignorados pelo git (`.gitignore`), então o repositório não ganha ~250 MB.

## Resultado do spike

| Saída | Arquivo | Tamanho | Formato | Como foi feito |
|---|---|---:|---|---|
| Archify Live (nativo) | `out/archify-live.gif` | 807 KB | 1060×588, 6 s, 15 fps | `Export → WebM (6s motion)` + ffmpeg |
| VectorCraft + EffectCraft v1 (monogramas) | `out/bbg-effectcraft.gif` | 2,58 MB | 1600×900, 4 s, 15 fps | SVG ilustrado + dots/highlights animados |
| **VectorCraft + EffectCraft v2 (ícones reais)** | `out/bbg-effectcraft-v2.gif` | 3,57 MB | 1600×900, 5 s, 15 fps | ícones SVG→PNG, pulsos, anéis e 2 ondas de dots |
| Estático v1 | `out/bbg-static.svg` / `.png` | 14 KB / 72 KB | 1600×900 | VectorCraft headless |
| Estático v2 (sem ícones) | `out/bbg-v2-static.svg` / `.png` | 13 KB / 70 KB | 1600×900 | VectorCraft headless |

Contatos visuais: `out/archify-live-contact.png` e `out/bbg-effectcraft-contact2.png`.

**Recomendação:** para o README, o **Archify Live** é o caminho direto — é o “modo Live” que
já existe, pesa 3× menos e não exige redesenhar o diagrama. O estilo ByteByteGo do
EffectCraft fica mais bonito e “de agência”, mas custa 2,58 MB e qualquer mudança no
diagrama exige refazer o desenho.

**Escolhido:** v2 (VectorCraft + EffectCraft, ícones reais). Publicado como
`docs/arquitetura-animada-v2.gif` e referenciado no `README.md`; a v1
(`docs/arquitetura-animada.gif`) e o Archify Live (`out/archify-live.gif`) continuam como
alternativas.

## Ícones

- **Simple Icons** (CC0): nginx, PocketBase, Umami, Google Chrome, HTML5, CSS, JavaScript,
  Google Fonts, Font Awesome, jsDelivr e Google Maps — SVGs brancos em `assets/icons/white/`.
- **Bootstrap Icons** (MIT): sino usado para o Gotify (`bell.svg`); o logo oficial do Gotify
  é um SVG com bitmap embutido, pouco prático como máscara.
- Convertidos para PNG **192×192 com alfa** pelo próprio VectorCraft
  (`vectorcraft-cli convert`), em `assets/icons/png/`.

## O que foi instalado

| App | Versão | Release | SHA-256 do zip |
|---|---|---|---|
| VectorCraft | 0.22.0 | https://github.com/storytold/vectorcraft/releases/tag/v0.22.0 | `27ec6b14ea01a680b9f6758a346f06b53b0b6169b191354a362114b8b612a6e3` |
| EffectCraft | 0.22.0 | https://github.com/storytold/effectcraft/releases/tag/v0.22.0 | `a690c870390d7ff673b8443acf620c79662e47d37541fbb0c4fd6988850ca188` |

- `tools/vectorcraft/vectorcraft-cli.exe` — CLI/MCP headless (128 MB).
- `tools/effectcraft/effectcraft-cli.exe` — CLI/MCP headless (111 MB).
- `tools/*-SHA256SUMS.txt` — checksums oficiais dos releases.
- `scripts/mcp-probe.mjs` — lista as tools MCP de um servidor (smoke test).
- `scripts/` — geradores dos diagramas (`build-vc*.mjs`, `build-ec*.mjs`), versionados.
- `work/` — JSONL e rascunhos de execução (ignorado).
- `out/` — saídas (GIFs, PNGs, projeto `.ecproj`).

> VectorCraft e EffectCraft estão em **alpha** (0.22.0). O pipeline funcionou, mas não é
> uma dependência de produção do site.

## MCP no opencode

Os dois servidores já estão registrados em `opencode.jsonc` (na raiz), em modo headless e com
acesso restrito a este projeto:

```jsonc
"vectorcraft": {
  "type": "local",
  "enabled": true,
  "command": [
    "C:\\Bodas\\V3\\Site\\diagrama\\tools\\vectorcraft\\vectorcraft-cli.exe",
    "mcp",
    "--automation-read-root", "C:\\Bodas\\V3\\Site",
    "--automation-write-root", "C:\\Bodas\\V3\\Site\\diagrama\\out"
  ]
},
"effectcraft": {
  "type": "local",
  "enabled": true,
  "command": [
    "C:\\Bodas\\V3\\Site\\diagrama\\tools\\effectcraft\\effectcraft-cli.exe",
    "mcp",
    "--automation-read-root", "C:\\Bodas\\V3\\Site",
    "--automation-write-root", "C:\\Bodas\\V3\\Site\\diagrama\\out"
  ]
}
```

Reinicie o opencode para as tools aparecerem (`vectorcraft_*` e `effectcraft_*`).
Smoke test sem reiniciar:

```powershell
node diagrama\scripts\mcp-probe.mjs `
  "C:\Bodas\V3\Site\diagrama\tools\vectorcraft\vectorcraft-cli.exe" mcp `
  --automation-read-root "C:\Bodas\V3\Site" `
  --automation-write-root "C:\Bodas\V3\Site\diagrama\out"
```

Resultado: VectorCraft 33 tools, EffectCraft 27 tools, protocolo MCP `2025-06-18`.

## Reproduzir

### 1. Diagrama estático (VectorCraft)

```powershell
node diagrama\scripts\build-vc.mjs diagrama\work\bbg-static.jsonl
diagrama\tools\vectorcraft\vectorcraft-cli.exe run `
  --commands diagrama\work\bbg-static.jsonl `
  --export diagrama\out\bbg-static.svg `
  --export diagrama\out\bbg-static.png
```

O gerador desenha: fundo, título, 7 cards (Convidado, nginx, Site, PocketBase, Umami,
CDNs, Gotify), chips das páginas, setas ortogonais e rótulos. Fonte: Segoe UI.

### 2. Animação (EffectCraft)

```powershell
node diagrama\scripts\build-ec.mjs diagrama\work\bbg-anim-v2.jsonl
diagrama\tools\effectcraft\effectcraft-cli.exe --empty run `
  --commands diagrama\work\bbg-anim-v2.jsonl `
  --save-as diagrama\out\bbg-v2.ecproj
diagrama\tools\effectcraft\effectcraft-cli.exe --project diagrama\out\bbg-v2.ecproj `
  render --comp Main --out diagrama\out\bbg-effectcraft.gif `
  --format gif --start 0 --end 4 --fps 15 --resolution full
```

O projeto importa `bbg-static.png` como camada de fundo e adiciona:
- 8 dots (com halo) percorrendo as conexões em sequência;
- 7 highlights (contorno arredondado) acendendo cada nó na ordem do fluxo;
- loop de 4 s que começa e termina sem dots/highlights visíveis.

### 2b. v2 com ícones reais (escolhida)

```powershell
node diagrama\scripts\build-vc-v2.mjs diagrama\work\bbg-v2-static.jsonl
diagrama\tools\vectorcraft\vectorcraft-cli.exe run `
  --commands diagrama\work\bbg-v2-static.jsonl `
  --export diagrama\out\bbg-v2-static.svg `
  --export diagrama\out\bbg-v2-static.png

node diagrama\scripts\build-ec-v2.mjs diagrama\work\bbg-anim-v2-final.jsonl
diagrama\tools\effectcraft\effectcraft-cli.exe --empty run `
  --commands diagrama\work\bbg-anim-v2-final.jsonl `
  --save-as diagrama\out\bbg-v2-final.ecproj
diagrama\tools\effectcraft\effectcraft-cli.exe --project diagrama\out\bbg-v2-final.ecproj `
  render --comp Main --out diagrama\out\bbg-effectcraft-v2.gif `
  --format gif --start 0 --end 5 --fps 15 --resolution full
```

A v2 separa fundo e ícones: o PNG estático tem só cards, textos e tiles vazias; os ícones
entram como camadas de footage (192×192) e fazem um pulso de escala em sequência. Como os
ícones já estão visíveis no frame 0, o loop não pisca tiles vazias. Além disso:
- 16 anéis de pulso (entrada + chegada do fluxo);
- 12 ondas de dots (duas por conexão);
- 7 highlights de card;
- 5 s a 15 fps, loop contínuo.

### 3. Archify Live → GIF

1. Sirva `docs/` por HTTP e abra `arquitetura.html` no Chrome:
   ```powershell
   python -m http.server 8000 --directory docs
   ```
2. Aba visível e focada (o WebM usa `MediaRecorder` + `requestAnimationFrame`).
   Em aba oculta o rAF cai para ~3 fps e o WebM sai vazio. Workaround usado no spike,
   via CDP, antes de exportar:
   ```js
   window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 33);
   window.cancelAnimationFrame = id => clearTimeout(id);
   ```
3. `Export → WebM (6s motion)`, tema **Light**.
4. Converter:
   ```powershell
   ffmpeg -i out\site-bodas-de-esmeralda-arquitetura.webm `
     -vf "fps=15,scale=1060:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=none" `
     -loop 0 out\archify-live.gif
   ```

## Para publicar no README

As saídas em `out/` são ignoradas pelo git. Depois de escolher o GIF:

```powershell
# exemplo com o Archify Live
Copy-Item diagrama\out\archify-live.gif docs\arquitetura-animada.gif
```

E trocar a linha da imagem no `README.md`:

```md
![Arquitetura do site](docs/arquitetura-animada.gif)
```

Manter o link do HTML interativo (`arquitetura.html`) logo acima.

## Limitações observadas

- **VectorCraft** é um editor vetorial (estilo Illustrator), não um gerador semântico de
  diagramas: cada card/seta/texto foi desenhado por comando; mudou a arquitetura, refaz.
- **EffectCraft** exporta GIF animado nativo e tem MCP headless; ótimo para motion, mas o
  projeto `.ecproj` é binário e pesado (1,17 MB para este diagrama).
- **Archify** já tem o diagrama e o movimento prontos; o único atrito é que o export de
  movimento é WebM (6 s fixos), então o GIF é sempre uma conversão via ffmpeg.
- A gravação do WebM depende de a aba estar realmente visível/focada; automação em
  background precisa do override de `requestAnimationFrame` documentado acima.
