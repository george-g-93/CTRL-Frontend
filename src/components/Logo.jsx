// FILE: src/components/Logo.jsx
import { Link } from "react-router-dom";

/**
 * Renders a theme-aware logo that switches between:
 * - Desktop vs Mobile
 * - Light vs Dark
 *
 * Props:
 * - to: string (link target, default "/")
 * - className: string (container sizing)
 * - alt: string (accessible label)
 */
export default function Logo({
  to = "/",
  className = "h-9", // overall block height; mobile/desktop widths come from the image itself
  alt = "Company logo",
}) {
  return (
    <Link to={to} className={`inline-flex items-center ${className}`} aria-label="Home">
      {/* MOBILE (<= md) */}
      <picture className="md:hidden inline-flex h-full">
        {/* Dark mobile */}
        <source
          srcSet="/logo-mobile-dark.png"
          media="(prefers-color-scheme: dark)"
        />
        {/* Light mobile (fallback) */}
        <img
          src="/logo-mobile-light.png"
          alt={alt}
          className="h-full w-auto"
          loading="eager"
          decoding="async"
        />
      </picture>

      {/* DESKTOP (>= md) */}
      <picture className="hidden md:inline-flex h-full">
        {/* Dark desktop */}
        <source
          srcSet="/logo-dark.png"
          media="(prefers-color-scheme: dark)"
        />
        {/* Light desktop (fallback) */}
        <img
          src="/logo-light.png"
          alt={alt}
          className="h-full w-auto"
          loading="eager"
          decoding="async"
        />
      </picture>
    </Link>
  );
}
