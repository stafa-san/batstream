import { getSite, getTonight, SITE_SLUG } from "@/lib/data";
import LiveStream from "@/components/LiveStream";
import StampButton from "@/components/StampButton";
import TallySheet from "@/components/TallySheet";
import StatusLine from "@/components/StatusLine";
import KeepButton from "@/components/KeepButton";
import BatGlyph from "@/components/BatGlyph";

// Revalidate every 5 minutes — "tonight" must roll over daily.
export const revalidate = 300;

// THE BARN (docs/DESIGN.md §8) — the window, the stamp, tonight's tally.
// Everything else is secondary.
export default async function BarnPage() {
  const [site, night] = await Promise.all([
    getSite(SITE_SLUG),
    getTonight(SITE_SLUG),
  ]);

  return (
    <main>
      {/* The hero number is a blank. */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-8">
        <p className="eyebrow">Winton Woods, Ohio · a Great Parks barn</p>
        <h1 className="mt-3 max-w-[15ch] text-[clamp(2.6rem,5.5vw,4.5rem)] font-black">
          How many bats live in this barn?
        </h1>
        {/* The answer is a blank — a held breath, not a number. */}
        <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-1">
          <p
            aria-label="Unknown — nobody has counted"
            className="border-b-2 border-dashed border-edge pb-1 pr-10 font-display text-[clamp(4rem,9vw,7rem)] font-black leading-[0.85] text-ink"
          >
            —
          </p>
          <p className="pb-2 text-[0.85rem] font-bold uppercase tracking-[0.14em] text-ink-3">
            no one has ever counted
          </p>
        </div>
        <p className="mt-6 max-w-[54ch] text-lg text-ink-2">
          Nobody knows. Not Great Parks, who built it. Not us. Until the
          counting instruments exist, the people watching this window are the
          only measurement there is. <span className="font-bold text-ink">That&apos;s you.</span>
        </p>
      </section>

      {/* The barn interior: rafters, the window, the stamp. */}
      <section className="border-y border-edge bg-paper-2 py-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {/* rafter band */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1200 64"
            preserveAspectRatio="none"
            className="mb-6 h-10 w-full sm:h-14"
          >
            <rect x="0" y="46" width="1200" height="14" fill="var(--kraft)" stroke="var(--edge)" />
            {[80, 320, 560, 800, 1040].map((x) => (
              <g key={x}>
                <polygon
                  points={`${x},50 ${x + 60},0 ${x + 68},0 ${x + 8},50`}
                  fill="var(--kraft)"
                  stroke="var(--edge)"
                />
                <polygon
                  points={`${x + 120},50 ${x + 60},0 ${x + 52},0 ${x + 112},50`}
                  fill="var(--kraft)"
                  stroke="var(--edge)"
                />
              </g>
            ))}
          </svg>

          <StatusLine site={site} night={night} />

          <div className="mt-5 grid items-start gap-8 lg:grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)]">
            <LiveStream site={site} night={night} />
            <div className="flex flex-col items-center gap-8 lg:pt-6">
              <StampButton slug={site.slug} />
              <KeepButton slug={site.slug} />
            </div>
          </div>

          <div className="mt-10">
            <TallySheet night={night} slug={site.slug} />
          </div>
        </div>
      </section>

      {/* New here? Three honest sentences. */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="paper-card p-5">
            <BatGlyph className="mb-3 h-6 w-10 text-ink" />
            <h3 className="text-lg font-black">Watch the window</h3>
            <p className="mt-1.5 text-[0.95rem] text-ink-2">
              A thermal camera looks into the barn all night. Bats show up as
              warm shapes, circling the roost as the light falls.
            </p>
          </div>
          <div className="paper-card p-5">
            <svg viewBox="0 0 24 24" className="mb-3 h-6 w-6" aria-hidden="true">
              <rect x="4" y="14" width="16" height="4" fill="var(--ember)" />
              <rect x="8" y="4" width="8" height="10" fill="var(--ink)" />
            </svg>
            <h3 className="text-lg font-black">Stamp what you see</h3>
            <p className="mt-1.5 text-[0.95rem] text-ink-2">
              Something moves — you stamp. Your mark lands on tonight&apos;s
              sheet with everyone else&apos;s, and together they draw the
              night. Stamps touch data, never the animals.
            </p>
          </div>
          <div className="paper-card p-5">
            <svg viewBox="0 0 24 24" className="mb-3 h-6 w-6 text-dusk" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M8 12.5 L 15.5 5 a 3.2 3.2 0 0 1 4.5 4.5 L 10.5 19 a 5 5 0 0 1 -7 -7 L 12.8 2.7"
              />
            </svg>
            <h3 className="text-lg font-black">Keep the good ones</h3>
            <p className="mt-1.5 text-[0.95rem] text-ink-2">
              The barn&apos;s recorder overwrites itself about every two
              weeks. Keeping a moment genuinely saves it — what nobody keeps
              is gone.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
