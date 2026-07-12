/**
 * Natureline Security Context
 * Client-side script to deter casual source-code inspection.
 */

// Disable Right-Click Context Menu
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

// Disable common developer shortcut combinations
document.addEventListener('keydown', function (e) {
    // Prevent F12
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }

    // Prevent Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element Select)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        return false;
    }

    // Prevent Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'U') {
        e.preventDefault();
        return false;
    }
});