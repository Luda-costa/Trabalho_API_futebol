import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { createFavorite } from '../services/favorites-api.js';
import { StarIcon } from './Icons.jsx';

export function FavoriteButton({ tipo, itemExternoId }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  async function addFavorite() {
    if (!isAuthenticated) return navigate('/login');
    setState('loading');
    setMessage('');
    try {
      await createFavorite({ tipo, itemExternoId: String(itemExternoId) });
      setState('done');
      setMessage('Adicionado aos favoritos');
    } catch (error) {
      setState(error.code === 'FAVORITO_DUPLICADO' ? 'done' : 'idle');
      setMessage(error.message);
    }
  }

  return (
    <div className="favorite-action">
      <button className={`icon-button ${state === 'done' ? 'is-favorite' : ''}`} onClick={addFavorite} disabled={state === 'loading'} aria-label="Adicionar aos favoritos">
        <StarIcon filled={state === 'done'} />
      </button>
      {message && <span className="action-message">{message}</span>}
    </div>
  );
}
