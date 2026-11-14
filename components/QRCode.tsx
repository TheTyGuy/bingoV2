import { useEffect, useState } from 'react';
import QR from 'qrcode';

export function QRCode({ value, className = '' }: { value: string; className?: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    QR.toString(value, { type: 'svg', margin: 1, color: { dark: '#141414', light: '#ffffff' } })
      .then(setSvg)
      .catch(() => setSvg(''));
  }, [value]);
  return (
    <div
      role="img"
      aria-label="QR code to join this game"
      className={`overflow-hidden rounded-lg border-[3px] border-ink bg-white [&_svg]:block [&_svg]:h-full [&_svg]:w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
