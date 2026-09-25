import { apiRequest, queryString } from './api.js';

export const listUsers = (filters) => apiRequest(`/admin/usuarios${queryString(filters)}`);
export const setUserActive = (id, ativo) => apiRequest(`/admin/usuarios/${id}`, {
  method: 'PATCH',
  body: JSON.stringify({ ativo })
});
