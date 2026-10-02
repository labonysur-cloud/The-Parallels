import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MissionDashboard from './pages/MissionDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<MissionDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
