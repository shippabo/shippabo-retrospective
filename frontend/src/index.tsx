import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RedocStandalone } from 'redoc';
import schema from './schema.json';

import SessionCreate from './Session/SessionCreate';
import SessionActive from './Session/SessionActive';
import UserProvider from './User/UserContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SessionCreate isOpen={true} />} />
          <Route path="/session/:sessionId" element={<SessionActive />} />
          <Route path="/api" element={<RedocStandalone spec={schema} />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>,
);
