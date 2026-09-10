import { Container, Section, SkeletonCard, Skeleton } from '@arteytierra/ui';

export default function LoadingTienda() {
  return (
    <Section>
      <Container>
        <Skeleton className="mb-8 h-10 w-1/3" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
