import { Container, Section, Skeleton, SkeletonText } from '@arteytierra/ui';

export default function LoadingMiCuenta() {
  return (
    <Section>
      <Container className="max-w-4xl">
        <Skeleton className="mb-2 h-9 w-1/2" />
        <Skeleton className="mb-8 h-4 w-1/3" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-ink-950/10 p-6 bg-bone-50">
              <Skeleton className="mb-3 h-5 w-1/3" />
              <SkeletonText lines={3} />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
