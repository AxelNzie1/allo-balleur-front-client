import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";

// 🔹 Lazy loading des pages
const Register = React.lazy(() => import("./pages/Register"));
const BailleurDashboard = React.lazy(() => import("./pages/BailleurDashboard"));
const HomePage = React.lazy(() => import("./pages/HomePage"));
const PropertiesSearchPage = React.lazy(() => import("./pages/PropertiesSearchPage"));
const PropertyDetail = React.lazy(() => import("./pages/PropertyDetails"));
const ModifierBien = React.lazy(() => import("./pages/ModifierBien"));

function App() {
  return (
    <>
      <Header />
      <div style={{ paddingTop: "70px" }}>
        {/* 🔹 Suspense pour gérer le fallback pendant le chargement */}
        <Suspense fallback={<div>Chargement de la page...</div>}>
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
