import { initCore } from '../main.js';
import { initGallery } from '../features/gallery.js';

document.addEventListener('DOMContentLoaded', () => {
    initCore();

    initGallery();
});
