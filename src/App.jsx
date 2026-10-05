import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import { Toaster } from "react-hot-toast";
import ActivityLog from "./pages/ActivityLog.jsx";
import AnnouncementDetail from "./pages/AnnouncementDetail.jsx";
import AnnouncementsAdmin from "./pages/AnnouncementsAdmin.jsx";
import AuthorBio from "./pages/AuthorBio.jsx";
import AuthorProfile from "./pages/AuthorProfile.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import CreateTicketPage from "./pages/CreateTicketPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Following from "./pages/Following.jsx";
import HardwareCollection from "./pages/HardwareCollection.jsx";
import { ContentPolicyPage, PrivacyPage, TermsPage } from "./pages/Legal.jsx";
import Login from "./pages/Login.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import PCBuildCanvas from "./pages/PCBuildCanvas.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import PracticeHub from "./pages/PracticeHub.jsx";
import Profile from "./pages/Profile.jsx";
import QuizBuilder from "./pages/QuizBuilder.jsx";
import Quizzes from "./pages/Quizzes.jsx";
import ReadingListPage from "./pages/ReadingListPage.jsx";
import Register from "./pages/Register.jsx";
import SubnetCalculator from "./pages/SubnetCalculator.jsx";
import TagPosts from "./pages/TagPosts.jsx";
import TakeQuiz from "./pages/TakeQuiz.jsx";
import TicketDetailPage from "./pages/TicketDetailPage.jsx";
import TicketsPage from "./pages/TicketsPage.jsx";
import TopologyPractice from "./pages/TopologyPractice.jsx";
import Trending from "./pages/Trending.jsx";
import CreateTicketUserPage from "./pages/CreateTicketUserPage.jsx";

function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid #334155",
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ===== HALAMAN KHUSUS TANPA SIDEBAR & TOPBAR ===== */}
        <Route
          path="/user/tickets/create"
          element={
            <CreateTicketUserPage />
          }
        />

        {/* ===== LAYOUT UTAMA (ada Sidebar + TopBar) ===== */}
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
          <Route path="following" element={<Following />} />
          <Route path="tags/:tag" element={<TagPosts />} />
          <Route path="quizzes/:id" element={<TakeQuiz />} />
          <Route path="admin/activities" element={<ActivityLog />} />
          <Route path="practice" element={<PracticeHub />} />
          
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route path="tickets/:id" element={<CreateTicketPage />} />
          
          <Route path="hardware" element={<HardwareCollection />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="topology-practice" element={<TopologyPractice />} />
          <Route path="quiz-builder" element={<QuizBuilder />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="content-policy" element={<ContentPolicyPage />} />
          <Route path="trending" element={<Trending />} />
          <Route path="tools/subnet" element={<SubnetCalculator />} />
          <Route path="announcements/:id" element={<AnnouncementDetail />} />
          <Route path="reading-list" element={<ReadingListPage />} />
          <Route path="authors/detail/:id" element={<AuthorBio />} />
          <Route path="pc-build-practice" element={<PCBuildCanvas />} />
          <Route path="admin/announcements" element={<AnnouncementsAdmin />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;