import { Link, useNavigate } from "react-router-dom";
import Button from "web/ui/Button";

const NoMatch = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#fafafa",
      }}
    >
      <h2
        style={{
          fontSize: "3rem",
          marginBottom: "2rem",
          color: "#2d3748",
          fontWeight: "500",
        }}
      >
        Nothing to see here!
      </h2>

      <div style={{ display: "flex", gap: "12px" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button variant="primary">
            Go to Home
          </Button>
        </Link>

        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NoMatch;
