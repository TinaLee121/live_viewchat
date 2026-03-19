import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LoginPage from './pages/LoginPage.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

function Root() {
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <ThemeProvider>
      {loggedIn
        ? <App onLogout={() => setLoggedIn(false)} />
        : <LoginPage onLogin={() => setLoggedIn(true)} />
      }
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
