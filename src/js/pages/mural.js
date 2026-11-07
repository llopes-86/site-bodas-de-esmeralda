import { initCore } from '../main.js';
import { initMural } from '../features/mural.js';

document.addEventListener('DOMContentLoaded', () => {
    initCore();

    initMural();
});
