import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { BallIcon, UserIcon } from './Icons.jsx';

const publicLinks = [
  ['/campeonatos', 'Campeonatos'],
  ['/times', 'Times'],
  ['/partidas', 'Partidas']
];

export function Layout() {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function logout() {
    signOut();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container nav-wrap">
          <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark"><BallIcon size={27} /></span>
            <span>PLACAR</span>
          </Link>
          <button className="menu-toggle" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
          <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegação principal">
            {publicLinks.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}>{label}</NavLink>)}
            {isAuthenticated && <NavLink to="/favoritos" onClick={() => setMenuOpen(false)}>Favoritos</NavLink>}
            {isAdmin && <NavLink to="/admin/usuarios" onClick={() => setMenuOpen(false)}>Administração</NavLink>}
          </nav>
          <div className={`nav-actions ${menuOpen ? 'is-open' : ''}`}>
            {isAuthenticated ? (
              <button className="button button-ghost" onClick={logout}><UserIcon /> Sair</button>
            ) : (
              <>
                <Link className="button button-ghost" to="/login"><UserIcon /> Entrar</Link>
                <Link className="button button-primary button-small" to="/cadastro">Criar conta</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="brand brand-footer"><span className="brand-mark"><BallIcon size={22} /></span><span>PLACAR</span></div>
          <p>Dados esportivos fornecidos pela football-data.org.</p>
          <p>Projeto acadêmico · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
