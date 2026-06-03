import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          borderRadius: '38px',
          fontSize: 110,
          fontWeight: 800,
          color: '#1C1C1E',
        }}
      >
        ₹
      </div>
    ),
    { ...size }
  )
}
