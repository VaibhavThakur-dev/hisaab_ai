import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FF9500',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          fontSize: 20,
          fontWeight: 800,
          color: '#1C1C1E',
          letterSpacing: '-0.5px',
        }}
      >
        ₹
      </div>
    ),
    { ...size }
  )
}
