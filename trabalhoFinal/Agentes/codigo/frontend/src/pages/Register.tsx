import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/usuarios', { method: 'POST', body: JSON.stringify({ nome, email, senha }) });
      navigate('/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no cadastro');
    }
  }

  return (
    <form className="panel form" onSubmit={submit}>
      <h1>Cadastro</h1>
      {error && <p className="error">{error}</p>}
      <label>Nome<input value={nome} onChange={(e) => setNome(e.target.value)} required /></label>
      <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Senha<input type="password" minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} required /></label>
      <button type="submit">Criar conta</button>
      <p>Já possui conta? <Link to="/login">Entre</Link>.</p>
    </form>
  );
}
