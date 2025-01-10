import Box from "@mui/material/Box";
import { UserProvider } from "./Auth/UserContext";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import HomePage from "./pages/Layout";
import ProtectedRoute from "./Auth/ProtectedRoute";
import SignIn from "./pages/signIn";
import Profile from "./pages/Profile";
import Feed from "./components/Feed"; // Assuming Feed is a component, not an icon
import EditProfile from "./pages/EditProfile";

// Layout Component for Shared UI
const Layout = () => (
  <Box>
    <HomePage>
      <Outlet />
    </HomePage>
    {/* Shared layout elements like navbar or sidebar */}
  </Box>
);

function App() {
  const test = "hi";
  return (
    <Box
      sx={{
        margin: "0px !important",
      }}
    >
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Feed />} /> {/* Default child route */}
              <Route path="profile" element={<Profile />} />
              <Route path="editprofile" element={<EditProfile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </Box>
  );
}

export default App;
