import { Container, Section, SkeletonCard, Skeleton } from '@arteytierra/ui';

export default function LoadingBlog() {
  return (
    <Section>
      <Container>
        <Skeleton className="mb-2 h-4 w-20" />
        <Skeleton className="mb-8 h-10 w-1/2" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
