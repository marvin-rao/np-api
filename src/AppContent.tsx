import { useState } from "react";
import { NPMainActionBar } from "../np/components/Navbar";
import { openWorkspace } from "../np/components/NewPaperProvider";
import { WorkspaceSelector } from "../np/components/WorkspaceSelector";
import { useAuthSession } from "../helper/provider";
import { LoginButton } from "../helper/AuthHelper";
// Import your components from the np directory
// Example: import { YourComponent } from '@np/components/YourComponent';

export function AppContent() {
  const { shouldLogin } = useAuthSession();
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  if (shouldLogin) {
    return <LoginButton />;
  }

  return (
    <div>
      <NPMainActionBar>Default App Name</NPMainActionBar>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">
          Component Testing Environment
        </h1>
        <button onClick={() => setShowProjectSelector(true)}>
          Open Projects Selector
        </button>
        <div className="space-y-8">
          {/* Add your components here for testing */}
          {/* Example: <YourComponent /> */}
        </div>
        <WorkspaceSelector
          demoMode={true}
          onSelect={({ id }) => openWorkspace({ id })}
          open={showProjectSelector}
          onClose={() => setShowProjectSelector(false)}
        />
      </div>
    </div>
  );
}
