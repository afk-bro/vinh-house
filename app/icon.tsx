import { ImageResponse } from 'next/og';

// Generated square app icon — a branded "V" monogram on coastal teal.
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
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
          fontSize: 320,
          fontWeight: 700,
        }}
      >
        V
      </div>
    ),
    { ...size },
  );
}
