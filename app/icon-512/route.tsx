import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#D97706',
          borderRadius: 102,
        }}
      >
        <div style={{ fontSize: 300, lineHeight: 1 }}>🍴</div>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
