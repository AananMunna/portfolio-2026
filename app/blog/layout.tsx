import CustomCursor from "@/components/CustomCursor";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-bg">
      <CustomCursor />
      {children}
    </div>
  );
}
