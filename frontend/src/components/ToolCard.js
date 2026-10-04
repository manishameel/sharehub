'use client';

import Link from 'next/link';

export default function ToolCard({ tool, onDelete }) {
  const imageUrl = tool.images && tool.images.length > 0 ? tool.images[0] : null;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${tool.title}"? This cannot be undone.`)) {
      onDelete(tool._id);
    }
  };

  return (
    <div className="relative group">
      <Link
        href={`/tools/${tool._id}`}
        className="block border border-(--color-border) rounded-lg overflow-hidden bg-(--color-surface) hover:shadow-sm transition-shadow"
      >
        <div className="h-40 bg-(--color-accent-soft) flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={tool.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-(--color-text-muted) text-sm">No image</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-(--color-text)">{tool.title}</h3>
          <p className="text-sm text-(--color-text-muted) mb-2">{tool.category}</p>
          <div className="flex items-baseline justify-between">
            <span className="font-semibold text-(--color-accent)">₹{tool.pricePerDay}/day</span>
            <span className="text-xs text-(--color-text-muted)">Deposit ₹{tool.securityDeposit}</span>
          </div>
        </div>
      </Link>
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-white/90 text-red-600 text-xs px-2 py-1 rounded-md border border-(--color-border) opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        >
          Delete
        </button>
      )}
    </div>
  );
}