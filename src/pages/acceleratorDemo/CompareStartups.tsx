import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * CompareStartups redirect - This feature doesn't exist in the production 
 * accelerator dashboard, so we redirect to the main demo dashboard.
 * The demo environment mirrors production exactly.
 */
const CompareStartups = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to demo dashboard - Compare Startups doesn't exist in production
    navigate("/accelerator-demo", { replace: true });
  }, [navigate]);

  return null;
};

export default CompareStartups;