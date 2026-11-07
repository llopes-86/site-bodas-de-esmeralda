import { submitRSVP, getErrorMessage } from '../api/pocketbase.js';
import { showToast } from '../utils/toast.js';
import { sanitizeText } from '../utils/sanitize.js';
import { playChampagneConfetti } from './animations.js';

export function initRSVP() {
    const form = document.getElementById('rsvp-form');
    if (!form) return;

    const radioAdulto = document.getElementById('radio-adulto');
    const blocoAdulto = document.getElementById('bloco-adulto');
    const blocoCrianca = document.getElementById('bloco-crianca');

    function applyGuestType(isChild) {
        if (isChild) {
            blocoAdulto.classList.add('hidden');
            blocoAdulto.classList.remove('fade-in');

            blocoCrianca.classList.remove('hidden');
            blocoCrianca.classList.add('fade-in');

            document.getElementById('nome-adulto').required = false;
            document.getElementById('nome-crianca').required = true;
            document.getElementById('idade-crianca').required = true;
            document.getElementById('nome-responsavel').required = true;
        } else {
            blocoCrianca.classList.add('hidden');
            blocoCrianca.classList.remove('fade-in');

            blocoAdulto.classList.remove('hidden');
            blocoAdulto.classList.add('fade-in');

            document.getElementById('nome-adulto').required = true;
            document.getElementById('nome-crianca').required = false;
            document.getElementById('idade-crianca').required = false;
            document.getElementById('nome-responsavel').required = false;
        }
    }

    document.querySelectorAll('input[name="tipo_convidado"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            applyGuestType(e.target.value === 'Crianca');
        });
    });

    document.getElementById('contato')?.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.length <= 10 ? v.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
                           : v.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
        e.target.value = v;
    });

    // Harden: limpar erro do campo ao digitar (não só cor).
    form.querySelectorAll('.form-input').forEach(el => {
        el.addEventListener('input', () => {
            el.setAttribute('aria-invalid', 'false');
            const described = el.getAttribute('aria-describedby') || '';
            described.split(' ').forEach(id => {
                if (id.endsWith('-erro')) document.getElementById(id)?.setAttribute('hidden', '');
            });
        });
        el.addEventListener('change', () => {
            el.setAttribute('aria-invalid', 'false');
            const described = el.getAttribute('aria-describedby') || '';
            described.split(' ').forEach(id => {
                if (id.endsWith('-erro')) document.getElementById(id)?.setAttribute('hidden', '');
            });
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const summary = document.getElementById('rsvp-erros');
        const consentInput = document.getElementById('lgpd-consent');
        const lgpdErro = document.getElementById('lgpd-erro');

        function setInvalid(input, erroEl, invalid) {
            if (!input || !erroEl) return;
            input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
            erroEl.hidden = !invalid;
        }
        function clearAllErrors() {
            form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.setAttribute('aria-invalid', 'false'));
            form.querySelectorAll('.form-error').forEach(el => { el.hidden = true; });
            if (summary) { summary.hidden = true; summary.innerHTML = ''; }
        }
        function showSummary(items) {
            if (!summary) return;
            const links = items.map(f => `<li><a href="#${f.el.id}">${f.label}</a></li>`).join('');
            summary.innerHTML = `<h3>Verifique os campos obrigatórios (${items.length})</h3><ul>${links}</ul>`;
            summary.hidden = false;
            summary.focus();
        }
        clearAllErrors();

        if (!consentInput.checked) {
            setInvalid(consentInput, lgpdErro, true);
            showSummary([{ el: consentInput, label: 'Autorização de dados (LGPD)' }]);
            const consentLabel = document.querySelector('.lgpd-consent');
            consentLabel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            consentLabel.classList.add('lgpd-shake');
            setTimeout(() => consentLabel.classList.remove('lgpd-shake'), 600);
            showToast(false, 'Autorização Necessária', 'Você precisa autorizar o armazenamento dos seus dados para confirmar presença.');
            summary?.focus();
            return;
        }
        setInvalid(consentInput, lgpdErro, false);

        const isAdulto = radioAdulto.checked;

        const nomeAdultoEl = document.getElementById('nome-adulto');
        const nomeCriancaEl = document.getElementById('nome-crianca');
        const idadeCriancaEl = document.getElementById('idade-crianca');
        const nomeRespEl = document.getElementById('nome-responsavel');
        const contatoEl = document.getElementById('contato');

        const faltando = [];

        if (isAdulto) {
            if (!nomeAdultoEl.value.trim()) faltando.push({ el: nomeAdultoEl, label: 'Nome e Sobrenome', erro: 'nome-adulto-erro' });
        } else {
            if (!nomeCriancaEl.value.trim()) faltando.push({ el: nomeCriancaEl, label: 'Nome da Criança', erro: 'nome-crianca-erro' });
            if (!idadeCriancaEl.value) faltando.push({ el: idadeCriancaEl, label: 'Idade', erro: 'idade-crianca-erro' });
            if (!nomeRespEl.value.trim()) faltando.push({ el: nomeRespEl, label: 'Nome do Responsável', erro: 'nome-responsavel-erro' });
        }

        const digits = contatoEl.value.replace(/\D/g, '');
        if (!contatoEl.value.trim() || digits.length < 10) faltando.push({ el: contatoEl, label: 'Telefone / WhatsApp', erro: 'contato-erro' });

        if (faltando.length > 0) {
            faltando.forEach(f => setInvalid(f.el, document.getElementById(f.erro), true));
            showSummary(faltando);
            const nomes = faltando.map(f => f.label);
            showToast(false, 'Campos obrigatórios', 'Preencha: ' + nomes.join(', '));
            faltando[0].el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Enviando...';
        btn.disabled = true;

        const restricoesArray = [];
        if (document.getElementById('chk-vegetariano').checked) restricoesArray.push('Vegetariano(a) / Vegano(a)');
        if (document.getElementById('chk-gluten').checked) restricoesArray.push('Intolerância à Lactose');
        if (document.getElementById('chk-pcd').checked) restricoesArray.push('Necessidades Especiais');
        const stringRestricoes = restricoesArray.length > 0 ? restricoesArray.join(', ') : 'Nenhuma';

        const payload = {
            nome: sanitizeText(isAdulto ? document.getElementById('nome-adulto').value : '', 120),
            adulto: isAdulto ? '1' : '0',
            criancas: isAdulto ? '0' : '1',
            responsavel: sanitizeText(isAdulto ? '' : document.getElementById('nome-responsavel').value, 120),
            nome_crianca: sanitizeText(isAdulto ? '' : document.getElementById('nome-crianca').value, 120),
            idade: isAdulto ? '' : document.getElementById('idade-crianca').value,
            restricoes: stringRestricoes,
            contato: document.getElementById('contato').value
            // 'status' é forçado a 'Pendente' em pocketbase.js (submitRSVP)
        };

        try {
            await submitRSVP(payload);
            showToast(true, 'Presença Confirmada!', 'Esperamos você neste dia especial.');
            playChampagneConfetti();

            const successBox = document.getElementById('rsvp-success-action');
            if (successBox) {
                successBox.innerHTML = `
                    <h3 class="rsvp-success-title">Presença confirmada com muito amor!<span class="rsvp-heart"> \u2764\uFE0F</span></h3>
                    <p class="rsvp-success-text">Sua presença é nosso maior presente, mas se desejar nos abençoar de outra forma, preparamos uma aba especial para você.</p>
                    <a href="#presentes" class="btn-outline rsvp-success-link">Ver a Sessão de Presentes</a>
                `;
                successBox.classList.remove('hidden');
            }
            const msgBox = document.getElementById('rsvp-msg-action');
            if (msgBox) msgBox.classList.remove('hidden');

            form.reset();
            applyGuestType(false);
            const scrollTarget = document.getElementById('rsvp-msg-action') || successBox;
            scrollTarget?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
