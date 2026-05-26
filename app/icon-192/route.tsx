import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#D97706',
          borderRadius: 38,
        }}
      >
        <div style={{ fontSize: 112, lineHeight: 1 }}>🍴</div>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
