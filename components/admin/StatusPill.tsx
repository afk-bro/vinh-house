import { memo } from "react";
import { CheckCircle2, XCircle, type LucideIcon } from "lucide-react";

/** Per-room availability status (matches the rooms.status DB check). */
export type RoomStatus = 'available' | 'not_available';

/**
 * Props for StatusPill component
 *
 * Displays a colored pill badge with icon for a room's availability status.
 */
interface StatusPillProps {
    /** The room availability status to display */
    status: RoomStatus;
}

const StatusPill = memo(function StatusPill({ status }: StatusPillProps) {
    const config: Record<RoomStatus, { label: string; icon: LucideIcon; classes: string }> = {
        available: {
            label: 'Available',
            icon: CheckCircle2,
            classes: 'bg-[var(--color-status-confirmed-bg)] text-[var(--color-status-confirmed)] border-[var(--color-status-confirmed-border)]'
        },
        not_available: {
            label: 'Not Available',
            icon: XCircle,
            classes: 'bg-[var(--color-status-cancelled-bg)] text-[var(--color-status-cancelled)] border-[var(--color-status-cancelled-border)]'
        },
    };

    const { label, icon: Icon, classes } = config[status];

    return (
        <span className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wide border ${classes}`}>
            <Icon size={11} className="shrink-0" />
            {label}
        </span>
    );
});

StatusPill.displayName = 'StatusPill';

export default StatusPill;
