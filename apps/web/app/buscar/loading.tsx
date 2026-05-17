import { Container, Section, Skeleton, SkeletonText } from '@arteytierra/ui';

export default function LoadingBuscar() {
  return (
    <Section>
      <Container>
        <Skeleton className="mb-6 h-10 w-2/3" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-ink-950/10 bg-bone-50 p-5">
              <Skeleton className="mb-2 h-5 w-1/3" />
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
