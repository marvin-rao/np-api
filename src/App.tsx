import { NewPaperProvider } from "../np/components/NewPaperProvider";
import { AppContent } from "./AppContent";
// Import your components from the np directory
// Example: import { YourComponent } from '@np/components/YourComponent';

function App() {
  return (
    <NewPaperProvider
      callerProduct={"recruit"}
      apiBaseUrl={"https://newpaper.app/api/"}
      loginPageUrl={"https://newpaper.app/account/login"}
      onSessionExpired={() => {
        // Handle session expiration (e.g., redirect to login page)
        alert("Session expired. Please log in again.");
      }}
    >
      <AppContent />
    </NewPaperProvider>
  );
}

export default App;
