import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";
import * as styles from "../styles/shared";

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div style={styles.centeredPage}>
      <h1>UM-Squared</h1>
      <p>RSO social media platform for UMass Schools</p>

      {user ? (
        <div>
          <p>Signed in as {user.displayName}</p>
          <nav style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link to="/orgs/apply">Apply to create an organization</Link>
            {user.role === Role.PLATFORM_ADMIN && (
              <Link to="/orgs/applications">Review organization applications</Link>
            )}
            {user.organizationId && <Link to={`/orgs/${user.organizationId}`}>My organization</Link>}
          </nav>
          <button style={{ ...styles.secondaryButton, marginTop: "20px" }} onClick={() => logout()}>
            Log out
          </button>
        </div>
      ) : (
        <nav style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link to="/login">Log in</Link>
          <Link to="/register">Register</Link>
        </nav>
      )}
    </div>
  );
}
