import Container from './Container';
import { t } from '@/lib/content/strings';

export default function ValueProps() {
  return (
    <section className="py-16">
      <Container>
        <div className="grid gap-8 sm:grid-cols-3">
          {t.valueProps.map((p) => (
            <div key={p.title}>
              <h3 className="font-heading text-2xl text-text-accent">{p.title}</h3>
              <p className="mt-2 text-text-secondary">{p.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
