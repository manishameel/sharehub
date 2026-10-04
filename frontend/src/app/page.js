'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ToolCard from '@/components/ToolCard';

export default function HomePage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await api.get('/tools');
        setTools(response.data);
      } catch (error) {
        console.error('Failed to load tools', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading tools...</div>;
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 flex-1">
      <h1 className="text-2xl font-bold mb-6">Available Tools Nearby</h1>
      {tools.length === 0 ? (
        <p className="text-gray-500">No tools listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool._id} tool={tool} />
          ))}
        </div>
      )}
    </main>
  );
}