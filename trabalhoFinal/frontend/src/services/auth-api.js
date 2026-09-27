import { apiRequest } from './api.js';

export const registerUser = (input) => apiRequest('/usuarios', { method: 'POST', body: JSON.stringify(input) });
export const loginUser = (input) => apiRequest('/sessoes', { method: 'POST', body: JSON.stringify(input) });
