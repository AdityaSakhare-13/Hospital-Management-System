import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();

  // Get token
  const token = localStorage.getItem("token");

  // Safe user parsing
  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("User parse error:", error);
    user = null;
  }

  // 🔒 Not logged in
  if (!token || !user) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ from: location }} // for redirect after login
      />
    );
  }

  // 🔒 Role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate 
        to="/unauthorized" 
        replace 
      />
    );
  }

  // ✅ Access granted
  return <Outlet />;
}

export default ProtectedRoute;