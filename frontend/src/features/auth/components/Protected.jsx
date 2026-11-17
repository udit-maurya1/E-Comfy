import { useSelector } from "react-redux";
import { Navigate } from "react-router";

/**
 * The session cookie is httpOnly, so the browser can't read it — and shouldn't.
 * Redux state, seeded by the /api/auth/me call in App.jsx, is what tells us
 * whether a session exists. The server re-verifies the token on every request
 * regardless; these guards only decide what to render.
 */
export function ProtectedUser({ children }) {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default function Protected({ children, role = "buyer" }) {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}
