import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Awards", href: "/awards" },
];

export default function Navbar() {
  return (
    <header className="w-full bg-[#F3EFE7]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-2xl leading-6 text-[#241A14]"
        >
          Capture
          <br />
          Life
        </Link>

        {/* Nav links */}
        <ul className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[15px] text-[#241A14] transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/reserve"
          className="rounded-full bg-[#dd492f] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#9f3320]"
        >
          Reserve Now
        </Link>
      </nav>
    </header>
  );
}