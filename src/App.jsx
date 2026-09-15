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
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="quiz-builder" element={<QuizBuilder />} />
      </Route>
    </Routes>
  );
}

export default App;