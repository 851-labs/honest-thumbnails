function show(platform, enabled, useSettingsInsteadOfPreferences) {
    document.body.classList.add(`platform-${platform}`);

    // macOS 12 still calls it "Safari Preferences".
    if (platform === "mac" && useSettingsInsteadOfPreferences === false) {
        for (const el of document.querySelectorAll(".settings-name")) el.textContent = "Safari Preferences";
    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle("state-on", enabled);
        document.body.classList.toggle("state-off", !enabled);
    } else {
        document.body.classList.remove("state-on", "state-off");
    }
}

function openPreferences() {
    webkit.messageHandlers.controller.postMessage("open-preferences");
}

document.querySelector("button.open-preferences").addEventListener("click", openPreferences);
