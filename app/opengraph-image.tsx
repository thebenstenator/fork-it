import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "fork it. — dinner sorted";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FAFAF8",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        {/* Fork emoji */}
        <div style={{ fontSize: 80, marginBottom: 24 }}>🍴</div>

        {/* App name */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#1C1917",
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          fork it.
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: "#78716C",
            marginBottom: 48,
          }}
        >
          Fork what's in your fridge. Dinner sorted.
        </div>

        {/* Amber accent bar */}
        <div
          style={{
            width: 120,
            height: 6,
            background: "#D97706",
            borderRadius: 3,
          }}
        />

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            fontSize: 28,
            color: "#D97706",
            fontWeight: 500,
          }}
        >
          forkit.food
        </div>
      </div>
    ),
    { ...size }
  );
}
