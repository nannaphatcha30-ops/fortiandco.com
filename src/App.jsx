import { Routes, Route } from 'react-router-dom';
import ShopPage from './pages/ShopPage.jsx';
import ConfirmPage from './pages/ConfirmPage.jsx';
import QueuePage from './pages/QueuePage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <div className="phone">
        <Routes>
          <Route path="/" element={<ShopPage />} />
          <Route path="/confirm/:id" element={<ConfirmPage />} />
          <Route path="/queue" element={<QueuePage />} />
        </Routes>
      </div>
    </div>
  );
}
