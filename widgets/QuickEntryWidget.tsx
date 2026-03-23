import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

// ─── Dark variant (Fitness Neon) ──────────────────────────────────────────────

function QuickEntryWidgetDark() {
    return (
        <FlexWidget
            style={{
                height: "match_parent",
                width: "match_parent",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#0F0F1A",
                borderRadius: 16,
            }}
            clickAction="OPEN_URI"
            clickActionData={{ uri: "mojamicha://quick-entry" }}
            accessibilityLabel="Moja Micha — quick meal entry"
        >
            <TextWidget
                text="+"
                style={{
                    fontSize: 40,
                    color: "#00E5FF",
                    fontWeight: "bold",
                }}
            />
            <TextWidget
                text="Moja Micha"
                style={{
                    fontSize: 11,
                    color: "#B0B0C0",
                    marginTop: 2,
                }}
            />
        </FlexWidget>
    );
}

// ─── Light variant (Fresh & Vibrant) ──────────────────────────────────────────

function QuickEntryWidgetLight() {
    return (
        <FlexWidget
            style={{
                height: "match_parent",
                width: "match_parent",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#F8F9FA",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E0E0E0",
            }}
            clickAction="OPEN_URI"
            clickActionData={{ uri: "mojamicha://quick-entry" }}
            accessibilityLabel="Moja Micha — quick meal entry"
        >
            <TextWidget
                text="+"
                style={{
                    fontSize: 40,
                    color: "#FF6B6B",
                    fontWeight: "bold",
                }}
            />
            <TextWidget
                text="Moja Micha"
                style={{
                    fontSize: 11,
                    color: "#555555",
                    marginTop: 2,
                }}
            />
        </FlexWidget>
    );
}

// ─── Exports ─────────────────────────────────────────────────────────────────
// The task handler uses these two separately to build a dual-theme
// WidgetRepresentation: { light: <QuickEntryWidgetLight />, dark: <QuickEntryWidgetDark /> }

export { QuickEntryWidgetDark, QuickEntryWidgetLight };
/**
 * Returns a dual-theme WidgetRepresentation for the QuickEntry widget.
 * Call from the widget task handler (a .ts file that can't use JSX directly).
 */
export function createQuickEntryWidgetRepresentation() {
    return {
        light: <QuickEntryWidgetLight />,
        dark: <QuickEntryWidgetDark />,
    };
}