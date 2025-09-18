// src/components/ui/Card.jsx
const Card = ({ children, className = "" }) => {
    return (
      <div
        className={`bg-white rounded-2xl shadow-md p-4 mb-4 transition duration-300 hover:shadow-lg ${className}`}
      >
        {children}
      </div>
    );
  };
  
  export default Card;
  