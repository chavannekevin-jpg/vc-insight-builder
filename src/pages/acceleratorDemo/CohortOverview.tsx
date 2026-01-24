import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * CohortOverview redirect - This page now redirects to the demo dashboard 
 * with the portfolio section active, as the demo uses the same 
 * section-switching architecture as the production accelerator.
 */
const CohortOverview = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to demo dashboard - the sidebar's "Portfolio" section handles this now
    navigate("/accelerator-demo", { replace: true });
  }, [navigate]);

  return null;
};

export default CohortOverview;