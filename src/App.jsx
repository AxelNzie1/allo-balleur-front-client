import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";

const Register = React.lazy(() => import("./pages/Register"));
const BailleurDashboard = React.lazy(() => import("./pages/BailleurDashboard"));
const HomePage = React.lazy(() => import("./pages/HomePage"));
const PropertiesSearchPage = React.lazy(() => import("./pages/PropertiesSearchPage"));
const PropertyDetail = React.lazy(() => import("./pages/PropertyDetails"));
const ModifierBien = React.lazy(() => import("./pages/ModifierBien"));

function Loader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '60vh',
      fontSize: '1.2rem',
      color: '#FF0086',
      fontWeight: 'bold'
    }}>
      Chargement de la page...
    </div>
  );
}

function App() {
  return (
    <>
      <Header />
      <div style={{ paddingTop: "70px" }}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<BailleurDashboard />} />
            <Route path="/modifier-bien/:id" element={<ModifierBien />} />
            <Route path="/properties" element={<PropertiesSearchPage />} />
            <Route path="/properties/:propertyId" element={<PropertyDetail />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;
