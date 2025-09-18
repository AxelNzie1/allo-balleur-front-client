// src/components/Schemas.jsx
export const PaymentTypes = {
  VIEW_NUMBER: "view_number",
  BAILLEUR_PRO: "bailleur_pro", 
  PROMOTION: "annonce_mise_en_avant",
  COMMISSION: "commission_loyer"
};

export const createPaymentPayload = (propertyId) => ({
  type: PaymentTypes.PROMOTION,
  property_id: propertyId  // snake_case comme attendu par le backend
});

export const PropertyStatus = {
  DISPONIBLE: "DISPONIBLE",
  OCCUPE: "OCCUPE"
};

