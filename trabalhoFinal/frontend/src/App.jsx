import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AdminUsuariosPage } from './pages/AdminUsuariosPage.jsx';
import { CadastroPage } from './pages/CadastroPage.jsx';
import { CampeonatoDetalhesPage } from './pages/CampeonatoDetalhesPage.jsx';
import { CampeonatosPage } from './pages/CampeonatosPage.jsx';
import { FavoritosPage } from './pages/FavoritosPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { PartidasPage } from './pages/PartidasPage.jsx';
import { TimeDetalhesPage } from './pages/TimeDetalhesPage.jsx';
import { TimesPage } from './pages/TimesPage.jsx';

export function App() {
  return <Routes><Route element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="cadastro" element={<CadastroPage />} />
    <Route path="campeonatos" element={<CampeonatosPage />} />
    <Route path="campeonatos/:id" element={<CampeonatoDetalhesPage />} />
    <Route path="times" element={<TimesPage />} />
    <Route path="times/:id" element={<TimeDetalhesPage />} />
    <Route path="partidas" element={<PartidasPage />} />
    <Route path="favoritos" element={<ProtectedRoute><FavoritosPage /></ProtectedRoute>} />
    <Route path="admin/usuarios" element={<ProtectedRoute admin><AdminUsuariosPage /></ProtectedRoute>} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes>;
}
