import { Navigate, Outlet } from "react-router-dom";
import { useSessionProbe } from "@/lib/session";

export default function ProtectedRoute() {
  const { isLoading, isSuccess } = useSessionProbe();

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: 48 }}>
        Checking session…
      </div>
    );
  }

  if (!isSuccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
