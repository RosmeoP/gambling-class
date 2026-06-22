import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { RequireAuth } from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Dashboard } from "./pages/Dashboard";
import { Group } from "./pages/Group";
import { JoinGroup } from "./pages/JoinGroup";
import { Login } from "./pages/Login";
import { MyGroups } from "./pages/MyGroups";
import { NewGroup } from "./pages/NewGroup";
import { Register } from "./pages/Register";
import { Upcoming } from "./pages/Upcoming";

export function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <NavBar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/upcoming"
              element={
                <RequireAuth>
                  <Upcoming />
                </RequireAuth>
              }
            />
            <Route
              path="/groups"
              element={
                <RequireAuth>
                  <MyGroups />
                </RequireAuth>
              }
            />
            <Route
              path="/groups/new"
              element={
                <RequireAuth>
                  <NewGroup />
                </RequireAuth>
              }
            />
            <Route
              path="/groups/join"
              element={
                <RequireAuth>
                  <JoinGroup />
                </RequireAuth>
              }
            />
            <Route
              path="/groups/:id"
              element={
                <RequireAuth>
                  <Group />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
