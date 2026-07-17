import Link from "next/link";
import { getNight, getSeason, SITE_SLUG } from "@/lib/data";
import MiniTally from "@/components/MiniTally";

// Revalidate every 5 minutes — "tonight" must roll over daily.
export const revalidate = 300;

export const metadata = { title: "The Log — The Bat Barn" };

// THE LOG (docs/DESIGN.md §8): one page per night; the season is a shelf
// of tally sheets.
export default async function LogPage() {
  const season = await getSeason(SITE_SLUG);
  const today = new Date(Date.now() - 4 * 3600_000).toISOString().slice(0, 10);
  const finished = season.filter((n) => n.date < today);
  const details = await Promise.all(
    finished.map((n) => getNight(SITE_SLUG, n.date)),
  );

  let lastMonth = "";
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <p className="eyebrow">The Log</p>
      <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-black">
        Every night, on the record
      </h1>
      <p className="mt-4 max-w-[56ch] text-lg text-ink-2">
        One sheet per night, drawn by whoever was watching. The video gets
        overwritten — <span className="font-bold text-ink">these sheets don&apos;t.</span>{" "}
        Tonight&apos;s is being written{" "}
        <Link href="/" className="font-bold underline decoration-ember underline-offset-4">
          on the Barn page
        </Link>
        .
      </p>

      <ol className="mt-10 flex list-none flex-col gap-2 p-0">
        {finished
          .slice()
          .reverse()
          .map((night, ri) => {
            const detail = details[finished.length - 1 - ri];
            const d = new Date(`${night.date}T12:00:00-04:00`);
            const month = d.toLocaleDateString("en-US", { month: "long" });
            const header = month !== lastMonth ? month : null;
            lastMonth = month;
            return (
              <li key={night.id}>
                {header ? (
                  <h2 className="mb-2 mt-6 font-display text-2xl font-black">
                    {header}
                  </h2>
                ) : null}
                <Link
                  href={`/log/${night.date}`}
                  className="paper-card grid grid-cols-[104px_1fr] items-center gap-x-4 gap-y-1 p-3 no-underline hover:bg-kraft sm:grid-cols-[110px_minmax(0,200px)_1fr_auto]"
                >
                  <span className="whitespace-nowrap font-bold">
                    {d.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="hidden sm:block">
                    {detail ? (
                      <MiniTally night={night} buckets={detail.buckets} />
                    ) : null}
                  </span>
                  <span className="text-[0.9rem] text-ink-2">
                    <span className="tnum font-bold text-ember-deep">
                      {night.stampTotal.toLocaleString()}
                    </span>{" "}
                    stamps
                    {night.note ? (
                      <span className="text-ink-3"> · {night.note}</span>
                    ) : null}
                  </span>
                  <span className="hidden text-[0.85rem] text-ink-3 sm:block">
                    <span className="tnum">{night.watcherPeak}</span> watching at
                    peak
                    {night.clipCount > 0 ? (
                      <>
                        {" "}
                        · <span className="tnum">{night.clipCount}</span> kept
                      </>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
      </ol>
    </main>
  );
}
