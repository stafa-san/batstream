import { getClips, SITE_SLUG } from "@/lib/data";
import ClipCard from "@/components/ClipCard";

export const metadata = { title: "The Board — The Bat Barn" };

// THE BOARD (docs/DESIGN.md §8): clips the crowd kept. No curator.
export default async function BoardPage() {
  const clips = await getClips(SITE_SLUG);

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <p className="eyebrow">The Board</p>
      <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-black">
        What you decided to keep
      </h1>
      <p className="mt-4 max-w-[56ch] text-lg text-ink-2">
        The barn&apos;s recorder holds about two weeks, then writes over
        itself. Every clip here exists because someone watching pressed{" "}
        <span className="font-bold text-ink">Keep</span> before it was gone.{" "}
        <span className="font-bold text-ink">Nobody chose these. You did.</span>
      </p>

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {clips.map((c, i) => (
          <div key={c.id} className={c.isFeatured ? "col-span-2" : ""}>
            <ClipCard clip={c} index={i} />
          </div>
        ))}
      </div>
    </main>
  );
}
