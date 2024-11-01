import Navbar from "@/app/layout/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col lg:ml-64 bg-gray-200">
        <header className="bg-white shadow-sm p-4 fixed w-full  z-40 top-0">
          <h1 className="text-xl font-semibold ml-4">Chào mừng trở lại</h1>
        </header>
        <main
          className="flex-1 p-8 mt-10 max-w-[1400px]"
          style={{ minHeight: "calc(100vh - 170px)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
