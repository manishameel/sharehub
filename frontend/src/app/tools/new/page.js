'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function NewToolPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    pricePerDay: '',
    securityDeposit: '',
    availableFrom: '',
    availableTo: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const toolResponse = await api.post('/tools', formData);
      const toolId = toolResponse.data._id;

      if (images.length > 0) {
        const imageFormData = new FormData();
        images.forEach((file) => {
          imageFormData.append('images', file);
        });

        await api.post(`/tools/${toolId}/images`, imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Tool listed successfully');
      router.push('/my-tools');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to list tool');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto px-6 py-8 flex-1">
      <h1 className="text-2xl font-bold mb-6">List a Tool</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Tool title (e.g. Electric Drill)"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-4 py-2"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded px-4 py-2"
        />
        <input
          type="text"
          name="category"
          placeholder="Category (e.g. Power Tools)"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-4 py-2"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="pricePerDay"
            placeholder="Price per day (₹)"
            value={formData.pricePerDay}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-4 py-2"
          />
          <input
            type="number"
            name="securityDeposit"
            placeholder="Security deposit (₹)"
            value={formData.securityDeposit}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-4 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Available from</label>
            <input
              type="date"
              name="availableFrom"
              value={formData.availableFrom}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Available to</label>
            <input
              type="date"
              name="availableTo"
              value={formData.availableTo}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Tool images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Listing...' : 'List Tool'}
        </button>
      </form>
    </main>
  );
}