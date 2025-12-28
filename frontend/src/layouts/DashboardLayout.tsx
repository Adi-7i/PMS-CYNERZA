import { useState } from "react"
import { LayoutDashboard, Calendar, BedDouble, Users, Layers, Menu, LogOut, Hotel } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"
import { useAuth } from "../context/AuthContext"

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const location = useLocation()
    const { user, logout } = useAuth()

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Bookings", href: "/bookings", icon: Calendar },
        { name: "Rooms", href: "/rooms", icon: BedDouble },
        { name: "Inventory", href: "/inventory", icon: Layers },
        { name: "Customers", href: "/customers", icon: Users },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-slate-900 text-white fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out shadow-xl flex flex-col",
                    isSidebarOpen ? "w-64" : "w-20 -translate-x-full lg:translate-x-0"
                )}
            >
                <div className="h-16 flex items-center justify-center border-b border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-2 text-white">
                        <Hotel className="h-6 w-6 text-blue-400" />
                        {isSidebarOpen && <span className="text-lg font-bold tracking-wide">Hotel PMS</span>}
                    </div>
                </div>

                <nav className="p-4 space-y-2 mt-2 flex-grow overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white",
                                    !isSidebarOpen && "justify-center"
                                )}
                                title={!isSidebarOpen ? item.name : undefined}
                            >
                                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "group-hover:text-blue-400")} />
                                {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 flex-shrink-0">
                    <button
                        onClick={logout}
                        className={cn("flex items-center gap-3 px-3 py-3 w-full text-red-400 hover:bg-slate-800 rounded-lg transition-colors", !isSidebarOpen && "justify-center")}
                    >
                        <LogOut className="h-5 w-5" />
                        {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center px-6 justify-between sticky top-0 z-40">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 focus:outline-none transition-colors">
                        <Menu className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 hidden md:block">{user?.email}</span>
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md uppercase ring-2 ring-white">
                            {user?.email?.[0] || 'U'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
