import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AuthMiddleware = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Check if user is logged in
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role if route requires it
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthMiddleware;
