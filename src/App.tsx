import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for the creation page (Home) */}
        <Route path="/" element={<Home />} />
        
        {/* Later we will add the reading route: <Route path="/s/:uuid" ... /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;