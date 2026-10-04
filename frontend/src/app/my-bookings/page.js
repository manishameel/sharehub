'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700'
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrImage, setQrImage] = useState(null);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleGenerateQR = async (bookingId, type) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/generate-qr?type=${type}`);
      setQrImage(response.data.qrImage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 flex-1">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {qrImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <img src={qrImage} alt="QR Code" className="w-64 h-64 mx-auto" />
            <p className="text-sm text-gray-500 mt-2">Show this QR to the owner to scan</p>
            <button
              onClick={() => setQrImage(null)}
              className="mt-4 bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{booking.tool?.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.startDate).toLocaleDateString()} to{' '}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Owner: {booking.owner?.name}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${statusColors[booking.status]}`}>
                  {booking.status}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                {booking.status === 'pending' && (
                  <Link
                    href={`/bookings/${booking._id}/pay`}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Complete Payment
                  </Link>
                )}
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => handleGenerateQR(booking._id, 'pickup')}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Generate Pickup QR
                  </button>
                )}
                {booking.status === 'active' && (
                  <button
                    onClick={() => handleGenerateQR(booking._id, 'return')}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Generate Return QR
                  </button>
                )}
                {booking.status === 'completed' && (
                  <p className="text-sm text-gray-600">
                    Refund: ₹{booking.refundAmount}
                    {booking.hasDamage && ` (Damage deducted: ₹${booking.damageAmount})`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}