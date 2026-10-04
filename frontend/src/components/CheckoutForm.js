'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function CheckoutForm({ bookingId }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      setLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await api.post('/bookings/confirm-payment', {
          paymentIntentId: paymentIntent.id
        });
        toast.success('Payment successful, booking confirmed');
        router.push('/my-bookings');
      } catch (err) {
        toast.error('Payment succeeded but booking confirmation failed, contact support');
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white rounded px-4 py-2 font-medium disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}