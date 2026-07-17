import { getSpecies } from "@/lib/data";
import SpeciesCard from "@/components/SpeciesCard";

export const metadata = { title: "The Bats — The Bat Barn" };

// THE BATS (docs/DESIGN.md §8) — a field guide, not a results page.
// We have no detection data, and the copy must not imply we do.
export default async function BatsPage() {
  const species = await getSpecies();

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <p className="eyebrow">The Bats · a field guide</p>
      <h1 className="mt-3 max-w-[18ch] text-[clamp(2rem,4vw,3rem)] font-black">
        Six species might be up there
      </h1>
      <p className="mt-4 max-w-[56ch] text-lg text-ink-2">
        These are the bats of this corner of Ohio — the ones that{" "}
        <span className="font-bold text-ink">may live here</span>. We can&apos;t
        tell them apart on the window yet; that&apos;s next year&apos;s
        problem. For now, meet the neighbours.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {species.map((sp) => (
          <SpeciesCard key={sp.id} species={sp} />
        ))}
      </div>

      <p className="mt-10 max-w-[60ch] text-[0.95rem] text-ink-2">
        Conservation status from the IUCN Red List. Half of these species are
        in real trouble — white-nose syndrome, habitat loss — which is why a
        barn built for them, and a count of who uses it, matters at all.
      </p>
    </main>
  );
}
