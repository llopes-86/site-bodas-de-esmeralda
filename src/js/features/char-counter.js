export function initCharCounter() {
    const textarea = document.getElementById('msg-texto');
    const charCount = document.getElementById('char-count');
    if (!textarea || !charCount) return;

    textarea.addEventListener('input', () => {
        const size = textarea.value.length;
        charCount.textContent = `${size} / 300`;
        charCount.classList.toggle('limit', size >= 290);
    });
}
