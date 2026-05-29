import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Charter from './pages/Charter.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/charter/:id" element={<Charter />} />
      </Routes>
    </BrowserRouter>
  );
}
