import Link from "next/link";
import { notFound } from "next/navigation";
import { getNight, SITE_SLUG } from "@/lib/data";
import TallySheet from "@/components/TallySheet";
import ClipCard from "@/components/ClipCard";

// Revalidate every 5 minutes — "tonight" must roll over daily.
export const revalidate = 300;

export function generateMetadata({ params }: { params: { date: string } }) {
  return { title: `${params.date} — The Log — The Bat Barn` };
}

export default async function NightPage({
  params,
}: {
  params: { date: string };
}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) notFound();
  const detail = await getNight(SITE_SLUG, params.date);
  if (!detail) notFound();
  const { night, buckets, clips } = detail;
  const d = new Date(`${night.date}T12:00:00-04:00`);
  const sunset = new Date(night.sunset).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <Link
        href="/log"
        className="text-[0.9rem] font-bold text-ink-2 underline decoration-edge underline-offset-4 hover:decoration-ember"
      >
        ← The Log
      </Link>
      <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-black">
        {d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </h1>
      <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.95rem] text-ink-2">
        <span>
          Sunset <span className="tnum font-bold">{sunset}</span>
        </span>
        <span>
          <span className="tnum font-bold text-ember-deep">
            {night.stampTotal.toLocaleString()}
          </span>{" "}
          stamps
        </span>
        <span>
          <span className="tnum font-bold">{night.watcherPeak}</span> watching
          at peak
        </span>
        {night.note ? <span className="text-ink-3">{night.note}</span> : null}
      </p>

      <div className="mt-8">
        <TallySheet night={night} slug={SITE_SLUG} live={false} buckets={buckets} />
      </div>

      {clips.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-black">
            Kept from this night
          </h2>
          <p className="mt-1 text-[0.95rem] text-ink-2">
            Saved from the recorder by the people watching.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {clips.map((c, i) => (
              <ClipCard key={c.id} clip={c} index={i} />
            ))}
          </div>
        </section>
      ) : (
        <p className="mt-10 text-ink-3">
          Nothing was kept this night — whatever happened up there is gone
          with the recorder. That&apos;s exactly why the Keep button exists.
        </p>
      )}
    </main>
  );
}
