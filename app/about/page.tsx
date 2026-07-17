import Link from "next/link";
import Deckle from "@/components/Deckle";

export const metadata = { title: "About — The Bat Barn" };

const FAQ: Array<[string, string]> = [
  [
    "Does my stamp disturb the bats?",
    "No — and it can't. Nothing the public does here actuates anything at the barn: no lights, no sounds, no doors. A stamp writes a timestamp to a database. That hard line is why the park trusts this project.",
  ],
  [
    "Why isn't there a bat count on the site?",
    "Because we don't have one, and we won't pretend to. There is no detector at the barn yet. The tally sheet shows exactly what exists: timestamped human observations. When automated counting arrives, it will be checked against what the crowd drew.",
  ],
  [
    "Where exactly is the barn?",
    "Inside Winton Woods, and that's as precise as we'll get. Roost locations are kept vague on purpose — disturbance is one of the biggest threats to bats. We'd rather tell you that plainly than be mysterious about it.",
  ],
  [
    "When is there something to see?",
    "Roughly May through August, starting about 20 minutes before sunset — that's when the colony stirs, circles the roost, and heads out to hunt. The window opens 30 minutes before sunset and closes at midnight.",
  ],
  [
    "What happens to a moment I Keep?",
    "The barn's recorder overwrites itself about every two weeks. Keeping a moment flags that ±15 seconds for retention, so it survives. The Board is everything the crowd has saved — nothing on it was picked by us.",
  ],
  [
    "Who sees the data?",
    "Great Parks of Hamilton County, the research team, and — as the project matures — the North American Bat Monitoring Program (NABat). Your stamps carry no identity: a stamp is a timestamp and an anonymous rate-limiting hash, nothing else.",
  ],
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <p className="eyebrow">About</p>
      <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-black">
        A barn, a question, and everyone watching
      </h1>

      <div className="mt-6 flex flex-col gap-5 text-[1.05rem] leading-relaxed text-ink-2">
        <p>
          Great Parks of Hamilton County built a bat barn in Winton Woods — a
          purpose-made roost for animals that badly need one. It worked.
          Bats moved in. And then the most basic question turned out to be
          unanswerable: <span className="font-bold text-ink">how many?</span>
        </p>
        <p>
          Counting bats in a dark barn is genuinely hard. The instruments that
          could do it automatically don&apos;t exist here yet. So this site
          turns the question over to the only measurement available:{" "}
          <span className="font-bold text-ink">people, watching, stamping what they see.</span>{" "}
          Every stamp is a timestamped observation. Five-minute columns of
          them draw each night&apos;s activity — raw marks, no smoothing, no
          inference. When automated counting arrives, it will be validated
          against what the crowd drew. Your stamps are the ground truth.
        </p>
        <p>
          One rule governs everything here:{" "}
          <span className="font-bold text-ink">
            the public never actuates anything that touches a bat.
          </span>{" "}
          Stamps and Keeps act on data, never on animals. No lights, no
          sounds, no doors, no exceptions.
        </p>
      </div>

      <div className="my-10">
        <Deckle seed={17} />
      </div>

      <h2 className="font-display text-2xl font-black">Questions people ask</h2>
      <div className="mt-4 flex flex-col gap-2">
        {FAQ.map(([q, a]) => (
          <details key={q} className="paper-card group p-4">
            <summary className="cursor-pointer list-none font-bold marker:content-none">
              <span className="mr-2 inline-block text-ember-deep transition-transform duration-150 group-open:rotate-90">
                ›
              </span>
              {q}
            </summary>
            <p className="mt-2 pl-5 text-[0.98rem] text-ink-2">{a}</p>
          </details>
        ))}
      </div>

      <div className="my-10">
        <Deckle seed={23} />
      </div>

      <h2 className="font-display text-2xl font-black">Who&apos;s behind it</h2>
      <p className="mt-3 text-[1.02rem] text-ink-2">
        A collaboration between{" "}
        <span className="font-bold text-ink">Great Parks of Hamilton County</span>{" "}
        and the <span className="font-bold text-ink">Johnson bat lab</span>,
        building toward the North American Bat Monitoring Program (NABat).
        Questions, press, school groups:{" "}
        <a
          href="mailto:hello@thebatbarn.org"
          className="font-bold underline decoration-ember underline-offset-4"
        >
          hello@thebatbarn.org
        </a>
        . Roost location protected for conservation — see{" "}
        <Link href="/bats" className="font-bold underline decoration-edge underline-offset-4 hover:decoration-ember">
          the field guide
        </Link>{" "}
        for who might be up there.
      </p>
    </main>
  );
}
