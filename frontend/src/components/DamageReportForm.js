'use client';

import { useState } from 'react';

export default function DamageReportForm({ onSubmit, onCancel }) {
  const [hasDamage, setHasDamage] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [damageAmount, setDamageAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      hasDamage,
      damageDescription: hasDamage ? damageDescription : '',
      damageAmount: hasDamage ? Number(damageAmount) || 0 : 0
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-sm space-y-4">
        <h3 className="font-semibold text-lg">Return Inspection</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasDamage}
            onChange={(e) => setHasDamage(e.target.checked)}
          />
          Tool has damage
        </label>
        {hasDamage && (
          <>
            <textarea
              placeholder="Describe the damage"
              value={damageDescription}
              onChange={(e) => setDamageDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2"
              rows={2}
            />
            <input
              type="number"
              placeholder="Damage amount to deduct (₹)"
              value={damageAmount}
              onChange={(e) => setDamageAmount(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Confirm Return
          </button>
        </div>
      </form>
    </div>
  );
}