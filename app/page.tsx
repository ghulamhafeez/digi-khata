// app/page.tsx
"use client";

import Link from "next/link";
import {
  Users,
  Wallet,
  ShoppingBag,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-bold text-gray-800">
              Digi Khata
            </span>
            <Link href="/customers">
              <button className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md min-h-[44px]">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Digital Ledger for Shopkeepers
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Say Goodbye to
                <span className="text-blue-600 block">Paper Khata</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-lg">
                Manage your customers, track udhaar (credit), and handle
                transactions effortlessly with Digi Khata.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/customers" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium min-h-[44px]">
                  Start Managing Customers
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/transactions" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-3.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border border-gray-200 font-medium min-h-[44px]">
                  View Transactions
                </button>
              </Link>
            </div>
          </div>

          {/* Right - Features Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/customers">
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all hover:-translate-y-1 cursor-pointer active:scale-95">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Customers</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Manage all your customer profiles
                </p>
              </div>
            </Link>

            <Link href="/transactions">
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all hover:-translate-y-1 cursor-pointer active:scale-95">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Udhaar</h3>
                <p className="text-xs sm:text-sm text-gray-500">Track credit and payments</p>
              </div>
            </Link>

            <Link href="/transactions">
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all hover:-translate-y-1 cursor-pointer active:scale-95">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Transactions</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Record sales, expenses & more
                </p>
              </div>
            </Link>

            <Link href="/dashboard">
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all hover:-translate-y-1 cursor-pointer active:scale-95">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Dashboard</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Get instant business insights
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer — hidden on mobile since bottom nav is visible */}
      <footer className="hidden md:block border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Digi Khata.
          </p>
        </div>
      </footer>
    </div>
  );
}
