import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setError } from "../state/auth.slice";
import { useAuth } from "../hooks/useAuth";

/**
 * AuthCallback
 * Handles the redirect from the backend after Google OAuth.
 *
 * The backend redirects to /auth/callback with no token in the URL — the
 * session rides in an httpOnly cookie the browser sends automatically. So this
 * page just asks /api/auth/me who we are and moves on.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleGetCurrentUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("error")) {
      dispatch(setError("Google sign-in failed. Please try again."));
      navigate("/login", { replace: true });
      return;
    }

    handleGetCurrentUser().then((user) => {
      navigate(user ? "/" : "/login", { replace: true });
    });
  }, []);

  return (
    <div
      className="flex items-center justify-center w-screen min-h-screen bg-[#0a0a0a]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Spinning ring */}
        <div
          className="w-12 h-12 rounded-full border-[3px] border-[rgba(245,197,24,0.15)] border-t-[#F5C518] animate-spin"
        />
        <div className="flex flex-col items-center gap-1">
          <p
            className="font-['Montserrat'] text-[13px] font-bold tracking-[0.18em] uppercase"
            style={{ color: "#F5C518", fontFamily: "'Montserrat', sans-serif" }}
          >
            Signing you in
          </p>
          <p
            className="font-['Inter'] text-[12px]"
            style={{ color: "rgba(209,197,172,0.4)" }}
          >
            Please wait…
          </p>
        </div>
      </div>
    </div>
  );
}
