"use strict";

(() => {
  const widget = document.querySelector(".portfolio-assistant");
  if (!widget) return;
  const panel = widget.querySelector(".pa-panel");
  const launcher = widget.querySelector("#pa-launcher");
  const messages = widget.querySelector("#pa-messages");
  const input = widget.querySelector("#pa-question");

  function text(element) {
    if (!element) return "";
    const copy = element.cloneNode(true);
    copy.querySelectorAll("br").forEach(lineBreak => lineBreak.replaceWith(" "));
    copy.querySelectorAll("svg, [aria-hidden='true']").forEach(icon => icon.remove());
    return copy.textContent.replace(/\s+/g, " ").trim();
  }

  function read(selector) {
    return text(document.querySelector(selector));
  }

  function sourceLink(selector, label) {
    const source = document.querySelector(selector);
    return source ? { label, href: source.getAttribute("href"), download: source.getAttribute("download") } : null;
  }

  const sectionLink = (label, href, tab) => ({ label, href, tab });
  const contactLinks = () => [
    sourceLink(".email-row > a", "Email Keshav"),
    sourceLink('.footer-links a[href*="linkedin.com"]', "LinkedIn")
  ];
  const unavailable = () => ({
    paragraphs: ["I don't have that information in Keshav's portfolio. Please ask him directly."],
    links: contactLinks()
  });

  function projectAnswer(selector) {
    const project = document.querySelector(selector);
    if (!project) return unavailable();
    const impactNode = project.querySelector(".card-metric, .featured-impact");
    const impact = impactNode ? [...impactNode.children].map(text).filter(Boolean).join(" ") : "";
    return {
      paragraphs: [text(project.querySelector("h3")), text(project.querySelector(".project-description, .project-card-content > p")), ...(impact ? [`Impact: ${impact}`] : [])],
      links: [sectionLink("Project details", "#work"), sourceLink(`${selector} .project-code-link`, "Source code")]
    };
  }

  const topics = [
    {
      pattern: /\b(resume|cv|curriculum vitae)\b/,
      answer: () => ({ paragraphs: ["Here is Keshav's resume."], links: [sourceLink(".hero-contact.resume-link", "Download resume (PDF)")] })
    },
    {
      pattern: /\b(contact|email|reach|linkedin|github|connect|hire)\b/,
      answer: () => ({
        paragraphs: [`Email: ${read(".email-row > a")}`],
        links: [...contactLinks(), sourceLink('.footer-links a[href*="github.com/keshav-06"]:not([href*="keshav-06-hpe"])', "Personal GitHub"), sourceLink('.footer-links a[href*="github.com/keshav-06-hpe"]', "Work GitHub")]
      })
    },
    {
      pattern: /\b(location|based|live|living|located|city|bengaluru|bangalore)\b/,
      answer: () => ({ paragraphs: [`Keshav is based in ${read(".about-facts > span:first-child")}.`], links: [sectionLink("About Keshav", "#about")] })
    },
    {
      pattern: /\b(certification|certifications|certified|certificate|credentials|ckad|cncf)\b/,
      answer: () => ({ paragraphs: ["His listed certifications:"], items: [...document.querySelectorAll(".certification")].map(entry => `${text(entry.querySelector("strong"))}. ${text(entry.querySelector("span"))}`), links: [sectionLink("Credentials", "#about")] })
    },
    {
      pattern: /\b(mentor|mentee|mentoring|mentorship|cty)\b/,
      answer: () => ({ paragraphs: [read(".mentor-note > span:last-child")], items: [...document.querySelectorAll(".mentor-year")].map(year => `${text(year.querySelector("strong"))}: ${text(year.querySelector("span"))}`), links: [sourceLink(".mentor-note", "Mentorship on LinkedIn")] })
    },
    { pattern: /\batlas\b/, answer: () => projectAnswer("#atlas") },
    { pattern: /\b(rrs|rack|resiliency)\b/, answer: () => projectAnswer(".resiliency-project") },
    { pattern: /\b(postgres|postgresql|csm|cves?|vulnerabilit\w*)\b/, answer: () => projectAnswer(".postgres-project") },
    { pattern: /\b(assisted vision|object detection)\b/, answer: () => projectAnswer(".vision-project") },
    { pattern: /\b(let s fit|lets fit|fitness|wearable)\b/, answer: () => projectAnswer(".fit-project") },
    { pattern: /\b(xss|cross site scripting)\b/, answer: () => projectAnswer(".xss-project") },
    {
      pattern: /\b(projects?|portfolio|built|building)\b/,
      answer: () => ({ paragraphs: ["Projects featured in his portfolio:"], items: [...document.querySelectorAll("#work .project h3")].map(text), links: [sectionLink("Explore projects", "#work")] })
    },
    {
      pattern: /\b(education|study|studied|university|college|degree|school|vit|cgpa|graduat\w*)\b/,
      answer: () => ({
        paragraphs: ["His education:"],
        items: [...document.querySelectorAll("#education-panel .timeline-item")].map(entry => [text(entry.querySelector("h3")), text(entry.querySelector(".timeline-company")), text(entry.querySelector(".academic-result")), text(entry.querySelector(".timeline-top"))].filter(Boolean).join(" - ")),
        links: [sectionLink("Education", "#experience", "education")]
      })
    },
    {
      pattern: /\b(book|novel|author|writer|writing|kayvee|instagram|creative|lies|hobbies|hobby)\b/,
      answer: () => ({
        paragraphs: [`Keshav writes as KayVee. His novel is ${read("#book-title")}.`, read(".book-synopsis")],
        links: [sectionLink("Creative Space", "#creative"), sourceLink(".book-link", "View on Amazon"), sourceLink(".book-instagram", "Writer's Instagram")]
      })
    },
    {
      pattern: /\b(skills?|technolog\w*|stack|languages?|python|typescript|javascript|kubernetes|docker|helm|ansible|jenkins|mcp|faiss|linux|flask|prometheus|grafana|ceph)\b/,
      answer: () => ({ paragraphs: ["His toolbox includes:"], items: [...document.querySelectorAll(".stack-details .skill-row")].map(row => `${text(row.querySelector(".eyebrow"))}: ${text(row.querySelector("p"))}`), links: [sectionLink("Tech stack", "#skills")] })
    },
    {
      pattern: /\b(experience|career|work|working|job|role|hpe|hewlett|intern\w*|employer|employment|hpc)\b/,
      answer: () => ({
        paragraphs: ["His experience at Hewlett Packard Enterprise:"],
        items: [...document.querySelectorAll("#experience-panel .timeline-item")].map(entry => `${text(entry.querySelector("h3"))} (${text(entry.querySelector(".timeline-top .eyebrow"))}). ${text(entry.querySelector(":scope > p:not(.timeline-company)"))}`),
        links: [sectionLink("Experience", "#experience", "experience")]
      })
    },
    {
      pattern: /^(hi|hello|hey|thanks|thank you)[! .]*$|\b(who is keshav|about (him|you|yourself|keshav)|background|introduce|what (does he|do you) do)\b/,
      answer: () => ({ paragraphs: [read(".about-lead").replace(/^I'm Keshav, /, "Keshav is "), `From his portfolio: "${read(".about-copy > p")}"`], links: [sectionLink("About Keshav", "#about")] })
    }
  ];

  function answerQuestion(question) {
    const normalized = question.normalize("NFKC").toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim();
    if (/\b(who are you|are you (a bot|an ai|keshav)|how do you work)\b/.test(normalized)) {
      return { paragraphs: ["I'm a local FAQ assistant for Keshav's portfolio, not Keshav himself. My answers come from the information on this page, not a generative AI service."] };
    }
    if (/\b(salary|compensation|age|birthday|birth|married|partner|family|phone|mobile number|home address|street address|postal address|residential address|available|availability|relocat\w*|notice period|open to|looking for|visa)\b/.test(normalized)) return unavailable();
    const topic = topics.find(candidate => candidate.pattern.test(normalized));
    return topic ? topic.answer() : {
      paragraphs: ["I couldn't match that to a portfolio topic. I can answer basic questions about Keshav's experience, projects, skills, education, writing, and contact details."],
      links: contactLinks()
    };
  }

  function appendMessage(author, result) {
    const message = document.createElement("div");
    message.className = `pa-message${author === "You" ? " pa-user" : ""}`;
    const name = document.createElement("strong");
    name.className = "pa-author";
    name.textContent = author;
    message.append(name);
    for (const paragraph of result.paragraphs || []) {
      if (!paragraph) continue;
      const content = document.createElement("p");
      content.textContent = paragraph;
      message.append(content);
    }
    if (result.items?.length) {
      const list = document.createElement("ul");
      result.items.forEach(item => {
        const entry = document.createElement("li");
        entry.textContent = item;
        list.append(entry);
      });
      message.append(list);
    }
    const links = (result.links || []).filter(Boolean);
    if (links.length) {
      const group = document.createElement("div");
      group.className = "pa-links";
      links.forEach(destination => {
        const link = document.createElement("a");
        link.textContent = destination.label;
        link.href = destination.href;
        if (destination.download) link.download = destination.download;
        if (destination.tab) link.dataset.tab = destination.tab;
        if (/^https?:/.test(destination.href)) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        group.append(link);
      });
      message.append(group);
    }
    messages.append(message);
    while (messages.children.length > 41) messages.firstElementChild.remove();
    return message;
  }

  function resetConversation() {
    messages.replaceChildren();
    appendMessage("Portfolio assistant", { paragraphs: ["Hi! I'm Keshav's portfolio assistant. What would you like to know about him?"] });
    messages.scrollTop = 0;
    input.value = "";
  }

  function closePanel(restoreFocus = true) {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    if (restoreFocus) launcher.focus({ preventScroll: true });
  }

  function ask(question) {
    const value = question.trim().slice(0, 500);
    if (!value) return;
    appendMessage("You", { paragraphs: [value] });
    const response = appendMessage("Portfolio assistant", answerQuestion(value));
    input.value = "";
    input.focus({ preventScroll: true });
    messages.scrollTop += response.getBoundingClientRect().top - messages.getBoundingClientRect().top - 18;
  }

  launcher.addEventListener("click", () => {
    if (!panel.hidden) return closePanel();
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    input.focus({ preventScroll: true });
  });
  widget.querySelector("#pa-close").addEventListener("click", () => closePanel());
  widget.querySelector("#pa-reset").addEventListener("click", () => {
    resetConversation();
    input.focus({ preventScroll: true });
  });
  widget.querySelector("#pa-form").addEventListener("submit", event => {
    event.preventDefault();
    ask(input.value);
  });
  widget.querySelectorAll("[data-pa-question]").forEach(button => button.addEventListener("click", () => ask(button.dataset.paQuestion)));
  widget.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault();
      event.stopPropagation();
      closePanel();
    }
  });
  messages.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    if (target.id === "work") document.querySelector('[data-filter="all"]')?.click();
    if (link.dataset.tab) document.querySelector(`#${link.dataset.tab}-tab`)?.click();
    closePanel(false);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
  new MutationObserver(() => {
    if (document.body.dataset.view === "terminal") closePanel(false);
  }).observe(document.body, { attributes: true, attributeFilter: ["data-view"] });

  resetConversation();
  widget.hidden = false;
})();