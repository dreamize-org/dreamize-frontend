'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    submenu: [
      { label: 'Our Story', href: '/about/story' },
      { label: 'Our Vision', href: '/about/vision' },
      { label: 'Team', href: '/about/team' },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    submenu: [
      { label: 'The Dreamer (10+)', href: '/programs/dreamer' },
      { label: 'The Builder (Teen+)', href: '/programs/builder' },
      { label: 'Podcast & Outreach', href: '/programs/podcast' },
    ],
  },
  {
    label: 'Impact',
    href: '/impact',
    submenu: [
      { label: 'Student Projects', href: '/impact/projects' },
      { label: 'Success Stories', href: '/impact/stories' },
      { label: 'School Events', href: '/impact/events' },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all">
      <nav className="bg-white/95 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-border/60 rounded-full w-full max-w-6xl px-6 py-3 flex justify-between items-center pointer-events-auto">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo.png"
            alt="Dreamize Africa Logo"
            width={240}
            height={70}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <div key={item.label} className="relative group">
              <Link
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition flex items-center gap-1"
              >
                {item.label}
                {item.submenu && <ChevronDown className="w-4 h-4" />}
              </Link>

              {/* Dropdown */}
              {item.submenu && (
                <div className="absolute left-0 mt-0 w-48 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pt-2 pointer-events-none group-hover:pointer-events-auto">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.label}
                      href={subitem.href}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition first:rounded-t-lg last:rounded-b-lg"
                    >
                      {subitem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden lg:block flex-shrink-0">
          <Link
            href="/auth/signup"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
          >
            Apply Now
            <div className="bg-white/20 p-1 rounded-full flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-foreground flex-shrink-0"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Navigation Panel */}
      {isOpen && (
        <div className="absolute top-[calc(100%+12px)] left-4 right-4 bg-white/95 backdrop-blur-lg border border-border/60 rounded-2xl shadow-xl pointer-events-auto p-4 flex flex-col space-y-2 lg:hidden">
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                className="block text-foreground font-medium hover:text-primary transition py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
              {item.submenu && (
                <div className="ml-4 space-y-2 mt-1">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.label}
                      href={subitem.href}
                      className="block text-sm text-muted-foreground hover:text-primary transition py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      {subitem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/auth/signup"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition mt-4"
            onClick={() => setIsOpen(false)}
          >
            Apply Now
            <div className="bg-white/20 p-1 rounded-full flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
