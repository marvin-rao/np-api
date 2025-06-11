import { NewPaperProvider } from "../np/components/NewPaperProvider";
import { AppContent } from "./AppContent";
// Import your components from the np directory
// Example: import { YourComponent } from '@np/components/YourComponent';

function App() {
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
