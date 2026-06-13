import { Navigate, Route, Routes } from 'react-router-dom';
import { useGame } from './game/store';
import UnitMapPage from './pages/UnitMapPage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import TeacherPage from './pages/TeacherPage';
import PracticePage from './pages/PracticePage';
import DragonPage from './pages/DragonPage';
import ExamPage from './pages/ExamPage';
import CardGalleryPage from './pages/CardGalleryPage';
import PracticeHubPage from './pages/PracticeHubPage';
import FinalExamPage from './pages/FinalExamPage';

export default function App() {
  const nickname = useGame((s) => s.nickname);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/teacher" element={<TeacherPage />} />
      {nickname ? (
        <>
          <Route path="/" element={<UnitMapPage />} />
          <Route path="/lesson/:stageId" element={<LessonPage />} />
          <Route path="/hub" element={<PracticeHubPage />} />
          <Route path="/practice/:mode/:unitId" element={<PracticePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dragon" element={<DragonPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/exam/:unitId" element={<ExamPage />} />
          <Route path="/finalexam/:semesterId" element={<FinalExamPage />} />
          <Route path="/cards" element={<CardGalleryPage />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
