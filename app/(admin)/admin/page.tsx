import Link from 'next/link';
import Container from '@/components/Container';

export default function AdminDashboard() {
  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">Admin</h1>
      <ul className="mt-6 space-y-3">
        <li><Link className="text-text-accent underline" href="/admin/buildings">Buildings</Link></li>
        <li><Link className="text-text-accent underline" href="/admin/settings">Site settings (contacts)</Link></li>
      </ul>
    </Container>
  );
}
