import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SecretView from './pages/SecretView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for the creation page (Home) */}
        <Route path="/" element={<Home />} />
        
        {/* Route for viewing a secret by its UUID */}
        <Route path="/s/:uuid" element={<SecretView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;