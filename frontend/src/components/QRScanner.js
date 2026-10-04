'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const containerId = 'qr-scanner-container';

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          scanner.stop().then(() => {
            onScan(decodedText);
          });
        },
        () => {}
      )
      .catch(() => {
        onClose();
      });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg">
        <div id={containerId} className="w-72 h-72" />
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}