import { useState } from "react";
import { NPMainActionBar } from "../np/components/Navbar";
import {
  NewPaperProvider,
  openWorkspace,
} from "../np/components/NewPaperProvider";
import { WorkspaceSelector } from "../np/components/WorkspaceSelector";
import { AppContent } from "./AppContent";
// Import your components from the np directory
// Example: import { YourComponent } from '@np/components/YourComponent';

function App() {
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  return (
    <NewPaperProvider
      apiBaseUrl={"https://newpaper.app/api/"}
      loginPageUrl={"https://newpaper.app/account/login"}
    >
      <AppContent />
    </NewPaperProvider>
  );
}

export default App;
