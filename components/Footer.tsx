import Deckle from "./Deckle";
import PartnerStrip from "./PartnerStrip";

export default function Footer() {
  return (
    <footer className="mt-16">
      <Deckle seed={31} />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8">
        <p className="max-w-[20ch] font-display text-4xl font-black leading-tight sm:text-5xl">
          See something move up there?{" "}
          <span className="text-ember-deep">Stamp it.</span> Screee!
        </p>
        <PartnerStrip />
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[0.92rem] text-ink-2">
          <span className="text-sage">
            ◈ Roost location protected for conservation
          </span>
          <a href="mailto:hello@thebatbarn.org" className="underline decoration-edge underline-offset-4 hover:decoration-ember">
            hello@thebatbarn.org
          </a>
        </div>
      </div>
    </footer>
  );
}
