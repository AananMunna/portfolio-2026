
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-bg">
      {children}
    </div>
  );
}
