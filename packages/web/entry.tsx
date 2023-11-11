// src/react/index.tsx
// Make sure to include the following two lines:
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { store } from 'app/store';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './input.css';
let hostname = window.location.hostname;

const domNode = document.getElementById('root');
const lng = window.navigator.language;
const env = process.env.NODE_ENV;

hydrateRoot(
  domNode,
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App hostname={hostname} lng={lng} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
