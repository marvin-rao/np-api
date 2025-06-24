import { useState } from "react";
import { NPMainActionBar } from "../np/components/Navbar";
import { openWorkspace } from "../np/components/NewPaperProvider";
import { WorkspaceSelector } from "../np/components/workspace/WorkspaceSelector";
import { useAuthSession } from "../helper/provider";
import { LoginButton } from "../helper/AuthHelper";
import "./AppContent.css";
// Import your components from the np directory
// Example: import { YourComponent } from '@np/components/YourComponent';

export function AppContent() {
  const { shouldLogin, loading } = useAuthSession();
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  if (loading) {
    return (
      <div
        className="loading-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    ); // You can replace this with a loading spinner or skeleton
  }

  if (shouldLogin) {
    return <LoginButton />;
  }

  return (
    <div className="app-container">
      <NPMainActionBar>NP Development Suite</NPMainActionBar>

      <div className="main-content">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">Component Testing Environment</h1>
          <p className="hero-subtitle">
            Build, test, and iterate on your components in a clean development
            environment
          </p>
          <button
            className="primary-button"
            onClick={() => setShowProjectSelector(true)}
          >
            Launch Project Selector
          </button>
        </div>

        {/* Component Testing Area */}
        <div className="component-testing-area">
          <h2 className="testing-area-title">Component Testing Area</h2>
          <p className="testing-area-subtitle">
            Your components will appear here for testing and development
          </p>
          {/* Add your components here for testing */}
          {/* Example: <YourComponent /> */}
        </div>
      </div>

      <WorkspaceSelector
        onSelect={({ id }) => openWorkspace({ id })}
        open={showProjectSelector}
        onClose={() => setShowProjectSelector(false)}
      />
    </div>
  );
}
