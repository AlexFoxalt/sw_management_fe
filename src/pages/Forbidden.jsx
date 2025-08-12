import { useSearchParams, Link } from "react-router-dom";

export default function ForbiddenPage() {
  const [params] = useSearchParams();
  const message =
    params.get("message") || "You do not have access to this page.";
  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>Access restricted</h2>
      <p>{message}</p>
      <p>
        <Link to="/">Go to home</Link>
      </p>
    </div>
  );
}
