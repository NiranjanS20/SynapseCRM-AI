import { Card, CardBody } from "./ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardBody>
        <div className="py-10 text-center">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>
      </CardBody>
    </Card>
  );
}
