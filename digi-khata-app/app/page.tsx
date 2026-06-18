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
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">
                Digi Khata
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/customers">
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Digital Ledger for Shopkeepers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Say Goodbye to
                <span className="text-blue-600 block">Paper Khata</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Manage your customers, track udhaar (credit), and handle
                transactions effortlessly with Digi Khata.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/customers">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium">
                  Start Managing Customers
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border border-gray-200 font-medium">
                  View Dashboard
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">0+</p>
                <p className="text-sm text-gray-500">Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Transactions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Rs. 0</p>
                <p className="text-sm text-gray-500">Udhaar</p>
              </div>
            </div>
          </div>

          {/* Right - Features Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Customers</h3>
              <p className="text-sm text-gray-500">
                Manage all your customer profiles
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Udhaar</h3>
              <p className="text-sm text-gray-500">Track credit and payments</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Transactions</h3>
              <p className="text-sm text-gray-500">
                Record sales, expenses & more
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <LayoutDashboard className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Dashboard</h3>
              <p className="text-sm text-gray-500">
                Get instant business insights
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Digi Khata.
          </p>
        </div>
      </footer>
    </div>
  );
}
