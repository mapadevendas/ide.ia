import { cn } from "@/lib/utils";

const LOGO = "/assets/uploads/cardume-logo.webp";

/* Logotipo Cardume: o slogan da arte é recortado e no lugar entra "Bread & Fish Co" em letras menores. */
export function Marca({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block w-52 [container-type:inline-size]", className)}>
      <img
        src={LOGO}
        alt="Cardume"
        width={900}
        height={225}
        className="block w-full mix-blend-lighten [clip-path:polygon(0_0,100%_0,100%_67%,40%_67%,40%_100%,0_100%)] print:hidden"
      />
      <span className="absolute left-[42.5%] top-[71%] whitespace-nowrap text-[max(8.5px,3.4cqw)] font-semibold uppercase leading-none tracking-[0.22em] text-foreground/70 print:hidden">
        Bread &amp; Fish Co
      </span>
      <span className="hidden font-heading text-xl font-semibold print:inline">
        Cardume <span className="text-sm font-normal text-muted-foreground">· Bread &amp; Fish Co</span>
      </span>
    </span>
  );
}

/* Slogan da marca, maior que a linha "Bread & Fish Co". */
export function Slogan({ className }: { className?: string }) {
  return (
    <p className={cn("font-heading text-2xl font-medium tracking-tight md:text-3xl", className)}>
      Organizado por natureza, feito para <span className="text-primary">multiplicar.</span>
    </p>
  );
}
