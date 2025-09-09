import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Unauthorized</h2>
        <p className="text-muted-foreground">
          You don’t have access to this page.
        </p>
        <p className="mt-4">
          <Link to="/" className="text-primary underline underline-offset-4">
            Go to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
