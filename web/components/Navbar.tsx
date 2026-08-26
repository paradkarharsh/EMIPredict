"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/predict", label: "Predict Affordability" },
  { href: "/models", label: "Model Benchmarks" },
  { href: "/explorer", label: "Portfolio Explorer" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border-hairline shadow-nav"
          : "bg-background/60 backdrop-blur-lg border-b border-transparent"
      }`}
    >
      <div className="max-w-[1240px] mx-auto h-14 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-text-primary font-semibold text-[15px] tracking-tight hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-border-hairline bg-black shadow-sm flex items-center justify-center shrink-0">
            <img
              src="/images/logo.jpg"
              alt="EMIPredict AI Brand Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold tracking-tight">EMIPredict AI</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-card-subtle border border-border-hairline rounded-pill p-1 shadow-sm">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-pill text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-surface text-text-primary shadow-sm font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-accent-subtle"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/predict"
            className="hidden sm:inline-flex apple-button-primary !py-1.5 !px-4 !text-[13px]"
          >
            Start Assessment
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-full border border-border-hairline flex items-center justify-center text-text-secondary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border-hairline px-4 pt-2 pb-6 space-y-2">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-accent-subtle text-accent font-semibold"
                    : "text-text-secondary hover:bg-card-subtle"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/predict"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full apple-button-primary !py-2.5 !text-sm"
            >
              Start Assessment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
