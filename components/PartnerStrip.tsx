/* eslint-disable @next/next/no-img-element */

// The partnership, stated with the real marks: Great Parks × University of
// Cincinnati. mix-blend-multiply sinks the logos' white boxes into the
// paper so they sit like ink stamps, not stickers.
// TODO: confirm the exact team-name line with the project leads.
export default function PartnerStrip({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex flex-col items-start gap-1.5" : "flex flex-col gap-3"}>
      <p className="eyebrow">A partnership of</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <img
          src="/logos/great-parks.png"
          alt="Great Parks of Hamilton County — Find Your Wild"
          className={(compact ? "h-8" : "h-11") + " w-auto mix-blend-multiply"}
        />
        <img
          src="/logos/uc.png"
          alt="University of Cincinnati"
          className={(compact ? "h-9" : "h-12") + " w-auto mix-blend-multiply"}
        />
      </div>
      {!compact ? (
        <p className="text-[0.88rem] text-ink-2">
          Great Parks of Hamilton County × the University of Cincinnati —
          Dr.&nbsp;Joseph&nbsp;S.&nbsp;Johnson, Odunayo, Mustapha, and the project team.
        </p>
      ) : null}
    </div>
  );
}
