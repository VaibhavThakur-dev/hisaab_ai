import { ImageResponse } from 'next/og'
import React from 'react'
import { type NextRequest } from 'next/server'

export function GET(req: NextRequest) {
  const size = Number(new URL(req.url).searchParams.get('size') ?? '192')
  const radius = Math.round(size * 0.22)

  return new ImageResponse(
    React.createElement(
      'div',
      {
        style: {
          background: '#FF9500',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: `${radius}px`,
          fontSize: Math.round(size * 0.58),
          fontWeight: 800,
          color: '#1C1C1E',
        },
      },
      '₹'
    ),
    { width: size, height: size }
  )
}
