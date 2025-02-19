import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import AdminPage from "./pages/AdminPage";
import Home from "./pages/Home";
import AuthMiddleware from "./middleware/AuthMiddleware";
import React from "react";

const App = () => {
  React.useEffect(() => {
    document.title = "[HCM] SCORING system 2025";
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <AuthMiddleware>
                <Dashboard />
              </AuthMiddleware>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthMiddleware requireAdmin={true}>
                <AdminPage />
              </AuthMiddleware>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
