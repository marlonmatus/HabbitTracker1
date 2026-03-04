import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 md:ml-60 pb-24 md:pb-0 min-h-screen">
        <div className="max-w-[1000px] mx-auto p-4 md:p-12">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
