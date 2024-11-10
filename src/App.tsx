import { useState } from "react";
import { NavbarWithProfile } from "../np/components/Navbar";
import {
  NewPaperProvider,
  openWorkspace,
} from "../np/components/NewPaperProvider";
import { WorkspaceSelector } from "../np/components/WorkspaceSelector";
// Import your components from the np directory
// Example: import { YourComponent } from '@np/components/YourComponent';

function App() {
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  return (
    <NewPaperProvider apiBaseUrl="" loginPageUrl="">
      <NavbarWithProfile>Default App Name</NavbarWithProfile>
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
    </NewPaperProvider>
  );
}

export default App;
