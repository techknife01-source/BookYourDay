import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';

import { LocationModal } from './components/common/LocationModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { SearchModal } from './components/common/SearchModal';

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

export default function App() {
  const [currentCity, setCurrentCity] = useState('Asansol');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
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
            <Route path="/events" element={<EventsPage />} />
            <Route path="/event/:id" element={<EventDetailsPage />} />
            <Route path="/sports" element={<SportsPage />} />
            <Route path="/sport/:id" element={<SportsDetailsPage />} />
            <Route path="/attractions" element={<AttractionsPage />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/dining" element={<DiningPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/tickets" element={<MyTicketsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/partner" element={<PartnerDashboard />} />
          </Routes>
        </main>

        {/* Universal Footer */}
        <Footer />

        {/* Mobile Sticky Navigation */}
        <MobileNav />

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
      </div>
    </Router>
  );
}
