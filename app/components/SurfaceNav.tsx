import Link from "next/link";

export function SurfaceNav() {
  return (
    <nav className="surface-nav">
      <Link href="/" className="brand-lockup">
        <span>NEP</span>
        <b>NEW ERA<br />PRESENTATION</b>
      </Link>
      <div>
        <Link href="/">PRESENT</Link>
        <Link href="/web">WEB</Link>
        <Link href="/join">JOIN</Link>
        <Link href="/mypage">MY PAGE</Link>
        <Link href="/privacy">PRIVACY</Link>
      </div>
    </nav>
  );
}
