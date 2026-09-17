import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verifying Authentication
          </h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  // Not authenticated, don't render anything (useEffect will redirect)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated and authorized, render child routes
  return <Outlet context={{ user, token }} />;
};

export default ProtectedRoute;
