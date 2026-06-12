'use client';
export default function DeleteForm({ action, confirmMessage, children, className }: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form action={action} className={className}
      onSubmit={(e) => { if (!confirm(confirmMessage)) e.preventDefault(); }}>
      {children}
    </form>
  );
}
