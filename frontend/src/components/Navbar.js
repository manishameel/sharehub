'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    loadUser();
    window.addEventListener('authChange', loadUser);

    return () => window.removeEventListener('authChange', loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-(--color-border) px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-lg font-semibold tracking-tight text-(--color-text)">
        ShareHub
      </Link>
      <div className="flex items-center gap-5 text-sm">
        {user ? (
          <>
            <Link href="/my-tools" className="text-(--color-text-muted) hover:text-(--color-text)">
              My Tools
            </Link>
            <Link href="/my-bookings" className="text-(--color-text-muted) hover:text-(--color-text)">
              My Bookings
            </Link>
            <Link href="/owner-bookings" className="text-(--color-text-muted) hover:text-(--color-text)">
              Owner Bookings
            </Link>
            <Link
              href="/tools/new"
              className="bg-(--color-accent) text-white px-4 py-2 rounded-md font-medium hover:bg-(--color-accent-hover) transition-colors"
            >
              List a Tool
            </Link>
            <span className="text-(--color-text-muted)">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="text-(--color-text-muted) hover:text-(--color-text) border border-(--color-border) px-3 py-1.5 rounded-md"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-(--color-text-muted) hover:text-(--color-text)">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-(--color-accent) text-white px-4 py-2 rounded-md font-medium hover:bg-(--color-accent-hover) transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}