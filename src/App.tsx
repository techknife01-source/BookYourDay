import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';

import { LocationModal } from './components/common/LocationModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { SearchModal } from './components/common/SearchModal';
import { LiveChatWidget } from './components/common/LiveChatWidget';
import { AIAssistantModal } from './components/common/AIAssistantModal';

import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { SportsPage } from './pages/SportsPage';
import { SportsDetailsPage } from './pages/SportsDetailsPage';
import { AttractionsPage } from './pages/AttractionsPage';
import { ExperiencesPage } from './pages/ExperiencesPage';
import { DiningPage } from './pages/DiningPage';
import { OffersPage } from './pages/OffersPage';
import { WishlistPage } from './pages/WishlistPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PartnerDashboard } from './pages/PartnerDashboard';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { TravelPage } from './pages/TravelPage';
import { NearbyPage } from './pages/NearbyPage';
import { PlannerPage } from './pages/PlannerPage';

export default function App() {
  const [currentCity, setCurrentCity] = useState('Asansol');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white relative">
        {/* Navigation Bar */}
        <Navbar
          currentCity={currentCity}
          onOpenLocationModal={() => setLocationModalOpen(true)}
          onOpenSearchModal={() => setSearchModalOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 pb-16 xl:pb-0">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  currentCity={currentCity}
                  onOpenSearchModal={() => setSearchModalOpen(true)}
                  onOpenLocationModal={() => setLocationModalOpen(true)}
                />
              }
            />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
            <Route path="/movies/:id" element={<MovieDetailsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/event/:id" element={<EventDetailsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/sports" element={<SportsPage />} />
            <Route path="/sport/:id" element={<SportsDetailsPage />} />
            <Route path="/sports/:id" element={<SportsDetailsPage />} />
            <Route path="/attractions" element={<AttractionsPage />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/dining" element={<DiningPage />} />
            <Route path="/travel" element={<TravelPage />} />
            <Route
              path="/nearby"
              element={
                <NearbyPage
                  currentCity={currentCity}
                  onOpenLocationModal={() => setLocationModalOpen(true)}
                />
              }
            />
            <Route path="/planner" element={<PlannerPage currentCity={currentCity} />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/tickets" element={<MyTicketsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/partner" element={<PartnerDashboard />} />
          </Routes>
        </main>

        {/* Universal Footer */}
        <Footer />

        {/* Mobile Sticky Navigation */}
        <MobileNav />

        {/* Floating Live Chat Widget */}
        <LiveChatWidget />

        {/* Global Modals & Drawers */}
        <LocationModal
          isOpen={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          currentCity={currentCity}
          onSelectCity={(city) => setCurrentCity(city)}
        />

        <NotificationDrawer
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        <SearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
        />

        <AIAssistantModal
          isOpen={aiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
          currentCity={currentCity}
        />
      </div>
    </Router>
  );
}
