import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppMinimal from './AppMinimal.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppMinimal />
  </StrictMode>
);
