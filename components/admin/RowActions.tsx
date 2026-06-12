import { memo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Props for RowActions component
 *
 * Generic edit / delete action buttons for an admin catalog row
 * (buildings and rooms). The harvested source's status-workflow buttons were
 * removed — PHAP is a showcase catalog, not a scheduling system.
 */
interface RowActionsProps {
    /** Optional callback to edit the row's entity */
    onEdit?: () => void;

    /** Optional callback to delete the row's entity */
    onDelete?: () => void;

    /** Whether any action is currently submitting (disables all buttons) */
    isSubmitting?: boolean;
}

type ActionButtonProps = {
    onClick: () => void;
    icon: LucideIcon;
    colorClass: string;
    title: string;
    disabled?: boolean;
};

function ActionButton({ onClick, icon: Icon, colorClass, title, disabled = false }: ActionButtonProps) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            disabled={disabled}
            aria-label={title}
            title={title}
            className={`p-2 rounded-full transition-colors cursor-pointer ${colorClass} ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            <Icon size={16} />
        </button>
    );
}

const RowActions = memo(function RowActions({ onEdit, onDelete, isSubmitting = false }: RowActionsProps) {
    return (
        <div className="flex gap-2 justify-end">
            {onEdit && (
                <ActionButton
                    onClick={onEdit}
                    icon={Pencil}
                    colorClass="text-[var(--color-text-accent)] hover:bg-[var(--color-surface-elevated)]"
                    title="Edit"
                    disabled={isSubmitting}
                />
            )}
            {onDelete && (
                <ActionButton
                    onClick={onDelete}
                    icon={Trash2}
                    colorClass="text-[var(--color-status-cancelled)] hover:bg-[var(--color-status-cancelled-bg)]"
                    title="Delete"
                    disabled={isSubmitting}
                />
            )}
        </div>
    );
});

RowActions.displayName = 'RowActions';

export default RowActions;
