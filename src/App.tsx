import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { Layout } from './Layout';
import { HomePage } from './HomePage';
import { LifePage } from './LifePage';
import { WorkPage } from './WorkPage';
import { SettingsPage } from './SettingsPage';
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
