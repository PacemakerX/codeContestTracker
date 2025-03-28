// Import React and ReactDOM dependencies
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Import routing dependencies
import { HashRouter as Router } from "react-router-dom";

// Import Redux dependencies
import { Provider } from "react-redux";
import store from "./redux/store";

// Import styles and main App component
import "./index.css";
import App from "./App.jsx";

// Create and render the root component
createRoot(document.getElementById("root")).render(
  // StrictMode helps identify potential problems in the application
  <StrictMode>
    {/* Provider makes the Redux store available to nested components */}
    <Provider store={store}>
      {/* Router enables client-side routing (HashRouter works better with GitHub pages) */}
      <Router>
        <App />
      </Router>
    </Provider>
  </StrictMode>
);
