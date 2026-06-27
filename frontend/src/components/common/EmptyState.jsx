import { InboxIcon } from "lucide-react";

export function EmptyState({ icon: Icon = InboxIcon, title, description, action, testId }) {
    return (
        <div
            data-testid={testId || "empty-state"}
            className="cv-card flex flex-col items-center gap-3 p-10 text-center"
        >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            {description && (
                <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
            )}
            {action}
        </div>
    );
}
