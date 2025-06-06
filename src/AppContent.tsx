import { useState } from "react";
import { NPMainActionBar } from "../np/components/Navbar";
import { openWorkspace } from "../np/components/NewPaperProvider";
import { WorkspaceSelector } from "../np/components/WorkspaceSelector";
import { useAuthSession } from "../helper/provider";
import { LoginButton } from "../helper/AuthHelper";
import "./AppContent.css";
// Import your components from the np directory
// Example: import { YourComponent } from '@np/components/YourComponent';

export function AppContent() {
  const { shouldLogin } = useAuthSession();
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  if (shouldLogin) {
    return <LoginButton />;
  }

  return (
    <div className="app-container">
      <NPMainActionBar>NP Development Suite</NPMainActionBar>
      
      <div className="main-content fade-in-up">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            Component Testing Environment
          </h1>
          <p className="hero-subtitle">
            Build, test, and iterate on your components in a beautiful development environment
          </p>
          <button 
            className="primary-button"
            onClick={() => setShowProjectSelector(true)}
          >
            Launch Project Selector
          </button>
        </div>

        {/* Stats Section */}
        <div className="stats-section fade-in-up-delay-1">
          <div className="stat-item">
            <span className="stat-number">100+</span>
            <span className="stat-label">Components</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Development</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">∞</span>
            <span className="stat-label">Possibilities</span>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section fade-in-up-delay-2">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3 className="feature-title">Fast Development</h3>
            <p className="feature-description">
              Rapid prototyping and testing with hot reload and instant feedback loops
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3 className="feature-title">Beautiful Design</h3>
            <p className="feature-description">
              Modern UI components with stunning visual design and smooth animations
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">High Performance</h3>
            <p className="feature-description">
              Optimized for speed and efficiency with minimal bundle size
            </p>
          </div>
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
        demoMode={true}
        onSelect={({ id }) => openWorkspace({ id })}
        open={showProjectSelector}
        onClose={() => setShowProjectSelector(false)}
      />
    </div>
  );
}
