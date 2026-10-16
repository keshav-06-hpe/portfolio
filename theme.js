"use strict";

(() => {
  const storageKey = "portfolio-theme";
  const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = null;

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "dark" || saved === "light") preference = saved;
  } catch {}

  function updateToggle() {
    const toggles = document.querySelectorAll(".theme-toggle");
    const isLight = document.documentElement.dataset.theme === "light";
    const label = isLight ? "Switch to dark mode" : "Switch to light mode";
    toggles.forEach(toggle => {
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("aria-pressed", String(isLight));
      toggle.title = label;
      const tooltip = toggle.querySelector(".theme-tooltip");
      if (tooltip) tooltip.textContent = label;
      toggle.hidden = false;
    });
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === "light" ? "#f7f9f8" : "#101313";
    updateToggle();
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  function followPreference() {
    applyTheme(preference || (systemPreference.matches ? "dark" : "light"));
  }

  followPreference();
  systemPreference.addEventListener("change", () => {
    if (!preference) followPreference();
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = event.newValue === "light" || event.newValue === "dark" ? event.newValue : null;
    followPreference();
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".theme-toggle").forEach(toggle => {
      toggle.addEventListener("click", () => {
        preference = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        try {
          window.localStorage.setItem(storageKey, preference);
        } catch {}
        applyTheme(preference);
      });
    });
    updateToggle();
  });
})();