import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * CohortAnalytics redirect - This page now redirects to the demo dashboard 
 * with the analytics section active, as the demo uses the same 
 * section-switching architecture as the production accelerator.
 */
const CohortAnalytics = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to demo dashboard - the sidebar's "Analytics" section handles this now
    navigate("/accelerator-demo", { replace: true });
  }, [navigate]);

  return null;
};

export default CohortAnalytics;