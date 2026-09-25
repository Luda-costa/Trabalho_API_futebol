import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/auth-api.js';
import { AuthPage } from './LoginPage.jsx';

export function CadastroPage() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault(); setLoading(true); setError('');
    try { await registerUser(form); navigate('/login', { state: { registered: true } }); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }

  return <AuthPage title="Crie sua conta" subtitle="Salve seus favoritos e acompanhe o que importa."><form className="form" onSubmit={submit}>
    {error && <div className="form-error">{error}</div>}
    <label>Nome<input required minLength="2" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome" /></label>
    <label>E-mail<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" /></label>
    <label>Senha<input type="password" required minLength="8" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} placeholder="Mínimo de 8 caracteres" /></label>
    <button className="button button-primary button-full" disabled={loading}>{loading ? 'Criando conta...' : 'Criar conta'}</button>
    <p className="form-switch">Já possui uma conta? <Link to="/login">Entrar</Link></p>
  </form></AuthPage>;
}
