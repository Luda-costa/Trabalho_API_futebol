import { apiRequest, queryString } from './api.js';

export const listFavorites = (filters) => apiRequest(`/favoritos${queryString(filters)}`);
export const createFavorite = (input) => apiRequest('/favoritos', {
  method: 'POST',
  headers: { 'Idempotency-Key': crypto.randomUUID() },
  body: JSON.stringify(input)
});
export const removeFavorite = (id) => apiRequest(`/favoritos/${id}`, { method: 'DELETE' });
