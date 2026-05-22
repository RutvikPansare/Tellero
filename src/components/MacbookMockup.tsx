"use client";

export default function MacbookMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full select-none" style={{ filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.18))" }}>

      {/* ── Screen lid ── */}
      <div
        style={{
          background: "linear-gradient(160deg, #D2D2D4 0%, #B8B8BA 100%)",
          borderRadius: "14px 14px 0 0",
          padding: "10px 10px 0",
        }}
      >
        {/* Dark bezel */}
        <div
          style={{
            background: "#1C1C1E",
            borderRadius: "6px 6px 0 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Notch */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 100,
              height: 24,
              background: "#1C1C1E",
              borderRadius: "0 0 12px 12px",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 8,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#2c2c2e",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
              }}
            />
          </div>

          {/* Screen content */}
          <div style={{ background: "white", overflow: "hidden", borderRadius: "0 0 1px 1px" }}>
            {children}
          </div>
        </div>
      </div>

      {/* ── Single aluminum base ── */}
      <div
        style={{
          background: "linear-gradient(180deg, #C8C8CA 0%, #AEAEAF 100%)",
          height: 22,
          borderRadius: "0 0 10px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Trackpad notch line */}
        <div
          style={{
            width: "28%",
            height: 3,
            background: "rgba(0,0,0,0.1)",
            borderRadius: 99,
          }}
        />
      </div>

    </div>
  );
}
