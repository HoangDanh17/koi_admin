import MainLayout from "@/app/layout/MainLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <MainLayout>{children}</MainLayout>
    </div>
  );
}
