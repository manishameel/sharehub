'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import ToolCard from '@/components/ToolCard';

export default function MyToolsPage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTools = async () => {
    try {
      const response = await api.get('/tools/my-tools');
      setTools(response.data);
    } catch (error) {
      console.error('Failed to load tools', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleDelete = async (toolId) => {
    try {
      await api.delete(`/tools/${toolId}`);
      toast.success('Tool deleted');
      setTools((prev) => prev.filter((t) => t._id !== toolId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete tool');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-(--color-text-muted)">Loading...</div>;
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 flex-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Tools</h1>
        <Link
          href="/tools/new"
          className="bg-(--color-accent) text-white px-4 py-2 rounded-md hover:bg-(--color-accent-hover) transition-colors"
        >
          + List a Tool
        </Link>
      </div>
      {tools.length === 0 ? (
        <p className="text-(--color-text-muted)">You haven&apos;t listed any tools yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool._id} tool={tool} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  );
}