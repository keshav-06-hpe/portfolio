"use strict";

(() => {
  const dialog = document.querySelector(".command-dialog");
  const launcher = document.querySelector(".command-launcher");
  const input = document.querySelector("#command-input");
  const suggestions = document.querySelector("#command-suggestions");
  const status = document.querySelector(".command-status");
  const closeButton = document.querySelector(".command-close");
  const mobileNavigation = document.querySelector("#mobile-nav");
  const mobileMenuToggle = document.querySelector(".menu-toggle");
  if (!dialog || !launcher || !input || !suggestions || !status) return;

  const commands = [
    { command: "show experience", label: "Show experience", description: "Jump to your HPE career timeline", keywords: "career work history job", action: showExperience },
    { command: "show projects", label: "Show projects", description: "Explore all six selected projects", keywords: "portfolio work code", action: () => showProjects("all") },
    { command: "show college projects", label: "Show college projects", description: "Filter to your three college projects", keywords: "university student academic lets fit assisted vision xss", action: () => showProjects("college") },
    { command: "show education", label: "Show education", description: "Open your education timeline", keywords: "degree school vit", action: showEducation },
    { command: "show skills", label: "Show skills", description: "Browse your technology stack", keywords: "tech technology tools", action: () => navigateTo("skills") },
    { command: "show creative", label: "Show creative space", description: "Visit your novel and writing", keywords: "book writing novel creative space", action: () => navigateTo("creative") },
    { command: "show contact", label: "Show contact", description: "Find ways to get in touch", keywords: "email message", action: () => navigateTo("contact") },
    { command: "show about", label: "Show about", description: "Read your introduction", keywords: "profile bio me", action: () => navigateTo("about") },
    { command: "open resume", label: "Open resume", description: "Download your PDF resume", keywords: "cv pdf download", action: () => openExternal("assets/resume.pdf", "Keshav-Varshney-Resume.pdf") },
    { command: "open github", label: "Open personal GitHub", description: "Visit github.com/keshav-06", keywords: "personal code repositories", action: () => openExternal("https://github.com/keshav-06") },
    { command: "open work github", label: "Open work GitHub", description: "Visit github.com/keshav-06-hpe", keywords: "hpe company professional repositories", action: () => openExternal("https://github.com/keshav-06-hpe") },
    { command: "theme dark", label: "Switch to dark mode", description: "Use the dark color theme", keywords: "dark theme appearance", action: () => setTheme("dark") },
    { command: "theme light", label: "Switch to light mode", description: "Use the light color theme", keywords: "light theme appearance", action: () => setTheme("light") },
    { command: "theme toggle", label: "Toggle color theme", description: "Switch between dark and light", keywords: "theme dark light appearance", action: toggleTheme },
    { command: "help", label: "Show all commands", description: "Browse everything you can ask the portfolio to do", keywords: "commands help guide", action: showHelp }
  ];

  const history = [];
  let historyPosition = 0;
  let activeIndex = -1;
  let visibleCommands = [];
  let lastLauncher = launcher;

  function normalize(value) {
    return value.trim().toLowerCase()
      .replace(/^keshav\s*(?:>|›)?\s*/, "")
      .replace(/:+$/, "")
      .replace(/\s+/g, " ");
  }

  function openPalette(trigger = launcher) {
    lastLauncher = trigger;
    if (mobileNavigation && !mobileNavigation.hidden) {
      mobileNavigation.hidden = true;
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      mobileMenuToggle.setAttribute("aria-label", "Open navigation");
    }
    if (!dialog.open) dialog.showModal();
    input.value = "";
    historyPosition = history.length;
    renderSuggestions("");
    window.requestAnimationFrame(() => input.focus());
  }

  function navigateTo(id) {
    const target = document.getElementById(id);
    if (!target) return;
    window.history.replaceState(null, "", `#${id}`);
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("scroll"));
    });
  }

  function selectTab(id) {
    const tab = document.getElementById(id);
    if (tab) tab.click();
  }

  function showExperience() {
    selectTab("experience-tab");
    navigateTo("experience");
  }

  function showEducation() {
    selectTab("education-tab");
    navigateTo("experience");
  }

  function showProjects(filter) {
    const button = document.querySelector(`[data-filter="${filter}"]`);
    if (button) button.click();
    navigateTo("work");
  }

  function openExternal(url, download) {
    const link = document.createElement("a");
    link.href = url;
    link.target = url.startsWith("http") ? "_blank" : "_self";
    if (link.target === "_blank") link.rel = "noopener noreferrer";
    if (download) link.download = download;
    document.body.append(link);
    link.click();
    link.remove();
  }

  function currentTheme() {
    return document.documentElement.dataset.theme || "dark";
  }

  function setTheme(theme) {
    if (currentTheme() === theme) {
      dialog.close();
      return;
    }
    document.querySelector(".theme-toggle")?.click();
    dialog.close();
  }

  function toggleTheme() {
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  }

  function showHelp() {
    input.value = "";
    status.textContent = `${commands.length} commands available. Select an action or start typing.`;
    renderSuggestions("", true);
  }

  function renderSuggestions(query, showAll = false) {
    const normalized = normalize(query);
    const tokens = normalized.split(" ").filter(Boolean);
    visibleCommands = commands.filter((item) => {
      if (!tokens.length || showAll) return true;
      const searchable = `${item.command} ${item.label.toLowerCase()} ${item.description.toLowerCase()} ${item.keywords}`;
      return tokens.every(token => searchable.includes(token));
    });
    if (normalized === "help") visibleCommands = commands;
    if (!showAll && !tokens.length) visibleCommands = commands.slice(0, 8);

    activeIndex = visibleCommands.length ? 0 : -1;
    suggestions.replaceChildren();
    visibleCommands.forEach((item, index) => {
      const option = document.createElement("li");
      option.id = `command-option-${index}`;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(index === activeIndex));
      option.className = "command-option";
      const commandText = document.createElement("span");
      commandText.className = "command-option-name";
      commandText.textContent = `keshav ${item.command}`;
      const description = document.createElement("span");
      description.className = "command-option-description";
      description.textContent = item.description;
      const enter = document.createElement("kbd");
      enter.className = "command-option-enter";
      enter.textContent = "↵";
      option.append(commandText, description, enter);
      option.addEventListener("mousedown", event => event.preventDefault());
      option.addEventListener("click", () => execute(item));
      suggestions.append(option);
    });

    input.setAttribute("aria-expanded", String(visibleCommands.length > 0));
    if (activeIndex >= 0) input.setAttribute("aria-activedescendant", `command-option-${activeIndex}`);
    else input.removeAttribute("aria-activedescendant");
    if (normalized && !visibleCommands.length) status.textContent = 'No matching command. Try "keshav help".';
    else if (normalized === "help") status.textContent = `${commands.length} commands available. Select an action or start typing.`;
    else if (normalized) status.textContent = `${visibleCommands.length} matching ${visibleCommands.length === 1 ? "command" : "commands"}.`;
    else if (!normalized && !showAll) status.textContent = "Popular commands";
  }

  function updateActiveOption(nextIndex) {
    if (!visibleCommands.length) return;
    activeIndex = (nextIndex + visibleCommands.length) % visibleCommands.length;
    suggestions.querySelectorAll('[role="option"]').forEach((option, index) => {
      const selected = index === activeIndex;
      option.setAttribute("aria-selected", String(selected));
      if (selected) input.setAttribute("aria-activedescendant", option.id);
    });
    suggestions.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }

  function execute(item) {
    const value = `keshav ${item.command}`;
    if (history.at(-1) !== value) history.push(value);
    historyPosition = history.length;
    if (item.command === "help") {
      item.action();
      return;
    }
    dialog.close();
    item.action();
  }

  document.querySelectorAll("[data-open-command]").forEach(trigger => {
    trigger.addEventListener("click", () => openPalette(trigger));
  });
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    (lastLauncher?.isConnected && !lastLauncher.closest("[hidden]") ? lastLauncher : launcher).focus();
  });
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });

  input.addEventListener("input", () => renderSuggestions(input.value));
  input.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    } else if ((event.metaKey || event.ctrlKey) && event.key === "ArrowUp" && history.length) {
      event.preventDefault();
      historyPosition = Math.max(0, historyPosition - 1);
      input.value = history[historyPosition].replace(/^keshav /, "");
      renderSuggestions(input.value);
    } else if ((event.metaKey || event.ctrlKey) && event.key === "ArrowDown" && historyPosition < history.length - 1) {
      event.preventDefault();
      historyPosition += 1;
      input.value = history[historyPosition].replace(/^keshav /, "");
      renderSuggestions(input.value);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      updateActiveOption(activeIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      updateActiveOption(activeIndex - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const normalized = normalize(input.value);
      const exact = commands.find(item => item.command === normalized);
      const selected = exact || (visibleCommands.length ? visibleCommands[activeIndex] : null);
      if (selected) execute(selected);
      else status.textContent = 'No matching command. Try "keshav help".';
    }
  });

  document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else openPalette(launcher);
      return;
    }
    const editing = event.target instanceof HTMLElement && (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName));
    if (event.key === "/" && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      if (!dialog.open) openPalette(launcher);
    }
  });

  if (window.lucide) window.lucide.createIcons();
  const isMac = /Mac|iPhone|iPad/i.test(navigator.platform);
  const shortcut = isMac ? "⌘ K" : "Ctrl K";
  document.querySelectorAll(".command-shortcut, .command-menu-item kbd").forEach(key => {
    key.textContent = shortcut;
  });
  launcher.title = `Open command palette (${shortcut})`;
  launcher.hidden = false;
  document.querySelectorAll(".command-menu-item").forEach(item => item.hidden = false);
})();