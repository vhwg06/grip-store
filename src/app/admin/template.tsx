export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <section className="animate-in fade-in duration-200 motion-reduce:animate-none">
      {children}
    </section>
  )
}
