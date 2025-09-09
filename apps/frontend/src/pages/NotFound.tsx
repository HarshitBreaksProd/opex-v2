import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <p className="mt-4">
          <Link to="/" className="text-primary underline underline-offset-4">
            Go home
          </Link>
        </p>
      </div>
    </div>
  );
}
