import { EVENT_DATE } from '../config.js';

export function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return; // Se não estiver na Index, não faz nada

    const countDownDate = new Date(EVENT_DATE).getTime();
    const liveEl = document.getElementById('countdown-status');
    let lastAnnounced = '';
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = countDownDate - now;
        
        if (distance < 0) {
            // Harden: evento chegou — anuncia uma vez via região viva educada.
            if (liveEl && liveEl.textContent !== 'O evento chegou!') {
                liveEl.textContent = 'O evento chegou! Obrigado por celebrar conosco.';
            }
            return;
        }
        
        // Cálculos matemáticos de tempo
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Atualiza o HTML colocando '0' na frente se for menor que 10
        document.getElementById('days').innerText = days.toString().padStart(2, '0');
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');

        // Harden P2: região viva educada anuncia só a cada minuto (sem spam por segundo).
        const key = `${days}d-${hours}h-${minutes}m`;
        if (liveEl && key !== lastAnnounced) {
            lastAnnounced = key;
            liveEl.textContent = `Faltam ${days} dias, ${hours} horas e ${minutes} minutos para 29 de novembro de 2026.`;
        }
    }
    
    // Roda a função a cada 1 segundo
    setInterval(updateCountdown, 1000);
    updateCountdown(); // Roda imediatamente na primeira vez
}