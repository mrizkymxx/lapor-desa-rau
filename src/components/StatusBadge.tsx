interface StatusBadgeProps {
  status: "masuk" | "diproses" | "selesai" | "ditolak";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const configs = {
    masuk: {
      label: "MENUNGGU",
      bg: "bg-[#ffe600]",
      text: "text-[#121212]",
    },
    diproses: {
      label: "DIPROSES",
      bg: "bg-[#70d6ff]",
      text: "text-[#121212]",
    },
    selesai: {
      label: "BERES ✓",
      bg: "bg-[#a7f3d0]",
      text: "text-[#121212]",
    },
    ditolak: {
      label: "DITOLAK",
      bg: "bg-[#ff99c8]",
      text: "text-[#121212]",
    },
  };

  const config = configs[status] || configs.masuk;

  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase border-2 border-[#121212] shadow-[2px_2px_0px_#121212] ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
