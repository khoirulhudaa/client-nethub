import { Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import { Toaster } from "react-hot-toast";
import ActivityLog from "./pages/ActivityLog.jsx";
import AnnouncementDetail from "./pages/AnnouncementDetail.jsx";
import AnnouncementsAdmin from "./pages/AnnouncementsAdmin.jsx";
import AuthorBio from "./pages/AuthorBio.jsx";
import AuthorProfile from "./pages/AuthorProfile.jsx";
import Cameras from "./pages/Camera.jsx";
import ContactForm from "./pages/ContactForm.jsx";
import Contacts from "./pages/Contacts.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import CreateTicketPage from "./pages/CreateTicketPage.jsx";
import CreateTicketUserPage from "./pages/CreateTicketUserPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Following from "./pages/Following.jsx";
import HardwareCollection from "./pages/HardwareCollection.jsx";
import InstallAppPage from "./pages/InstallAppPage.jsx";
import { ContentPolicyPage, PrivacyPage, TermsPage } from "./pages/Legal.jsx";
import Login from "./pages/Login.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import PCBuildCanvas from "./pages/PCBuildCanvas.jsx";
import PcForm from "./pages/PcForm.jsx";
import Pcs from "./pages/Pcs.jsx";
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
import TaskForm from "./pages/TaskForm.jsx";
import Tasks from "./pages/Tasks.jsx";
import TicketDetailPage from "./pages/TicketDetailPage.jsx";
import TicketsPage from "./pages/TicketsPage.jsx";
import TopologyPractice from "./pages/TopologyPractice.jsx";
import TrackTicketPage from "./pages/TrackTicketPage.jsx";
import Trending from "./pages/Trending.jsx";

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
      <Route path="/private/1a2b3c4d/register" element={<Register />} />
      <Route path="/ticket" element={<CreateTicketUserPage />} />
      <Route path="/install" element={<InstallAppPage />} />

      <Route path="/" element={<AppLayout />}>
        {/* ===== PUBLIK: siapa pun bisa buka ===== */}
        <Route index element={<Dashboard />} />
        <Route path="posts/:slug" element={<PostDetail />} />
        <Route path="authors/:id" element={<AuthorProfile />} />
        <Route path="authors/detail/:id" element={<AuthorBio />} />
        <Route path="tags/:tag" element={<TagPosts />} />
        <Route path="trending" element={<Trending />} />
        <Route path="tools/subnet" element={<SubnetCalculator />} />
        <Route path="announcements/:id" element={<AnnouncementDetail />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="content-policy" element={<ContentPolicyPage />} />
        <Route path="topology-practice" element={<TopologyPractice />} />
        <Route path="pc-build-practice" element={<PCBuildCanvas />} />
        <Route path="practice" element={<PracticeHub />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="quizzes/:id" element={<TakeQuiz />} />

        {/* ===== PRIVAT: wajib login ===== */}
        <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
          <Route path="create" element={<CreatePost />} />
          <Route path="edit/:id" element={<CreatePost />} />
          <Route path="my-posts" element={<MyPosts />} />
          <Route path="profile" element={<Profile />} />
          <Route path="following" element={<Following />} />
          <Route path="reading-list" element={<ReadingListPage />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/create" element={<TaskForm />} />
          <Route path="tasks/edit/:id" element={<TaskForm />} />
          <Route path="remote" element={<Pcs />} />
          <Route path="remote/create" element={<PcForm />} />
          <Route path="remote/edit/:id" element={<PcForm />} />
          <Route path="camera" element={<Cameras />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/create" element={<ContactForm />} />
          <Route path="contacts/edit/:id" element={<ContactForm />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route path="tickets/create" element={<CreateTicketPage />} />
          <Route path="user/tickets/track" element={<TrackTicketPage />} />
          <Route path="hardware" element={<HardwareCollection />} />
          <Route path="quiz-builder" element={<QuizBuilder />} />
          <Route path="admin/activities" element={<ActivityLog />} />
          <Route path="admin/announcements" element={<AnnouncementsAdmin />} />
        </Route>
      </Route>
    </Routes>
    </>
  );
}

export default App;