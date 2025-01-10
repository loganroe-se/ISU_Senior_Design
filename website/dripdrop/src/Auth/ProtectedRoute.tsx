// ProtectedRoute.tsx
import React from "react";
import { useNavigate } from "react-router";
import { useUserContext } from "./UserContext";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const context = useUserContext();
  const navigate = useNavigate();

  if (!context?.user) {
    return <>{navigate("/")}</>;
  }

  return children;
};

export default ProtectedRoute;
