import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "linear-gradient(135deg, #fff1e8 0%, #ffffff 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 20,
            background: "#ff5a1f",
            color: "#ffffff",
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          AC
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#18181b" }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 28, color: "#52525b" }}>
          Quality imports, delivered to your door
        </div>
      </div>
    ),
    { ...size }
  );
}
