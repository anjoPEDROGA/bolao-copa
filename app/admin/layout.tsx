export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.08),transparent_30%),linear-gradient(180deg,#0b1120_0%,#070b14_100%)] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </div>
  );
}
