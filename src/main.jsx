import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.jsx'

// window.global = window;
createRoot(document.getElementById('root')).render(

  // <StrictMode>
  <App />
  // </StrictMode>,
)
