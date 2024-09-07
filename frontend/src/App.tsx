import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import ChatRoom from './components/ChatRoom';
import UnderConstruction from './pages/UnderConstruction';

const App = () => {
  const isUnderConstruction = import.meta.env.VITE_UNDER_CONSTRUCTION === 'true';

  return (
    <Router>
      <div className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatRoom />} />
        </Routes>
        {isUnderConstruction && <UnderConstruction />}
      </div>
    </Router>
  );
};

export default App;