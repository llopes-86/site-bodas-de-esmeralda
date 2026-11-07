export function playChampagneConfetti() {
    if (typeof confetti === 'undefined') {
        console.warn('canvas-confetti ainda não foi carregado.');
        return;
    }
    try {
        confetti({ spread: 100, particleCount: 150, colors: ['#c38322', '#ebba47', '#6b2e3d'], zIndex: 9999 });
    } catch (e) {
        console.warn('Erro ao disparar confetti:', e);
    }
}

export function playAxeEnergy() {
    if (typeof confetti === 'undefined') {
        console.warn('canvas-confetti ainda não foi carregado.');
        return;
    }
    try {
        confetti({ angle: 90, spread: 120, particleCount: 50, gravity: 0.1, colors: ['#FFFFFF', '#c38322', '#6b2e3d'], zIndex: 9999 });
    } catch (e) {
        console.warn('Erro ao disparar confetti:', e);
    }
}

export function playPixHearts() {
    if (typeof confetti === 'undefined') return;
    try {
        const heart = confetti.shapeFromPath({
            path: 'M 50 85 C 20 60, 10 40, 10 25 C 10 10, 25 10, 35 15 C 40 18, 48 25, 50 30 C 52 25, 60 18, 65 15 C 75 10, 90 10, 90 25 C 90 40, 80 60, 50 85 Z',
        });
        confetti({
            angle: 90,
            spread: 120,
            startVelocity: 65,
            particleCount: 70,
            colors: ['#e63946', '#ff4d6d', '#ff6b81', '#d62839', '#f72585'],
            shapes: [heart],
            scalar: 1.2,
            origin: { x: 0.5, y: 0.85 },
            gravity: 0.7,
            decay: 0.9,
            zIndex: 9999
        });
    } catch (e) {
        console.warn('Erro ao disparar coracoes:', e);
    }
}
