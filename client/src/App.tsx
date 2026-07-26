import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OrgApplyPage } from "./pages/OrgApplyPage";
import { OrgApplicationsQueuePage } from "./pages/OrgApplicationsQueuePage";
import { OrgProfilePage } from "./pages/OrgProfilePage";
import { Role } from "./types";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/orgs/:id" element={<OrgProfilePage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/orgs/apply" element={<OrgApplyPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole={Role.PLATFORM_ADMIN} />}>
            <Route path="/orgs/applications" element={<OrgApplicationsQueuePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
