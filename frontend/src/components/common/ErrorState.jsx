import { AlertTriangle } from "lucide-react";

export function ErrorState({ title = "Something went wrong", description, action, testId }) {
    return (
        <div
            data-testid={testId || "error-state"}
            className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center"
        >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
            </span>
            <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
            )}
            {action}
        </div>
    );
}
