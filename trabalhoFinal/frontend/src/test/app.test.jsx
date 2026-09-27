import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../App.jsx';
import { AuthProvider } from '../contexts/AuthContext.jsx';

function renderAt(path) {
  return render(<MemoryRouter initialEntries={[path]}><AuthProvider><App /></AuthProvider></MemoryRouter>);
}

describe('aplicação', () => {
  it('exibe a página inicial e a navegação principal', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: /o jogo inteiro/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Campeonatos' })).toBeInTheDocument();
  });

  it('protege a página de favoritos', () => {
    renderAt('/favoritos');
    expect(screen.getByRole('heading', { name: /bem-vindo de volta/i })).toBeInTheDocument();
  });

  it('exibe página não encontrada', () => {
    renderAt('/rota-inexistente');
    expect(screen.getByRole('heading', { name: /essa jogada não existe/i })).toBeInTheDocument();
  });
});
