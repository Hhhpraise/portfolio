interface SectionHeadingProps {
  label: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ label, title, subtitle }: SectionHeadingProps) {
  return (
    <>
      <span className="font-mono text-[0.6875rem] font-medium text-accent uppercase tracking-[0.15em] mb-4 block">
        {label}
      </span>
      <h2
        className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em] mb-5"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {subtitle && (
        <p className="text-text-muted text-[1.0625rem] max-w-[560px] leading-[1.7]">{subtitle}</p>
      )}
    </>
  );
}
