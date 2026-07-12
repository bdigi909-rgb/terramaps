"use client";

interface PrintButtonProps {
  title?: string;
}

export default function PrintButton({ title }: PrintButtonProps) {
  function handlePrint() {
    if (title) document.title = title;
    window.print();
  }

  return (
    <>
      <button onClick={handlePrint}
        style={{ background: "#1E2D3D", border: "1px solid #2A4060", color: "#8BACC8", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
        🖨️ Imprimer
      </button>
      <style>{`
        @media print {
          .app-sidebar-desktop,
          .app-sidebar-mobile,
          .app-burger,
          header,
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .srm-card {
            border: 1px solid #ccc !important;
            break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
