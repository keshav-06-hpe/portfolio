"use strict";

(() => {
  const body = document.body;
  const siteHeader = document.querySelector("#site-header");
  const socialRail = document.querySelector(".social-rail");
  const portfolio = document.querySelector("#main");
  const siteFooter = document.querySelector("#site-footer");
  const terminal = document.querySelector("#terminal-view");
  const output = document.querySelector("#terminal-output");
  const form = document.querySelector("#terminal-form");
  const input = document.querySelector("#terminal-input");
  const skipLink = document.querySelector(".skip-link");
  const mobileNavigation = document.querySelector("#mobile-nav");
  const mobileMenuToggle = document.querySelector(".menu-toggle");
  const viewToggles = document.querySelectorAll("[data-view-toggle]");
  if (!terminal || !output || !form || !input) return;

  const commandHistory = [];
  let historyIndex = 0;
  const sectionIds = new Set(["home", "about", "skills", "experience", "work", "creative", "contact"]);
  const projectSlugs = new Map([
    ["atlas", "ATLAS"],
    ["rack-resiliency-service", "Rack Resiliency Service"],
    ["postgresql-operator", "A Vulnerability-Free System"],
    ["lets-fit", "Let's Fit"],
    ["assisted-vision", "Assisted Vision"],
    ["xss-detection", "XSS-Detection"]
  ]);
  const validCommands = [
    "help", "whoami", "pwd", "ls", "ls projects", "ls links", "clear", "ui", "exit", "quit",
    "show about", "show experience", "show education", "show skills", "show projects", "show college projects", "show creative", "show contact",
    "cat about", "cat experience", "cat education", "cat skills", "cat projects", "cat creative",
    ...[...projectSlugs.keys()].map(slug => `cat projects/${slug}`),
    "open resume", "open github", "open github personal", "open github work", "open linkedin", "open book", "open instagram",
    "theme", "theme dark", "theme light", "theme toggle"
  ];

  function setMode(mode, updateHistory = true) {
    const terminalMode = mode === "terminal";
    body.dataset.view = terminalMode ? "terminal" : "ui";
    siteHeader.hidden = terminalMode;
    socialRail.hidden = terminalMode;
    portfolio.hidden = terminalMode;
    siteFooter.hidden = terminalMode;
    terminal.hidden = !terminalMode;
    skipLink.href = terminalMode ? "#terminal-view" : "#main";
    viewToggles.forEach(toggle => {
      const inTerminal = toggle.closest(".terminal-topbar") !== null;
      toggle.hidden = terminalMode ? !inTerminal : inTerminal;
      toggle.setAttribute("aria-label", terminalMode ? "Return to visual portfolio" : "Switch to terminal interface");
    });
    if (terminalMode && mobileNavigation && !mobileNavigation.hidden) {
      mobileNavigation.hidden = true;
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      mobileMenuToggle.setAttribute("aria-label", "Open navigation");
    }
    document.title = terminalMode ? "Keshav Varshney | Portfolio Terminal" : "Keshav Varshney | Software Engineer";

    if (updateHistory) {
      const url = new URL(window.location.href);
      if (terminalMode) url.searchParams.set("view", "terminal");
      else url.searchParams.delete("view");
      window.history.pushState({ view: terminalMode ? "terminal" : "ui" }, "", url);
    }

    if (terminalMode) {
      if (!output.dataset.booted) bootTerminal();
      window.requestAnimationFrame(() => input.focus());
    } else if (window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" });
    }
  }

  function elementText(element) {
    if (!element) return "";
    const copy = element.cloneNode(true);
    copy.querySelectorAll("br").forEach(lineBreak => lineBreak.replaceWith(" "));
    copy.querySelectorAll("svg, [aria-hidden='true']").forEach(icon => icon.remove());
    return copy.textContent.replace(/\s+/g, " ").trim();
  }

  function emphasizedLine(text) {
    const heading = document.createElement("strong");
    heading.textContent = text;
    return heading;
  }

  function printLines(lines, type = "output") {
    const block = document.createElement("pre");
    block.className = `terminal-output-block terminal-${type}`;
    const textLines = Array.isArray(lines) ? lines : [String(lines)];
    textLines.forEach((line, index) => {
      block.append(line instanceof Node ? line : document.createTextNode(String(line)));
      if (index < textLines.length - 1) block.append(document.createTextNode("\n"));
    });
    output.append(block);
    output.scrollTop = output.scrollHeight;
    return block;
  }

  function bootTerminal() {
    output.dataset.booted = "true";
    printLines([
      "KESHAV VARSHNEY  /  PORTFOLIO TERMINAL",
      "Systems engineer at Hewlett Packard Enterprise · Bengaluru, India",
      "",
      "This is a read-only portfolio explorer, not a system shell.",
      "Type 'help' to see available commands."
    ], "welcome");
  }

  function normalize(value) {
    return value.trim().toLowerCase()
      .replace(/^keshav@portfolio(?::~)?\s*\$?\s*/, "")
      .replace(/^keshav\s*(?:>|›)?\s*/, "")
      .replace(/\s+/g, " ");
  }

  function timelineOutput(panelSelector) {
    const entries = [...document.querySelectorAll(`${panelSelector} .timeline-item`)];
    return entries.flatMap((entry, index) => {
      const date = elementText(entry.querySelector(".timeline-top .eyebrow"));
      const title = elementText(entry.querySelector("h3"));
      const organization = elementText(entry.querySelector(".timeline-company"));
      const description = [...entry.querySelectorAll(":scope > p:not(.timeline-company):not(.academic-result)")].map(elementText);
      const bullets = [...entry.querySelectorAll(":scope > ul > li")].map(item => `  • ${elementText(item)}`);
      const grade = elementText(entry.querySelector(".academic-result"));
      return [
        panelSelector === "#experience-panel" ? emphasizedLine(`${date}  ${title}`) : `${date}  ${title}`,
        organization,
        ...description,
        ...(grade ? [grade] : []),
        ...bullets,
        ...(index < entries.length - 1 ? [""] : [])
      ];
    });
  }

  function projectOutput(project) {
    const title = elementText(project.querySelector("h3"));
    const category = elementText(project.querySelector(".project-card-top .eyebrow, .project-topline .eyebrow"));
    const overview = elementText(project.querySelector(".project-card-content > p, .project-description"));
    const technologies = [...project.querySelectorAll(".project-card-content .tag-list span, .featured-copy .tag-list span")].map(elementText);
    const details = [...project.querySelectorAll(".details-body > p")].map(elementText);
    const impact = project.querySelector(".featured-impact");
    const metric = project.querySelector(".card-metric");
    const repository = project.querySelector(".project-code-link");
    const lines = [emphasizedLine(`${title}  /  ${category}`), overview];
    if (impact) {
      const values = [...impact.querySelectorAll(":scope > strong")].map(elementText);
      const descriptions = [...impact.querySelectorAll(":scope > span:not(.impact-divider)")].map(elementText);
      const highlights = values.map((value, index) => `${value} ${descriptions[index] || ""}`.trim());
      lines.push(`Impact: ${highlights.join("; ")}`);
    } else if (metric) {
      lines.push(`Impact: ${elementText(metric.querySelector("strong"))} ${elementText(metric.querySelector("span"))}`);
    }
    if (project.classList.contains("featured-project")) {
      lines.push("Highlights: 50+ pre-upgrade checks; search across 66+ documents and 3,000+ JIRA tickets; 14 MCP tools; deployed to 3+ teams.");
    }
    if (technologies.length) lines.push(`Stack: ${technologies.join(", ")}`);
    if (details.length) lines.push(...details);
    if (repository) lines.push(`Code: ${repository.href}`);
    else if (project.classList.contains("featured-project")) lines.push("Internal HPE project; no public source link.");
    return lines;
  }

  function sectionOutput(name) {
    switch (name) {
      case "about": {
        const lead = elementText(document.querySelector(".about-lead"));
        const paragraphs = [...document.querySelectorAll(".about-copy > p")].map(elementText).filter(Boolean);
        return ["ABOUT KESHAV", lead, ...paragraphs];
      }
      case "experience":
        return ["EXPERIENCE", ...timelineOutput("#experience-panel")];
      case "education":
        return ["EDUCATION", ...timelineOutput("#education-panel")];
      case "skills": {
        const names = [...document.querySelectorAll(".tech-tile span")].map(elementText);
        const groups = [...document.querySelectorAll(".stack-details .skill-row")].map(row => `${elementText(row.querySelector(".eyebrow"))}: ${elementText(row.querySelector("p"))}`);
        return ["SKILLS & TOOLBOX", `Featured: ${names.join(" · ")}`, ...groups];
      }
      case "projects": {
        const projects = [...document.querySelectorAll("#work .project")];
        return ["SELECTED PROJECTS", ...projects.flatMap((project, index) => [...projectOutput(project), ...(index < projects.length - 1 ? [""] : [])])];
      }
      case "college projects": {
        const projects = [...document.querySelectorAll("#work .college-project")];
        return ["COLLEGE PROJECTS", ...projects.flatMap((project, index) => [...projectOutput(project), ...(index < projects.length - 1 ? [""] : [])])];
      }
      case "creative": {
        const book = document.querySelector(".book-copy");
        const bookDetails = [...book.querySelectorAll(".book-details > div")].map(item => `${elementText(item.querySelector("dt"))}: ${elementText(item.querySelector("dd"))}`);
        return ["CREATIVE SPACE", elementText(book.querySelector(".book-category")), elementText(book.querySelector("h3")), elementText(book.querySelector(".book-intro")), elementText(book.querySelector(".book-synopsis")), ...bookDetails, `Amazon: ${book.querySelector(".book-link").href}`, `Instagram: ${book.querySelector(".book-instagram").href}`];
      }
      case "contact":
        return ["CONTACT", "Email: k.varshney062@gmail.com", "LinkedIn: https://www.linkedin.com/in/keshav062", "Personal GitHub: https://github.com/keshav-06", "Work GitHub: https://github.com/keshav-06-hpe"];
      default:
        return null;
    }
  }

  function runCat(path) {
    const normalized = path.replace(/^\.\//, "").replace(/\/$/, "");
    if (normalized.startsWith("projects/")) {
      const slug = normalized.slice("projects/".length);
      const title = projectSlugs.get(slug);
      if (!title) return [`cat: ${normalized}: no such project. Run 'ls projects/' to list projects.`];
      const project = [...document.querySelectorAll("#work .project")].find(item => elementText(item.querySelector("h3")) === title);
      return project ? projectOutput(project) : [`cat: ${normalized}: project content is unavailable.`];
    }
    if (sectionIds.has(normalized) || normalized === "education" || normalized === "projects" || normalized === "college-projects") {
      return sectionOutput(normalized.replace("college-projects", "college projects"));
    }
    return [`cat: ${normalized}: no such file. Run 'ls' to list available portfolio sections.`];
  }

  function listFiles(path = "") {
    if (!path) return ["about/  experience/  education/  skills/  projects/  creative/  links/  resume.pdf"];
    if (path === "projects" || path === "projects/") return [...projectSlugs.keys()];
    if (path === "links" || path === "links/") return ["github-personal  github-work  linkedin  email"];
    return [`ls: ${path}: no such portfolio directory.`];
  }

  function openLink(target) {
    const destinations = {
      resume: { url: "assets/resume.pdf", download: "Keshav-Varshney-Resume.pdf", label: "Resume PDF" },
      github: { url: "https://github.com/keshav-06", label: "Personal GitHub" },
      "github personal": { url: "https://github.com/keshav-06", label: "Personal GitHub" },
      "github work": { url: "https://github.com/keshav-06-hpe", label: "Work GitHub" },
      linkedin: { url: "https://www.linkedin.com/in/keshav062", label: "LinkedIn" },
      book: { url: "https://www.amazon.in/dp/B0GX2TJ492", label: "Lies I Perpetuated, In Silence on Amazon" },
      instagram: { url: "https://www.instagram.com/kayvee.writes?cplk=ZWl4bHMxMjVzYWs2", label: "KayVee Writes on Instagram" }
    };
    const destination = destinations[target];
    if (!destination) return [`open: ${target}: destination not found. Try 'open resume', 'open github work', 'open linkedin', 'open book', or 'open instagram'.`];
    const link = document.createElement("a");
    link.href = destination.url;
    link.textContent = destination.url.startsWith("http") ? destination.url : destination.label;
    if (destination.download) link.download = destination.download;
    else {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    const line = document.createElement("div");
    line.className = "terminal-output-block terminal-link-output";
    const label = document.createElement("span");
    label.textContent = `Opening ${destination.label}: `;
    line.append(label, link);
    output.append(line);
    link.click();
    output.scrollTop = output.scrollHeight;
    return null;
  }

  function runTheme(value) {
    const action = value || "";
    const current = document.documentElement.dataset.theme || "dark";
    const next = action === "toggle" ? current === "dark" ? "light" : "dark" : action;
    if (next !== "dark" && next !== "light") return [`Current theme: ${current}. Usage: theme dark|light|toggle`];
    if (next !== current) document.querySelector(".theme-toggle")?.click();
    return [`Theme set to ${next}.`];
  }

  function helpOutput() {
    return [
      "AVAILABLE COMMANDS",
      "  help                              Show this command reference",
      "  whoami                            About Keshav",
      "  pwd                               Show this virtual path",
      "  ls [projects|links]               List portfolio sections or projects",
      "  cat about                         Read the about section",
      "  cat experience                    Read career history",
      "  cat education                     Read education history",
      "  cat skills                        Read the complete technology stack",
      "  cat projects                      Read all six project profiles",
      "  cat projects/<name>               Read one project in detail",
      "  cat creative                      Read about the book",
      "  show <section>                    Print section details in the terminal",
      "  open resume|github [personal|work]|linkedin|book|instagram  Open a verified destination",
      "  theme dark|light|toggle           Change the site appearance",
      "  clear                             Clear terminal output",
      "  ui, exit, or quit                 Return to the visual portfolio",
      "",
      "Tip: press Tab to complete a command; use Up/Down for command history."
    ];
  }

  function routeToSection(name) {
    const section = name.replace("college projects", "work").replace("projects", "work");
    const aliases = { education: "experience", creative: "creative", skills: "skills", contact: "contact", about: "about" };
    const id = aliases[section] || section;
    if (!sectionIds.has(id)) return [`show: ${name}: section not found. Run 'help' for available sections.`];
    if (id === "experience") document.querySelector("#experience-tab")?.click();
    if (id === "work") {
      const filter = name === "college projects" ? "college" : "all";
      document.querySelector(`[data-filter="${filter}"]`)?.click();
    }
    setMode("ui");
    window.history.replaceState(null, "", `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    return null;
  }

  function dispatch(rawCommand) {
    const command = rawCommand.trim();
    const normalized = command.toLowerCase().replace(/^keshav@portfolio(?::~)?\s*\$?\s*/, "").replace(/^keshav\s*(?:>|›)?\s*/, "").replace(/\s+/g, " ");
    if (!normalized) return null;
    if (normalized === "clear") {
      output.replaceChildren();
      return null;
    }
    if (["ui", "exit", "quit"].includes(normalized)) {
      setMode("ui");
      return null;
    }
    if (normalized === "help") return helpOutput();
    if (normalized === "whoami") return ["Keshav Varshney", "Systems Software Engineer @ Hewlett Packard Enterprise", "Distributed systems · Cloud infrastructure · Reliability engineering", "Bengaluru, India", "Book author: Lies I Perpetuated, In Silence (writing as KayVee)"];
    if (normalized === "pwd") return ["/home/keshav/portfolio"];
    if (normalized === "ls") return listFiles();
    if (normalized.startsWith("ls ")) return listFiles(normalized.slice(3).trim());
    if (normalized === "theme" || normalized.startsWith("theme ")) return runTheme(normalized.slice(5).trim());
    if (normalized === "open" || normalized.startsWith("open ")) return openLink(normalized.slice(5).trim());
    if (normalized.startsWith("cat ")) return runCat(normalized.slice(4).trim());
    if (normalized.startsWith("show ")) {
      const section = normalized.slice(5).trim();
      const content = sectionOutput(section);
      if (!content) return routeToSection(section);
      if (section === "education" || section === "experience") document.querySelector(`#${section === "education" ? "education" : "experience"}-tab`)?.click();
      if (section === "projects" || section === "college projects") document.querySelector(`[data-filter="${section === "college projects" ? "college" : "all"}"]`)?.click();
      return content;
    }
    return [`keshav: command not found: ${command}`, "This is a read-only portfolio terminal, not a system shell.", "Run 'help' to see supported commands."];
  }

  function submit(command) {
    const value = command.trim();
    if (!value) return;
    const prompt = document.createElement("div");
    prompt.className = "terminal-history-line";
    const label = document.createElement("span");
    label.className = "terminal-history-prompt";
    label.textContent = "keshav@portfolio:~$";
    const entered = document.createElement("span");
    entered.className = "terminal-history-command";
    entered.textContent = value;
    prompt.append(label, entered);
    output.append(prompt);
    if (commandHistory.at(-1) !== value) commandHistory.push(value);
    historyIndex = commandHistory.length;
    const result = dispatch(value);
    if (result) {
      const firstLine = result[0] instanceof Node ? result[0].textContent : result[0];
      printLines(result, firstLine?.startsWith("keshav:") ? "error" : "result");
    }
    input.value = "";
    output.scrollTop = output.scrollHeight;
    input.focus();
  }

  function findCompletions(value) {
    const normalized = value.trim().toLowerCase().replace(/^keshav@portfolio(?::~)?\s*\$?\s*/, "").replace(/^keshav\s*(?:>|›)?\s*/, "");
    if (!normalized) return ["help", "whoami", "ls", "cat ", "show ", "open ", "theme ", "clear", "ui"];
    if (normalized.startsWith("cat projects/")) {
      const prefix = normalized.slice("cat projects/".length);
      return [...projectSlugs.keys()].filter(slug => slug.startsWith(prefix)).map(slug => `cat projects/${slug}`);
    }
    return validCommands.filter(command => command.startsWith(normalized));
  }

  function completeInput() {
    const matches = findCompletions(input.value);
    if (matches.length === 1) {
      input.value = matches[0];
      return;
    }
    if (matches.length > 1) {
      const current = normalize(input.value);
      const commonPrefix = matches.slice(1).reduce((prefix, match) => {
        let length = 0;
        while (length < prefix.length && prefix[length] === match[length]) length += 1;
        return prefix.slice(0, length);
      }, matches[0]);
      if (commonPrefix.length > current.length) {
        input.value = commonPrefix;
        return;
      }
      printLines(matches.map(match => `  ${match}`), "hint");
      output.scrollTop = output.scrollHeight;
    }
  }

  function bootTerminal() {
    output.replaceChildren();
    output.dataset.booted = "true";
    commandHistory.length = 0;
    historyIndex = 0;
    input.value = "";
    const kayvee = [
      "#   #   ###    #   #   #   #   #####   #####",
      "#  #   #   #    # #    #   #   #       #    ",
      "###    #####     #     #   #   ####    #### ",
      "#  #   #   #     #      # #    #       #    ",
      "#   #   #   #     #       #     #####   #####"
    ];
    printLines(kayvee, "kayvee-art");
    printLines([
      "KAYVEE  /  PORTFOLIO TERMINAL",
      "Systems Software Engineer @ Hewlett Packard Enterprise · Bengaluru, India",
      "",
      "Read-only portfolio explorer. No system commands are executed.",
      "Type 'help' to inspect the portfolio."
    ], "welcome");
  }

  function updateView(mode, updateUrl = true) {
    const terminalMode = mode === "terminal";
    document.body.dataset.view = terminalMode ? "terminal" : "ui";
    document.querySelector("#site-header").hidden = terminalMode;
    document.querySelector(".social-rail").hidden = terminalMode;
    document.querySelector("#main").hidden = terminalMode;
    document.querySelector("#site-footer").hidden = terminalMode;
    terminal.hidden = !terminalMode;
    skipLink.href = terminalMode ? "#terminal-view" : "#main";
    if (terminalMode && mobileNavigation && !mobileNavigation.hidden) {
      mobileNavigation.hidden = true;
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      mobileMenuToggle.setAttribute("aria-label", "Open navigation");
    }
    document.title = terminalMode ? "Keshav Varshney | Portfolio Terminal" : "Keshav Varshney | Software Engineer";
    viewToggles.forEach(toggle => {
      toggle.hidden = terminalMode ? !toggle.closest(".terminal-topbar") : !!toggle.closest(".terminal-topbar");
    });
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (terminalMode) url.searchParams.set("view", "terminal");
      else url.searchParams.delete("view");
      window.history.pushState({ view: terminalMode ? "terminal" : "ui" }, "", url);
    }
    if (terminalMode) {
      bootTerminal();
      window.requestAnimationFrame(() => input.focus());
    } else if (window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" });
    }
  }

  viewToggles.forEach(toggle => toggle.addEventListener("click", () => {
    const nextMode = document.body.dataset.view === "terminal" ? "ui" : "terminal";
    updateView(nextMode);
    if (nextMode === "ui") {
      const returnFocus = window.matchMedia("(max-width: 560px)").matches
        ? mobileMenuToggle
        : document.querySelector(".site-header [data-view-toggle]");
      window.requestAnimationFrame(() => returnFocus?.focus());
    }
  }));
  window.addEventListener("popstate", () => updateView(new URLSearchParams(window.location.search).get("view") === "terminal" ? "terminal" : "ui", false));
  window.addEventListener("keydown", event => {
    const editing = event.target instanceof HTMLElement && (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName));
    if (document.body.dataset.view === "terminal" && event.key === "/" && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      input.focus();
    }
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    submit(input.value);
  });
  input.addEventListener("keydown", event => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyIndex > 0) input.value = commandHistory[--historyIndex];
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex < commandHistory.length - 1) input.value = commandHistory[++historyIndex];
      else {
        historyIndex = commandHistory.length;
        input.value = "";
      }
    } else if (event.key === "Tab") {
      event.preventDefault();
      completeInput();
    }
  });

  if (window.lucide) window.lucide.createIcons();
  viewToggles.forEach(toggle => toggle.hidden = false);
  updateView(new URLSearchParams(window.location.search).get("view") === "terminal" ? "terminal" : "ui", false);
})();
