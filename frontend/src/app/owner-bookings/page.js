'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import QRScanner from '@/components/QRScanner';
import DamageReportForm from '@/components/DamageReportForm';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700'
};

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanMode, setScanMode] = useState(null);
  const [pendingQrToken, setPendingQrToken] = useState(null);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/owner-bookings');
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

  const handleScan = async (qrToken) => {
    if (scanMode === 'pickup') {
      try {
        await api.post('/bookings/verify-qr', { qrToken });
        toast.success('Pickup confirmed');
        fetchBookings();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Verification failed');
      }
      setScanMode(null);
    } else if (scanMode === 'return') {
      setPendingQrToken(qrToken);
      setScanMode(null);
    }
  };

  const handleDamageSubmit = async (damageData) => {
    try {
      await api.post('/bookings/verify-qr', {
        qrToken: pendingQrToken,
        ...damageData
      });
      toast.success('Return confirmed');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    }
    setPendingQrToken(null);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 flex-1">
      <h1 className="text-2xl font-bold mb-6">Bookings on My Tools</h1>

      {scanMode && (
        <QRScanner onScan={handleScan} onClose={() => setScanMode(null)} />
      )}

      {pendingQrToken && (
        <DamageReportForm
          onSubmit={handleDamageSubmit}
          onCancel={() => setPendingQrToken(null)}
        />
      )}

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings on your tools yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{b.tool?.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(b.startDate).toLocaleDateString()} to{' '}
                    {new Date(b.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Borrower: {b.borrower?.name}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${statusColors[b.status]}`}>
                  {b.status}
                </span>
              </div>
              <div className="mt-3">
                {b.status === 'confirmed' && (
                  <button
                    onClick={() => setScanMode('pickup')}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Scan Pickup QR
                  </button>
                )}
                {b.status === 'active' && (
                  <button
                    onClick={() => setScanMode('return')}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Scan Return QR
                  </button>
                )}
                {b.status === 'completed' && (
                  <p className="text-sm text-gray-600">
                    Refund: ₹{b.refundAmount}
                    {b.hasDamage && ` (Damage deducted: ₹${b.damageAmount})`}
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