import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import AuthorProfile from "./pages/AuthorProfile.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import Profile from "./pages/Profile.jsx";
import QuizBuilder from "./pages/QuizBuilder.jsx";
import Quizzes from "./pages/Quizzes.jsx";
import Register from "./pages/Register.jsx";
import TakeQuiz from "./pages/TakeQuiz.jsx";
import TopologyPractice from "./pages/TopologyPractice.jsx";
import PCBuildCanvas from "./pages/PCBuildCanvas.jsx";
import AuthorBio from "./pages/AuthorBio.jsx";
import Trending from "./pages/Trending.jsx";
import SubnetCalculator from "./pages/SubnetCalculator.jsx";
import AnnouncementsAdmin from "./pages/AnnouncementsAdmin.jsx";
import PracticeHub from "./pages/PracticeHub.jsx";
import HardwareCollection from "./pages/hardwareCollection.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="create" element={<CreatePost />} />
        <Route path="edit/:id" element={<CreatePost />} />
        <Route path="posts/:slug" element={<PostDetail />} />
        <Route path="authors/:id" element={<AuthorProfile />} />
        <Route path="my-posts" element={<MyPosts />} />
        <Route path="profile" element={<Profile />} />
        <Route path="/quizzes/:id" element={<TakeQuiz />} />
        <Route path="/practice" element={<PracticeHub />} />
        <Route path="/hardware" element={<HardwareCollection />} /> 
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/topology-practice" element={<TopologyPractice />} />
        <Route path="quiz-builder" element={<QuizBuilder />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/tools/subnet" element={<SubnetCalculator />} />
        <Route path="/authors/detail/:id" element={<AuthorBio />} />
        <Route path="/pc-build-practice" element={<PCBuildCanvas />} />

        {/* SuperAdmin only */}
        <Route path="admin/announcements" element={<AnnouncementsAdmin />} />
      </Route>
    </Routes>
  );
}

export default App;