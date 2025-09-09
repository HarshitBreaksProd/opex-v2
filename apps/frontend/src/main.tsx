import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "@/pages/Signup";
import Trade from "@/pages/Trade";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <Signup /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/trade", element: <Trade /> }],
  },
  { path: "*", element: <NotFound /> },
]);

function Root() {
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);

export default Root;
