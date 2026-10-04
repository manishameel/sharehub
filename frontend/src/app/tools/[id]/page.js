'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ToolDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const response = await api.get(`/tools/${id}`);
        setTool(response.data);
      } catch (error) {
        toast.error('Failed to load tool');
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const days = calculateDays();
  const rentalAmount = tool ? days * tool.pricePerDay : 0;

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setBooking(true);
    try {
      const response = await api.post('/bookings', {
        toolId: id,
        startDate,
        endDate
      });
      toast.success('Booking created, proceed to payment');
      router.push(`/bookings/${response.data._id}/pay`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!tool) {
    return <div className="p-8 text-center text-gray-500">Tool not found</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-72 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {tool.images && tool.images.length > 0 ? (
            <img src={tool.images[0]} alt={tool.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400">No image</span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{tool.title}</h1>
          <p className="text-gray-500 mb-4">{tool.category}</p>
          <p className="text-gray-700 mb-4">{tool.description}</p>
          <p className="text-sm text-gray-500 mb-1">Owner: {tool.owner?.name}</p>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xl font-bold text-blue-600">₹{tool.pricePerDay}/day</span>
            <span className="text-sm text-gray-500">Security deposit: ₹{tool.securityDeposit}</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Available: {new Date(tool.availableFrom).toLocaleDateString()} to{' '}
            {new Date(tool.availableTo).toLocaleDateString()}
          </p>

          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>

            {days > 0 && (
              <div className="text-sm text-gray-700 space-y-1">
                <p>{days} day(s) × ₹{tool.pricePerDay} = ₹{rentalAmount}</p>
                <p>+ Security deposit: ₹{tool.securityDeposit}</p>
                <p className="font-bold">Total: ₹{rentalAmount + tool.securityDeposit}</p>
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={booking}
              className="w-full bg-blue-600 text-white rounded px-4 py-2 font-medium disabled:opacity-50"
            >
              {booking ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}