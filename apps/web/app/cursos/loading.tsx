import { Container, Section, SkeletonCard, Skeleton } from '@arteytierra/ui';

export default function LoadingCursos() {
  return (
    <Section>
      <Container>
        <div className="mb-8 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
