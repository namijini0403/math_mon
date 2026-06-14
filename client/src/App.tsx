import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useGame } from './game/store';
import { flushReportQueues } from './api';
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
import CorridorPage from './pages/CorridorPage';
import TowerPage from './pages/TowerPage';
import AssignmentPage from './pages/AssignmentPage';
import { CompanionCheer } from './components/CompanionCheer';
import { ErrorReportButton } from './components/ErrorReportButton';

export default function App() {
  const nickname = useGame((s) => s.nickname);
  // 오프라인 동안 쌓인 도움 요청/오류 신고를 앱 시작 시 재전송
  useEffect(() => { void flushReportQueues(); }, []);
  return (
    <>
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
          <Route path="/corridor" element={<CorridorPage />} />
          <Route path="/corridor/:unitId" element={<CorridorPage />} />
          <Route path="/tower/:skillId" element={<TowerPage />} />
          <Route path="/assignment/:id" element={<AssignmentPage />} />
          <Route path="/finalexam/:semesterId" element={<FinalExamPage />} />
          <Route path="/cards" element={<CardGalleryPage />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {nickname && <CompanionCheer />}
    {nickname && <ErrorReportButton />}
    </>
  );
}
