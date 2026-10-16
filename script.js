"use strict";

if (window.lucide) {
  window.lucide.createIcons();
}

document.querySelector("#year").textContent = new Date().getFullYear();

const typedRole = document.querySelector("#typed-role");
if (typedRole && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const roleText = typedRole.textContent;
  const roleLine = typedRole.closest(".role-line");
  roleLine.setAttribute("aria-label", roleText);
  typedRole.setAttribute("aria-hidden", "true");
  typedRole.textContent = "";
  roleLine.classList.add("is-typing");
  let characterCount = 0;
  const typingTimer = window.setInterval(() => {
    characterCount += 1;
    typedRole.textContent = roleText.slice(0, characterCount);
    if (characterCount >= roleText.length) {
      window.clearInterval(typingTimer);
      roleLine.classList.remove("is-typing");
      roleLine.removeAttribute("aria-label");
      typedRole.removeAttribute("aria-hidden");
    }
  }, 45);
}

const localTime = document.querySelector("#local-time");
const timeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
function updateLocalTime() {
  const now = new Date();
  localTime.textContent = `${timeFormat.format(now)} IST`;
  localTime.dateTime = now.toISOString();
}
updateLocalTime();
window.setInterval(updateLocalTime, 60000);

const navigationTargets = [...document.querySelectorAll(".desktop-nav a")].map(link => ({ link, target: document.querySelector(link.hash) }));
let scrollFrame = 0;
function updateProgress() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty("--scroll-progress", String(distance > 0 ? window.scrollY / distance : 0));
  const atPageEnd = distance > 0 && window.scrollY >= distance - 2;
  const readingLine = atPageEnd ? window.innerHeight : Math.max(100, window.innerHeight * .25);
  const activeTarget = navigationTargets
    .map(entry => ({ ...entry, top: entry.target.getBoundingClientRect().top }))
    .filter(entry => entry.top <= readingLine)
    .sort((first, second) => second.top - first.top)[0];
  navigationTargets.forEach(({ link }) => {
    if (link === activeTarget?.link) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  scrollFrame = 0;
}
window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateProgress);
}, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");

function closeMenu() {
  mobileNav.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  mobileNav.hidden = isOpen;
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
});

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileNav.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!mobileNav.hidden && !event.target.closest(".site-header")) {
    closeMenu();
  }
});

window.matchMedia("(min-width: 561px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const filters = document.querySelectorAll("[data-filter]");
const projects = document.querySelectorAll("[data-category]");
const filterStatus = document.querySelector("#filter-status");

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    let visibleCount = 0;

    filters.forEach((filter) => {
      const isActive = filter === button;
      filter.classList.toggle("is-active", isActive);
      filter.setAttribute("aria-pressed", String(isActive));
    });

    projects.forEach((project) => {
      const isVisible = category === "all" || project.dataset.category.split(" ").includes(category);
      project.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
        project.classList.remove("is-pending");
      }
    });

    filterStatus.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "project" : "projects"}.`;
    updateProgress();
  });
});

document.addEventListener("toggle", updateProgress, true);

const journeyTabs = [...document.querySelectorAll("button[data-journey-tab]")];
function selectJourneyTab(selectedTab) {
  journeyTabs.forEach((tab) => {
    const selected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
  });
  updateProgress();
}
journeyTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectJourneyTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % journeyTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + journeyTabs.length) % journeyTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = journeyTabs.length - 1;
    else return;
    event.preventDefault();
    selectJourneyTab(journeyTabs[nextIndex]);
    journeyTabs[nextIndex].focus();
  });
});
if (journeyTabs.length) {
  document.querySelector(".journey-tabs").hidden = false;
  selectJourneyTab(journeyTabs[0]);
}

const copyButton = document.querySelector(".copy-email");
const copyStatus = document.querySelector(".copy-status");
let copyResetTimer;

copyButton.addEventListener("click", async () => {
  window.clearTimeout(copyResetTimer);
  try {
    await navigator.clipboard.writeText("k.varshney062@gmail.com");
    copyStatus.textContent = "Email address copied.";
    copyButton.setAttribute("aria-label", "Email address copied");
    copyButton.title = "Email address copied";
  } catch {
    copyStatus.textContent = "Select the email address to copy it, or click to send a message.";
  }
  copyResetTimer = window.setTimeout(() => {
    copyStatus.textContent = "";
    copyButton.setAttribute("aria-label", "Copy email address");
    copyButton.title = "Copy email address";
  }, 5000);
});

if ("IntersectionObserver" in window) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("is-pending");
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07 });

    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("is-pending");
      revealObserver.observe(element);
    });
  }

}