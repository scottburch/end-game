import React from 'react';
import ReactDOM from 'react-dom/client';
import {Main} from './Main';
import {startPistolReact} from "@scottburch/pistol";
import '@scottburch/pistol/lib/test/e2e/browser/browser-functions'


startPistolReact().subscribe();

if ((module as any).hot) {
    (module as any).hot.accept()
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

