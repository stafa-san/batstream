import { getSite, getTonight, SITE_SLUG } from "@/lib/data";
import BarnScene from "@/components/BarnScene";
import LiveStream from "@/components/LiveStream";
import StampButton from "@/components/StampButton";
import TallySheet from "@/components/TallySheet";
import StatusLine from "@/components/StatusLine";
import KeepButton from "@/components/KeepButton";
import BatGlyph from "@/components/BatGlyph";

// Revalidate every 5 minutes — "tonight" must roll over daily.
export const revalidate = 300;

// THE BARN (docs/DESIGN.md §8) — the illustrated barn with the live window
// cut into its hayloft fills the top of the page. The stamp desk follows.
export default async function BarnPage() {
  const [site, night] = await Promise.all([
    getSite(SITE_SLUG),
    getTonight(SITE_SLUG),
  ]);

  return (
    <main>
      {/* ============ The barn scene (md+) / plain window (mobile) ============ */}
      <section>
        <div className="hidden md:block">
          <BarnScene site={site} night={night} />
        </div>
        <div className="mx-auto max-w-6xl px-5 pt-4 sm:px-8 md:hidden">
          <LiveStream site={site} night={night} />
        </div>
      </section>

      {/* ============ Status + the stamp desk — one continuous band ============ */}
      <section className="border-b border-edge bg-paper-2 pb-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-edge/60 px-5 py-3 sm:px-8">
          <StatusLine site={site} night={night} />
          <p className="hidden text-[0.85rem] text-ink-3 md:block">
            {site.name} · location protected
            {!site.streamUrl ? " · demo footage until the barn camera is connected" : ""}
          </p>
        </div>
        <div className="pt-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 md:grid-cols-[minmax(280px,1fr)_minmax(0,1.8fr)]">
            <div className="flex flex-col items-center gap-8">
              <StampButton slug={site.slug} />
              <KeepButton slug={site.slug} />
            </div>
            <TallySheet night={night} slug={site.slug} />
          </div>
        </div>
        </div>
      </section>

      {/* ============ New here? Three honest sentences. ============ */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="paper-card p-5">
            <BatGlyph className="mb-3 h-6 w-10 text-ink" />
            <h3 className="text-lg font-black">Watch the window</h3>
            <p className="mt-1.5 text-[0.95rem] text-ink-2">
              A thermal camera looks into the barn all night. Bats show up as
              warm shapes, circling the roost as the light falls. Nobody has
              ever counted this colony — the people watching are the count.
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
