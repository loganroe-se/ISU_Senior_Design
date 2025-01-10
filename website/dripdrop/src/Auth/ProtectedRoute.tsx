// ProtectedRoute.tsx
import React from "react";
import { useUserContext } from "./UserContext";
import SignIn from "../pages/signIn";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const context = useUserContext();

  if (!context?.user) {
    return <SignIn />;
  }

  return children;
};

export default ProtectedRoute;
