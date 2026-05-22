"use client";

/* Reusable MacBook Pro frame — drop any content inside as children */
export default function MacbookMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full select-none">
      {/* Screen lid */}
      <div className="macbook-outer">
        <div className="macbook-screen-bezel">
          {/* Notch */}
          <div className="macbook-notch">
            <div className="macbook-camera" />
          </div>

          {/* Screen content */}
          <div className="macbook-display">{children}</div>
        </div>

        {/* Chin bar below screen */}
        <div className="macbook-chin">
          <div
            className="w-16 h-[3px] rounded-full"
            style={{ background: "rgba(0,0,0,0.12)" }}
          />
        </div>
      </div>

      {/* Keyboard base */}
      <div className="macbook-base-body">
        <div className="macbook-trackpad-bar" />
      </div>

      {/* Decorative stand — matches nory's purple crate feel */}
      <div
        className="mx-auto mt-0 rounded-b-2xl overflow-hidden"
        style={{
          width: "78%",
          height: "32px",
          background: "linear-gradient(180deg, #A89FC0 0%, #9B8EC4 100%)",
          boxShadow: "0 16px 40px rgba(155,142,196,0.35)",
        }}
      />
      <div
        className="mx-auto rounded-b-2xl"
        style={{
          width: "60%",
          height: "16px",
          background: "#8B7EB4",
          boxShadow: "0 16px 40px rgba(139,126,180,0.3)",
        }}
      />
    </div>
  );
}
