import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Protected } from './components/Protected';
import { Admin } from './pages/Admin';
import { CompetitionDetail } from './pages/CompetitionDetail';
import { Favorites } from './pages/Favorites';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/campeonatos/:id" element={<CompetitionDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/favoritos" element={<Protected><Favorites /></Protected>} />
          <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
