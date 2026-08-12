import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { travelApi, TravelPackageItem, TravelTransferItem } from '../api/travelApi';
import { Plane, Car, Calendar, Users, MapPin, Star, ShieldCheck, ChevronRight, Search, Clock, CheckCircle, Tag } from 'lucide-react';
import { CheckoutModal } from '../components/booking/CheckoutModal';
import { DigitalTicketModal } from '../components/booking/DigitalTicketModal';
import { Booking } from '../types';

export const TravelPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'TRANSFERS'>('PACKAGES');
  const [packages, setPackages] = useState<TravelPackageItem[]>([]);
  const [transfers, setTransfers] = useState<TravelTransferItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  // Package booking state
  const [selectedPackage, setSelectedPackage] = useState<TravelPackageItem | null>(null);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);

  // Transfer booking state
  const [selectedTransfer, setSelectedTransfer] = useState<TravelTransferItem | null>(null);
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('09:00');
  const [pickupLoc, setPickupLoc] = useState('');
  const [dropLoc, setDropLoc] = useState('');
  const [passengerCount, setPassengerCount] = useState(2);

  // Checkout / Razorpay Modal
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<any>(null);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [digitalTicketOpen, setDigitalTicketOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadTravelData() {
      setLoading(true);
      try {
        if (activeTab === 'PACKAGES') {
          const res = await travelApi.getPackages({
            q: searchQuery,
            destination: selectedDestination
          });
          if (isMounted) setPackages(res);
        } else {
          const res = await travelApi.getTransfers({
            q: searchQuery,
            destination: selectedDestination
          });
          if (isMounted) setTransfers(res);
        }
      } catch (err) {
        console.error('Travel data load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTravelData();
    return () => { isMounted = false; };
  }, [activeTab, searchQuery, selectedDestination]);

  const handlePackageBookingInit = (pkg: TravelPackageItem) => {
    setSelectedPackage(pkg);
  };

  const handleTransferBookingInit = (tr: TravelTransferItem) => {
    setSelectedTransfer(tr);
    setPickupLoc(tr.origin);
    setDropLoc(tr.destination);
  };

  const handleProceedPackageCheckout = async () => {
    if (!selectedPackage) return;
    try {
      const res = await travelApi.reservePackage({
        packageId: selectedPackage.id,
        departureDate,
        adults: adultsCount,
        children: childrenCount
      });

      if (res.success && res.data) {
        setCheckoutPayload({
          bookingId: res.data.booking.id,
          bookingNumber: res.data.booking.bookingNumber,
          category: 'TRAVEL',
          itemTitle: selectedPackage.title,
          venueOrCinema: `${selectedPackage.origin} to ${selectedPackage.destination}`,
          date: departureDate,
          time: '08:00 AM',
          seatsDetails: `${adultsCount} Adult(s), ${childrenCount} Child(ren)`,
          totalAmount: res.data.booking.totalAmount,
          subtotal: res.data.booking.subtotal,
          convenienceFee: res.data.booking.convenienceFee,
          taxes: res.data.booking.taxes,
          discount: res.data.booking.discount,
          razorpayOrderId: res.data.razorpay?.orderId
        });
        setCheckoutOpen(true);
      } else {
        alert(res.message || 'Failed to initiate package booking');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Package reservation failed.');
    }
  };

  const handleProceedTransferCheckout = async () => {
    if (!selectedTransfer) return;
    if (!pickupLoc.trim() || !dropLoc.trim()) {
      alert('Please specify pickup and drop locations.');
      return;
    }

    try {
      const res = await travelApi.reserveTransfer({
        transferId: selectedTransfer.id,
        pickupDate,
        pickupTime,
        passengerCount,
        pickupLocation: pickupLoc,
        dropLocation: dropLoc
      });

      if (res.success && res.data) {
        setCheckoutPayload({
          bookingId: res.data.booking.id,
          bookingNumber: res.data.booking.bookingNumber,
          category: 'TRANSFER',
          itemTitle: selectedTransfer.title,
          venueOrCinema: `${pickupLoc} → ${dropLoc}`,
          date: pickupDate,
          time: pickupTime,
          seatsDetails: `${passengerCount} Passenger(s) (${selectedTransfer.vehicleType})`,
          totalAmount: res.data.booking.totalAmount,
          subtotal: res.data.booking.subtotal,
          convenienceFee: res.data.booking.convenienceFee,
          taxes: res.data.booking.taxes,
          discount: res.data.booking.discount,
          razorpayOrderId: res.data.razorpay?.orderId
        });
        setCheckoutOpen(true);
      } else {
        alert(res.message || 'Failed to initiate transfer booking');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Transfer reservation failed.');
    }
  };

  const handlePaymentSuccess = (booking: Booking) => {
    setCheckoutOpen(false);
    setSelectedPackage(null);
    setSelectedTransfer(null);
    setCompletedBooking(booking);
    setDigitalTicketOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium tracking-wide uppercase">
            <Plane className="w-3.5 h-3.5" /> BookYourDay Travel Vertical
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Travel Packages & Airport Transfers
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base">
            Curated holiday itineraries, mountain escapes, mangrove safaris & seamless private vehicle transfers with instant verified bookings.
          </p>

          {/* Search & Category Filter Bar */}
          <div className="pt-6 max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search destination, package name, or vehicle type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('PACKAGES')}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'PACKAGES'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Plane className="w-4 h-4" /> Travel Packages
              </button>
              <button
                onClick={() => setActiveTab('TRANSFERS')}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'TRANSFERS'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Car className="w-4 h-4" /> Transfers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Loading verified travel options...</p>
          </div>
        ) : activeTab === 'PACKAGES' ? (
          /* PACKAGES LISTING */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plane className="w-5 h-5 text-rose-500" /> Published Holiday Packages ({packages.length})
              </h2>
            </div>

            {packages.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <p>No published travel packages matched your query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group shadow-xl"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={pkg.image || pkg.images?.[0]}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {pkg.durationDays} Days / {pkg.durationNights} Nights
                      </div>
                      <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 border border-amber-400/20 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> {pkg.rating}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-slate-400 gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" /> {pkg.origin} &rarr; {pkg.destination}
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                          {pkg.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {pkg.description}
                        </p>
                      </div>

                      {/* Inclusions Highlights */}
                      {pkg.inclusions?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {pkg.inclusions.slice(0, 3).map((inc, idx) => (
                            <span key={idx} className="bg-slate-950 text-slate-300 border border-slate-800 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle className="w-2.5 h-2.5 text-emerald-400" /> {inc}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Starting From</span>
                          <span className="text-lg font-extrabold text-white">
                            &#8377;{pkg.startingPrice.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ adult</span>
                          </span>
                        </div>
                        <button
                          onClick={() => handlePackageBookingInit(pkg)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-rose-600/20"
                        >
                          Book Package <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TRANSFERS LISTING */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-rose-500" /> Airport & Station Transfers ({transfers.length})
              </h2>
            </div>

            {transfers.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                <p>No transfer services matched your query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transfers.map((tr) => (
                  <div
                    key={tr.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col sm:flex-row gap-6 shadow-xl"
                  >
                    <div className="w-full sm:w-48 h-36 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={tr.image || tr.images?.[0]} alt={tr.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-rose-400 font-semibold mb-1">
                          <span className="bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full uppercase text-[10px]">
                            {tr.vehicleType}
                          </span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> Max {tr.capacity} Passengers
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white leading-snug">{tr.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {tr.origin} &rarr; {tr.destination}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Flat Vehicle Rate</span>
                          <span className="text-lg font-extrabold text-white">
                            &#8377;{tr.pricePerVehicle.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <button
                          onClick={() => handleTransferBookingInit(tr)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-rose-600/20"
                        >
                          Book Transfer <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Package Booking Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Book Travel Package</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedPackage.title}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {selectedPackage.origin} to {selectedPackage.destination} ({selectedPackage.durationDays}D / {selectedPackage.durationNights}N)
                </p>
              </div>
              <button onClick={() => setSelectedPackage(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            {/* Structured Itinerary Days Preview */}
            {selectedPackage.itinerary?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Structured Daily Itinerary</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedPackage.itinerary.map((day) => (
                    <div key={day.day} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center text-rose-400 font-semibold">
                        <span>Day {day.day}: {day.title || day.destination}</span>
                        {day.hotel && <span className="text-slate-400 font-normal">{day.hotel}</span>}
                      </div>
                      {day.activities?.length > 0 && (
                        <p className="text-slate-300 text-[11px] leading-tight">
                          • {day.activities.join(' • ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs: Departure Date, Adults, Children */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Departure Date</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Adults (&#8377;{selectedPackage.pricePerAdult})</label>
                <input
                  type="number"
                  min="1"
                  max={selectedPackage.maxGuests}
                  value={adultsCount}
                  onChange={(e) => setAdultsCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Children (&#8377;{selectedPackage.pricePerChild})</label>
                <input
                  type="number"
                  min="0"
                  max={selectedPackage.maxGuests}
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
              <div>
                <span className="text-slate-400 text-xs block">Total Base Price</span>
                <span className="text-lg font-bold text-white">
                  &#8377;{((selectedPackage.pricePerAdult * adultsCount) + (selectedPackage.pricePerChild * childrenCount)).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={handleProceedPackageCheckout}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/30"
              >
                Proceed to Checkout &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Booking Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Book Transfer</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedTransfer.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedTransfer.vehicleType} &bull; Max {selectedTransfer.capacity} passengers</p>
              </div>
              <button onClick={() => setSelectedTransfer(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={pickupLoc}
                  onChange={(e) => setPickupLoc(e.target.value)}
                  placeholder="e.g. Asansol Railway Station"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Drop Location</label>
                <input
                  type="text"
                  value={dropLoc}
                  onChange={(e) => setDropLoc(e.target.value)}
                  placeholder="e.g. Hotel Grand Asansol"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Pickup Time</label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Passenger Count</label>
                <input
                  type="number"
                  min="1"
                  max={selectedTransfer.capacity * 2}
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
              <div>
                <span className="text-slate-400 text-xs block">Vehicle Fare</span>
                <span className="text-lg font-bold text-white">&#8377;{selectedTransfer.pricePerVehicle.toLocaleString('en-IN')}</span>
              </div>
              <button
                onClick={handleProceedTransferCheckout}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/30"
              >
                Proceed to Checkout &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && checkoutPayload && (
        <CheckoutModal
          bookingData={checkoutPayload}
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Digital Ticket Modal */}
      {digitalTicketOpen && completedBooking && (
        <DigitalTicketModal
          booking={completedBooking}
          isOpen={digitalTicketOpen}
          onClose={() => setDigitalTicketOpen(false)}
        />
      )}
    </div>
  );
};
