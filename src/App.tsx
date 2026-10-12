/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { ToastContainer } from './components/Toast';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ProblemsView } from './components/Problems/ProblemsView';
import { ProblemModal } from './components/Problems/ProblemModal';
import { TimerView } from './components/Timer/TimerView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { WeaknessView } from './components/Weakness/WeaknessView';
import { RecommendationsView } from './components/Recommendations/RecommendationsView';
import { RevisionPlannerView } from './components/RevisionPlanner/RevisionPlannerView';
import { DSASheetsView } from './components/DSASheets/DSASheetsView';
import { ContestsView } from './components/Contests/ContestsView';
import { ProfileView } from './components/Profile/ProfileView';
import { AuthModal } from './components/Auth/AuthModal';
import { Problem } from './types';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [problemToEdit, setProblemToEdit] = useState<Problem | null>(null);

  const handleOpenEdit = (problem: Problem) => {
    setProblemToEdit(problem);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setProblemToEdit(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              setCurrentTab={setCurrentTab}
              openAddModal={() => setIsAddModalOpen(true)}
            />
          )}

          {currentTab === 'problems' && (
            <ProblemsView
              openAddModal={() => setIsAddModalOpen(true)}
              openEditModal={handleOpenEdit}
            />
          )}

          {currentTab === 'timer' && <TimerView />}

          {currentTab === 'analytics' && <AnalyticsView />}

          {currentTab === 'weakness' && (
            <WeaknessView setCurrentTab={setCurrentTab} />
          )}

          {currentTab === 'recommendations' && (
            <RecommendationsView setCurrentTab={setCurrentTab} />
          )}

          {currentTab === 'revision' && <RevisionPlannerView />}

          {currentTab === 'sheets' && <DSASheetsView />}

          {currentTab === 'contests' && <ContestsView />}

          {currentTab === 'profile' && (
            <ProfileView openAuthModal={() => setIsAuthModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Global Add / Edit Problem Modal */}
      <ProblemModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        problemToEdit={problemToEdit}
      />

      {/* Global Auth / Profile Switch Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
