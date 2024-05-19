// src/react/index.tsx
// Make sure to include the following two lines:
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { WebSocketProvider } from "app/providers/WebSocketProvider";
import App from "./App";
import { browserStore } from "./store";
import "./input.css";

const hostname = window.location.hostname;

const domNode = document.getElementById("root");
const lng = window.navigator.language;

delete window.__PRELOADED_STATE__;
hydrateRoot(
  domNode,
  <React.StrictMode>
    <Provider store={browserStore}>
      <WebSocketProvider url="ws://nolouts.com:80">
        <BrowserRouter>
          <App hostname={hostname} lng={lng} />
        </BrowserRouter>
      </WebSocketProvider>
    </Provider>
  </React.StrictMode>,
);
// if (isProduction) {
// } else {
//   const root = createRoot(domNode);
//   root.render(
//     <React.StrictMode>
//       <Provider store={browserStore}>
//         <WebSocketProvider url="ws://localhost:80">
//           <HashRouter>
//             <App hostname={hostname} lng={lng} />
//           </HashRouter>
//         </WebSocketProvider>
//       </Provider>
//     </React.StrictMode>,
//   );
// }
