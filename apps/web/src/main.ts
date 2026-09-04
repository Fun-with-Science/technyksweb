import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => {
    if (typeof document === 'undefined') return;

    const revealApplication = () => {
      const preloader = document.getElementById('app-preloader');
      preloader?.classList.add('app-preloader-hidden');
      window.setTimeout(() => preloader?.remove(), 320);
    };

    const fonts = document.fonts;
    if (fonts) {
      fonts
        .load('18px "Material Symbols Outlined"')
        .then((faces) => {
          if (faces.length) {
            document.documentElement.classList.add('material-icons-ready');
          }
        })
        .catch(() => undefined)
        .finally(revealApplication);
      window.setTimeout(revealApplication, 1800);
    } else {
      document.documentElement.classList.add('material-icons-ready');
      requestAnimationFrame(revealApplication);
    }
  })
  .catch((err) => console.error(err));
