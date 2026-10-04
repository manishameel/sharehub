'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import stripePromise from '@/lib/stripe';
import CheckoutForm from '@/components/CheckoutForm';

export default function PayPage() {
  const { id } = useParams();
  const [clientSecret, setClientSecret] = useState(null);
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createIntent = async () => {
      try {
        const response = await api.post(`/bookings/${id}/create-payment-intent`);
        setClientSecret(response.data.clientSecret);
        setAmount(response.data.amount);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to start payment');
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading payment...</div>;
  }

  if (!clientSecret) {
    return <div className="p-8 text-center text-gray-500">Unable to load payment</div>;
  }

  return (
    <main className="max-w-md mx-auto px-6 py-8 flex-1">
      <h1 className="text-2xl font-bold mb-2">Complete Payment</h1>
      <p className="text-gray-500 mb-6">Amount to pay: ₹{amount}</p>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm bookingId={id} />
      </Elements>
    </main>
  );
}