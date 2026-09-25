import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearSession, currentUser } from '../api/auth';

export function Layout() {
  const navigate = useNavigate();
  const user = currentUser();

  function logout() {
    clearSession();
    navigate('/login');
  }

  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">Campeonatos</Link>
        <nav>
          <Link to="/">Início</Link>
          {user && <Link to="/favoritos">Favoritos</Link>}
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {!user ? <Link to="/login">Entrar</Link> : <button onClick={logout}>Sair</button>}
        </nav>
      </header>
      <main className="container"><Outlet /></main>
    </>
  );
}
