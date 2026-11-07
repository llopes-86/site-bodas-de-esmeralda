import { initCore } from '../main.js';
import { initCountdown } from '../features/countdown.js';
import { initGallery } from '../features/gallery.js';
import { initMural } from '../features/mural.js';
import { initRSVP } from '../features/rsvp.js';
import { initPix } from '../features/pix.js';

document.addEventListener('DOMContentLoaded', () => {
    initCore();

    initCountdown();
    initGallery();
    initMural();
    initRSVP();
    initPix();
});
