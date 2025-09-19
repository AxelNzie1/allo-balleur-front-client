import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Register from "./pages/Register";
import BailleurDashboard from "./pages/BailleurDashboard";
import HomePage from "./pages/HomePage";
import PropertiesSearchPage from './pages/PropertiesSearchPage';
import PropertyDetail from "./pages/PropertyDetails";
import ModifierBien from "./pages/ModifierBien";


function App() {
  return (
    <>
      <Header />
      <div style={{ paddingTop: "70px" }}>
        <Routes>
          <Route path="/" element={<HomePage />} /> 
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<BailleurDashboard />} />
          <Route path="/modifier-bien/:id" element={<ModifierBien />} />
          <Route path="/properties" element={<PropertiesSearchPage />} />
          <Route path="/properties/:propertyId" element={<PropertyDetail />} />

        </Routes>
      </div>
    </>
  );
}

export default App;
