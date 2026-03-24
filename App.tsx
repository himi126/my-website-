import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { LifePage } from './pages/LifePage';
import { WorkPage } from './pages/WorkPage';
import { SettingsPage } from './pages/SettingsPage';
import './index.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="life" element={<LifePage />} />
            <Route path="work" element={<WorkPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
