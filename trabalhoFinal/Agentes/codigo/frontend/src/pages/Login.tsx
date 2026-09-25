import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { saveSession, type SessionUser } from '../api/auth';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const session = await api<{ token: string; usuario: SessionUser }>('/sessoes', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      });
      saveSession(session.token, session.usuario);
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no login');
    }
  }

  return (
    <form className="panel form" onSubmit={submit}>
      <h1>Entrar</h1>
      {error && <p className="error">{error}</p>}
      <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Senha<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required /></label>
      <button type="submit">Entrar</button>
      <p>Não tem conta? <Link to="/cadastro">Cadastre-se</Link>.</p>
    </form>
  );
}
