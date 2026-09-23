import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-surface-light text-[#1D1D1F] dark:bg-surface-dark dark:text-[#F5F5F7]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[99999] lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 animate-fade-in">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}


      <img src="/hero.jpg" alt="wallpaper-sidebar" className="absolute top-0 left-[0px] w-screen h-screen rotate-[0deg] scale-[2] dark:flex hidden object-cover brightness-[20%]" />
      <img src="/hero.jpg" alt="wallpaper-sidebar" className="absolute top-0 left-[0px] w-screen h-screen rotate-[150deg] scale-[4] dark:hidden flex object-cover brightness-[40%]" />
      <div className="relative z-[9] flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 overflow-y-auto border- pr z-[99] px-4 py-4 md:py-0 md:pl-4 lg:pl-0 md:pr-[1px] rounded-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
