import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Auth/Login.jsx";
import SignUp from "./pages/Auth/SignUp.jsx";
import EditResume from "./pages/ResumeUpdate/EditResume.jsx";
import Dashboard from "./pages/Home/Dashboard.jsx";
import {Toaster} from "react-hot-toast";
import UserProvider from "./context/userContext.jsx";

const App = () => {
  return(
    <UserProvider>
      <div>
      <Router>
        <Routes>
          <Route path={"/"} element={<LandingPage />} />
          <Route path={"/login"} element={<Login />} />
          <Route path={"/signUp"} element={<SignUp />} />
          <Route path={"/dashboard"} element={<Dashboard />} />
          <Route path={"/resume/:resumeId"} element={<EditResume />} />
        </Routes>
      </Router>
      </div>

      <Toaster toastOptions={{className: "toaster", style: {
      fontsize: "13px"} }}/>
    </UserProvider>
  )
};

export default App;