import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", margin: "120px auto" }}>
      <h2>Page not found</h2>
      <p style={{ color: "#666" }}>
        The page you are looking for does not exist.
      </p>
      <p style={{ marginTop: 16 }}>
        <Link to="/" style={{ color: "#646cff" }}>
          Go home
        </Link>
      </p>
    </div>
  );
}
