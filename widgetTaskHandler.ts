import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { createQuickEntryWidgetRepresentation } from "./widgets/QuickEntryWidget";

// ─── Widget name → representation factory ────────────────────────────────────

const WIDGET_FACTORIES: Record<
    string,
    () => ReturnType<typeof createQuickEntryWidgetRepresentation>
> = {
    QuickEntry: createQuickEntryWidgetRepresentation,
};

// ─── Task handler ─────────────────────────────────────────────────────────────

export async function widgetTaskHandler(
    props: WidgetTaskHandlerProps,
): Promise<void> {
    const name = props.widgetInfo.widgetName;

    switch (props.widgetAction) {
        case "WIDGET_ADDED":
        case "WIDGET_UPDATE":
        case "WIDGET_RESIZED":
            if (name in WIDGET_FACTORIES) {
                props.renderWidget(WIDGET_FACTORIES[name]());
            }
            break;

        // WIDGET_CLICK is handled natively by the OPEN_URI clickAction
        // set on the widget component itself — no JS action needed here.
        case "WIDGET_CLICK":
            break;

        case "WIDGET_DELETED":
            break;

        default:
            break;
    }
}
