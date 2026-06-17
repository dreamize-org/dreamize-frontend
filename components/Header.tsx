"use client";

import { Menu, X } from "lucide-react";
import { useRouter } from '@/hooks/useRouter';
import { useState, useEffect } from "react";
import { Logo } from "./ui/Logo";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-black backdrop-blur-xl border-b border-white/10 py-3"
        : "bg-black py-6"
        }`}
    >
      <nav className="max-w-full mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <Logo  />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-10">
              <a href="#features" className={`text-sm font-bold tracking-widest  transition-colors ${isScrolled ? "text-white/70 hover:text-[#ca8a04]" : "text-white/80 hover:text-white"}`}>
                Features
              </a>
              <a href="#how-it-works" className={`text-sm font-bold tracking-widest  transition-colors ${isScrolled ? "text-white/70 hover:text-[#ca8a04]" : "text-white/80 hover:text-white"}`}>
                Process
              </a>
              <a href="#programs" className={`text-sm font-bold tracking-widest  transition-colors ${isScrolled ? "text-white/70 hover:text-[#ca8a04]" : "text-white/80 hover:text-white"}`}>
                Programs
              </a>
              <a href="#about" className={`text-sm font-bold tracking-widest  transition-colors ${isScrolled ? "text-white/70 hover:text-[#ca8a04]" : "text-white/80 hover:text-white"}`}>
                About
              </a>
              <a href="/blog" className={`text-sm font-bold tracking-widest  transition-colors ${isScrolled ? "text-white/70 hover:text-[#ca8a04]" : "text-white/80 hover:text-white"}`}>
                Blog
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                className={`text-sm font-bold tracking-widest  transition-colors ${isScrolled ? "text-white/70 hover:text-white" : "text-white/80 hover:text-white"}`}
                onClick={() => router.push("/auth/login")}
              >
                Sign In
              </button>
              <button
                className="px-8 py-3 bg-[#ca8a04] text-white rounded-full hover:bg-[#a16207] shadow-lg transition-all duration-300 font-bold text-xs tracking-widest  active:scale-95"
                onClick={() => router.push("/auth/signup")}
              >
                Join Now
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black tracking-widest text-white/50  lg:hidden">Menu</span>
              <button
                className={`lg:hidden p-2 rounded-lg transition-colors ${isScrolled ? "text-white hover:bg-white/10" : "text-white hover:bg-white/10"}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black z-100 flex flex-col items-center justify-center space-y-8 animate-fade-in text-center p-6">
            <div className="absolute top-6 left-6">
              <Logo  />
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/50"
            >
              <X size={32} />
            </button>

            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter hover:text-[#ca8a04] transition-colors">FEATURES</a>
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter hover:text-[#ca8a04] transition-colors">PROCESS</a>
            <a href="#programs" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter hover:text-[#ca8a04] transition-colors">PROGRAMS</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter hover:text-[#ca8a04] transition-colors">ABOUT</a>
            <a href="/blog" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter hover:text-[#ca8a04] transition-colors">BLOG</a>

            <div className="pt-8 flex flex-col space-y-4 w-full max-w-xs transition-all duration-700">
              <button
                className="w-full py-4 text-sm font-black tracking-widest border border-white/20 rounded-none hover:bg-[#ca8a04] hover:border-[#ca8a04] "
                onClick={() => {
                  router.push("/auth/login");
                  setIsMenuOpen(false);
                }}
              >
                SIGN IN
              </button>
              <button
                className="w-full py-4 text-sm font-black tracking-widest bg-[#ca8a04] text-white rounded-none hover:bg-[#a16207] "
                onClick={() => {
                  router.push("/auth/signup");
                  setIsMenuOpen(false);
                }}
              >
                JOIN NOW
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
