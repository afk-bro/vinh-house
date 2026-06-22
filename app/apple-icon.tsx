import { ImageResponse } from 'next/og';

// Generated apple-touch-icon (iOS home screen) — branded "V" monogram.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F766E',
          color: '#FFF8ED',
          fontSize: 112,
          fontWeight: 700,
        }}
      >
        V
      </div>
    ),
    { ...size },
  );
}
