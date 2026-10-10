export function LogoMark({ className = "logo-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 2 36 8v12c0 9.5-6.4 16.2-16 19C10.4 36.2 4 29.5 4 20V8L20 2Z" fill="currentColor" opacity=".14" />
      <path d="M20 2 36 8v12c0 9.5-6.4 16.2-16 19C10.4 36.2 4 29.5 4 20V8L20 2Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 22.5 18 28l11-15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export default function Logo() {
  return (
    <>
      <LogoMark />
      <span>Secure Cleaning<small>Operations Inc.</small></span>
    </>
  );
}
