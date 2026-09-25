import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { loginUser } from '../services/auth-api.js';
import { BallIcon } from '../components/Icons.jsx';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const session = await loginUser(form);
      signIn(session.token);
      navigate(location.state?.from ?? '/campeonatos', { replace: true });
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }

  return <AuthPage title="Bem-vindo de volta" subtitle="Entre para acessar seus favoritos.">
    <form className="form" onSubmit={submit}>
      {error && <div className="form-error">{error}</div>}
      <label>E-mail<input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" /></label>
      <label>Senha<input type="password" required autoComplete="current-password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} placeholder="Sua senha" /></label>
      <button className="button button-primary button-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      <p className="form-switch">Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
    </form>
  </AuthPage>;
}

export function AuthPage({ title, subtitle, children }) {
  return <section className="auth-section"><div className="auth-panel"><Link className="auth-brand" to="/"><span className="brand-mark"><BallIcon /></span> PLACAR</Link><div className="auth-heading"><span className="eyebrow dark"><span /> Área do torcedor</span><h1>{title}</h1><p>{subtitle}</p></div>{children}</div><div className="auth-art"><blockquote>“Futebol é a coisa mais importante entre as menos importantes.”</blockquote><span>— Arrigo Sacchi</span></div></section>;
}
