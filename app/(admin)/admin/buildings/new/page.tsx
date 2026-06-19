import Container from '@/components/Container';
import { createBuilding } from '../actions';

export default function NewBuilding() {
  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">New building</h1>
      <form action={createBuilding} className="mt-6 space-y-4 max-w-lg">
        <label className="block text-text-secondary text-sm">Building name
          <input name="name" required placeholder="Building name"
            className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" /></label>
        <label className="block text-text-secondary text-sm">Address
          <input name="address" placeholder="Address"
            className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" /></label>
        <label className="block text-text-secondary text-sm">Description
          <textarea name="description" placeholder="Description" rows={4}
            className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" /></label>
        <button className="px-4 py-2 bg-accent-gold text-text-inverse">Create</button>
      </form>
    </Container>
  );
}
