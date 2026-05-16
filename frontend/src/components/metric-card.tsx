import { Card, CardBody, CardHeader } from "./ui/card";

export function MetricCard({ label, value, delta, detail }: { label: string; value: string; delta?: string; detail?: string }) {
  return (
    <Card className="animate-rise">
      <CardHeader>
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</div>
          <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
        </div>
        {delta ? <div className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-200">{delta}</div> : null}
      </CardHeader>
      {detail ? <CardBody className="text-sm text-slate-400">{detail}</CardBody> : null}
    </Card>
  );
}
