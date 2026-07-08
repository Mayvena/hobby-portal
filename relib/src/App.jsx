import { useState } from 'react';
import './App.css';
import { Login } from './components/Login';
import { AppHeader } from './components/AppHeader';
import { DataBroker } from './dataBroker';
import Dashboard from './pages/dashboard';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [session, setSession] = useState(() => {
    const restoredSession = DataBroker.loadSession();
    if (!restoredSession) {
      return null;
    }

    const existingUser = DataBroker.getUser(restoredSession.user.username);
    if (!existingUser) {
      DataBroker.clearSession();
      return null;
    }

    return restoredSession;
  });

  const refreshSessionFromBroker = () => {
    const refreshedSession = DataBroker.refreshStoredSession();
    setSession(refreshedSession);
  };

  const handleLogin = ({ username, password }) => {
    const newSession = DataBroker.createSession({ username, password });

    if (!newSession) {
      return 'Invalid username or password.';
    }

    // Request fresh user data from the broker after session creation.
    setSession(newSession);
    DataBroker.saveSession(newSession);
    setIsLoginOpen(false);
    return undefined;
  };

  const handleLogout = () => {
    DataBroker.destroySession();
    setSession(null);
    setIsLoginOpen(false);
  };

  return (
    <>
      {session ? (
        <Dashboard
          session={session}
          onLoginClick={() => setIsLoginOpen(true)}
          onLogout={handleLogout}
          onSessionRefresh={refreshSessionFromBroker}
        />
      ) : (
        <div className="App">
          <main className="app-shell">
            <AppHeader
              title="Relib"
              subtitle="Reusable components playground"
              isLoggedIn={Boolean(session)}
              username={session?.user?.username}
              onLoginClick={() => setIsLoginOpen(true)}
              onLogout={handleLogout}
            />
            <div className="app-copy">
              <p className="eyebrow">Relib</p>
              <h1>Member access</h1>
              <p>Use the shared component set to sign in through a modal dialogue.</p>
              <button className="main-login-button" onClick={() => setIsLoginOpen(true)}>
                Login
              </button>
            </div>
          </main>
        </div>
      )}
      {isLoginOpen ? (
        <Login
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
        />
      ) : null}
    </>
  );
}

export default App;