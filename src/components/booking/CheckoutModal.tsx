import React, { useState } from 'react';
import { X, ShieldCheck, Check, CreditCard, Wallet, Smartphone, Building2, Tag, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { CategoryType, Booking } from '../../types';
import { PriceBreakdown, calculatePrice } from '../../utils/pricing';
import { MOCK_OFFERS } from '../../data/mockData';
import { BookingService } from '../../services/bookingService';
import { paymentsApi } from '../../api/paymentsApi';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryType;
  itemTitle: string;
  itemImage: string;
  venueOrCinema: string;
  city: string;
  date: string;
  time: string;
  seatsOrDetails: string;
  quantity: number;
  initialPriceBreakdown: PriceBreakdown;
  onBookingSuccess: (booking: Booking) => void;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  category,
  itemTitle,
  itemImage,
  venueOrCinema,
  city,
  date,
  time,
  seatsOrDetails,
  quantity,
  initialPriceBreakdown,
  onBookingSuccess
}) => {
  const [addPopcornCombo, setAddPopcornCombo] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  const profile = BookingService.getUserProfile();
  const [customerName, setCustomerName] = useState(profile.name);
  const [customerEmail, setCustomerEmail] = useState(profile.email);
  const [customerPhone, setCustomerPhone] = useState(profile.phone);

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CREDIT_CARD' | 'NET_BANKING' | 'WALLET'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [bookingError, setBookingError] = useState('');

  if (!isOpen) return null;

  // Base sum computation
  const addonCost = addPopcornCombo ? 250 : 0;
  const basePricePerUnit = (initialPriceBreakdown.baseTotal + addonCost) / quantity;
  const currentDiscount = appliedCoupon ? appliedCoupon.discount : 0;

  const currentPrice = calculatePrice(
    basePricePerUnit,
    quantity,
    currentDiscount,
    appliedCoupon?.code
  );

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const res = await BookingService.validateCouponAsync(
        couponCode.trim(),
        category,
        currentPrice.baseTotal
      );
      setAppliedCoupon({ code: res.code, discount: res.discountAmount });
    } catch (err: any) {
      const offer = MOCK_OFFERS.find((o) => o.code.toUpperCase() === couponCode.trim().toUpperCase());
      if (offer) {
        let discountAmt = offer.flatDiscount || Math.min((currentPrice.baseTotal * (offer.discountPercentage || 0)) / 100, offer.maxDiscount || 500);
        setAppliedCoupon({ code: offer.code, discount: Math.round(discountAmt) });
      } else {
        setCouponError(err?.message || 'Invalid or non-applicable coupon code.');
      }
    }
  };

  const handlePay = async () => {
    setBookingError('');
    if (!customerName || !customerEmail || !customerPhone) {
      setBookingError('Please fill in your contact information.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create Order on Backend
      const orderData = await paymentsApi.createPaymentOrder({
        category,
        itemTitle,
        itemImage,
        venueOrCinema,
        city,
        date,
        time,
        seatsOrTicketsDetails: addPopcornCombo
          ? `${seatsOrDetails} + Popcorn & Drink Combo`
          : seatsOrDetails,
        quantity,
        unitPrice: currentPrice.baseTotal / quantity,
        couponCode: appliedCoupon?.code,
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod
      });

      // Step 2: Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay checkout SDK. Please check your network connection.');
      }

      // Step 3: Open Razorpay Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'Book Your Day',
        description: `${itemTitle} (${seatsOrDetails})`,
        image: itemImage || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&auto=format&fit=crop&q=80',
        order_id: orderData.orderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        theme: {
          color: '#e11d48'
        },
        handler: async function (response: any) {
          setIsVerifying(true);
          try {
            // Step 4: Verify HMAC Signature on Backend
            const confirmedBooking = await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: orderData.bookingId
            });

            setIsVerifying(false);
            setIsProcessing(false);
            onClose();
            onBookingSuccess(confirmedBooking);
          } catch (verifyErr: any) {
            setIsVerifying(false);
            setIsProcessing(false);
            setBookingError(verifyErr.message || 'Payment signature verification failed. Please contact support if debited.');
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setBookingError('Payment checkout was dismissed by user.');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        setBookingError(response.error?.description || 'Payment execution failed on gateway.');
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to initiate payment.';
      setBookingError(errMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600/20 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Universal Checkout</h3>
              <p className="text-xs text-slate-400">Secure 256-bit encrypted reservation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {bookingError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-bold text-rose-400 flex items-center justify-between">
              <span>{bookingError}</span>
              <button onClick={() => setBookingError('')} className="text-rose-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Item Summary Card */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
            <img src={itemImage} alt={itemTitle} className="w-16 h-20 object-cover rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">
                {category}
              </span>
              <h4 className="font-bold text-base text-white truncate">{itemTitle}</h4>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{venueOrCinema}</p>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 font-semibold">
                <span>{date}</span>
                <span>•</span>
                <span className="text-rose-400">{time}</span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-200 mt-1">{seatsOrDetails}</p>
            </div>
          </div>

          {/* Add-ons section for Movies */}
          {category === 'movies' && (
            <div
              onClick={() => setAddPopcornCombo(!addPopcornCombo)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                addPopcornCombo
                  ? 'bg-rose-600/15 border-rose-500/50'
                  : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍿</span>
                <div>
                  <h5 className="font-bold text-sm text-white">Large Popcorn & Soda Combo</h5>
                  <p className="text-xs text-slate-400">Salted Popcorn + 600ml Chilled Beverage (+₹250)</p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                  addPopcornCombo ? 'bg-rose-600 border-rose-500 text-white' : 'border-slate-700'
                }`}
              >
                {addPopcornCombo && <Check className="w-4 h-4" />}
              </div>
            </div>
          )}

          {/* Customer Details Form */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Contact Details for Digital Ticket
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">FULL NAME</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">PHONE NUMBER</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Promotional Coupons
            </span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Try FIRST50, HDFC200..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50 uppercase"
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-slate-800 hover:bg-rose-600 text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-rose-500 transition-all"
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Coupon {appliedCoupon.code} applied! Saved ₹{appliedCoupon.discount}
              </p>
            )}
            {couponError && <p className="text-xs text-rose-400 font-semibold">{couponError}</p>}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Payment Method
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'UPI', label: 'Instant UPI', icon: Smartphone },
                { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                { id: 'NET_BANKING', label: 'Net Banking', icon: Building2 },
                { id: 'WALLET', label: `BYD Wallet (₹${profile.walletBalance})`, icon: Wallet }
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-3 rounded-xl border text-left flex flex-col items-start gap-2 transition-all ${
                      isSelected
                        ? 'bg-rose-600/20 border-rose-500 text-white font-bold shadow-md shadow-rose-900/30'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                    <span className="text-[11px] leading-tight">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Price Breakdown */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Ticket Subtotal</span>
              <span className="text-white font-semibold">₹{currentPrice.baseTotal}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Convenience Fee</span>
              <span className="text-white font-semibold">₹{currentPrice.convenienceFee}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxes & Levies</span>
              <span className="text-white font-semibold">₹{currentPrice.taxes}</span>
            </div>
            {currentPrice.discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Coupon Discount</span>
                <span>-₹{currentPrice.discount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-white">
              <span>Total Payable</span>
              <span className="text-rose-400 text-base">₹{currentPrice.grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Footer Payment Action */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed Instant Pass</span>
          </div>

          <button
            onClick={handlePay}
            disabled={isProcessing || isVerifying}
            className="py-3.5 px-8 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-sm rounded-xl transition-all shadow-xl shadow-rose-900/40 flex items-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Verifying Signature...</span>
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                <span>Opening Gateway...</span>
              </>
            ) : (
              <span>Pay ₹{currentPrice.grandTotal} & Confirm</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
