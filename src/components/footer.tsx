import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <img src="./seeksphere-logo.png" />
            </div>
            <span className="text-lg font-semibold text-foreground">SeekSphere</span>
          </Link>

          {/* Links */}
          <div className="flex gap-8">
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
            <Link href="#why-us" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Why SeekSphere
            </Link>
            <Link href="#contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SeekSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
