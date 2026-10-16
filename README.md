# Keshav Varshney - Portfolio

A responsive, static portfolio built from the supplied resume and LinkedIn
profile. No framework, package installation, build step, or backend is required.

## Preview

Open [index.html](index.html) in a browser. The site also works on any static
web host, including GitHub Pages, Netlify, and Cloudflare Pages.

Publish `index.html`, `styles.css`, `theme.js`, `script.js`, `scene.js`, `terminal.js`, and the `assets` directory
together, preserving their relative paths. No build command is needed.

## Edit

- Content, project categories, and links: [index.html](index.html).
- Colors, typography, and responsive layouts: [styles.css](styles.css).
- Dark/light preference and header toggle: [theme.js](theme.js).
- Navigation, project filters, and email copying: [script.js](script.js).
- Interactive infrastructure visualization: [scene.js](scene.js).
- Separate UI/terminal mode and allowlisted portfolio commands: [terminal.js](terminal.js).
- Resume source: [resume.tex](resume.tex), preserved unchanged.
- Downloadable resume: [assets/resume.pdf](assets/resume.pdf).

The PDF was compiled from the original LaTeX source. To refresh it with an
installed LaTeX distribution, run:

```sh
build_dir=$(mktemp -d)
pdflatex -interaction=nonstopmode -halt-on-error -output-directory="$build_dir" resume.tex
pdflatex -interaction=nonstopmode -halt-on-error -output-directory="$build_dir" resume.tex
cp "$build_dir/resume.pdf" assets/resume.pdf
```

## Content Sources

The original resume supplies the engineering projects and impact metrics.
[Keshav's LinkedIn profile](https://www.linkedin.com/in/keshav062/) supplies the
distributed-systems focus, mentoring and writing interests, 2026 HPE-CTY
mentorship, and certification dates. The profile's Featured section links to
the public [RRS repository](https://github.com/Cray-HPE/cray-rrs).

CKAD and Microsoft Security, Compliance and Identity Fundamentals are featured
on the site, with a link to the complete LinkedIn credential list. The original
LaTeX resume and its generated PDF have not been changed by these additions.

The three college projects are grounded in their public repositories:

- [Let's Fit](https://github.com/keshav-06/Let-us-fit): the README supplies the
  wearable architecture, hardware, and software stack.
- [Assisted Vision](https://github.com/keshav-06/Assisted-Vision): the README and
  package manifest supply the voice, quiz, game, and object-detection features,
  and React/TensorFlow.js stack.
- [XSS-Detection](https://github.com/keshav-06/XSS-Detection): the extension
  manifest, package manifest, and Express server establish the browser-extension
  and local Python-scanner architecture. It is presented as an educational
  prototype; no scans were run and no production-security guarantees are made.

The College projects filter selects these three entries from the six total
projects. College project visuals are original conceptual diagrams; no images
or screenshots from the GitHub repositories are used.

## Assets and Behavior

- The sun/moon button switches the entire page and 3D scene between dark and
  light themes. The first visit follows the system color preference; an explicit
  choice is saved in local storage. Theme initialization runs before styles load
  to avoid a wrong-theme flash. Switching still works when storage is unavailable.
- The terminal is a separate, shareable `?view=terminal` interface. A UI/Terminal
  switch changes views without a server; browser back/forward also restores mode.
  Its read-only commands include `help`, `whoami`, `pwd`, `ls`, `cat about`,
  `cat experience`, `cat education`, `cat skills`, `cat projects`,
  `cat projects/<name>`, `cat creative`, `show <section>`, `open <destination>`,
  `theme <mode>`, `clear`, and `ui`. Up/Down navigate history and Tab completes
  known commands. Input is never evaluated or sent to a system shell.
- Creative Space features Keshav's novel, *Lies I Perpetuated, In Silence*.
  The title, author, Kindle format, language, and publication date come from its
  [Amazon listing](https://www.amazon.in/dp/B0GX2TJ492). The synopsis is a short
  paraphrase of that listing. The real cover is bundled locally in
  [assets/lies-i-perpetuated-cover.jpg](assets/lies-i-perpetuated-cover.jpg).
  The pen name KayVee and the short tagline are taken from the supplied cover.
  Pricing, ratings, and availability are left to Amazon rather than hard-coded.
- Keshav's portrait is bundled locally in [assets/keshav-profile.jpg](assets/keshav-profile.jpg)
  from his shared LinkedIn profile. No portrait or project content from the
  reference portfolios is used.
- Desktop social links, the direct Skills navigation link, the hero resume
  download, and visible public-repository links provide quick access without
  opening project detail panels. The social rail is hidden on smaller screens;
  equivalent links remain in the header, hero, projects, and footer.
- The hero is a full-bleed Three.js study of compute, storage, and network
  layers, not a representation of a specific production cluster. Layer
  selection, pointer movement, and motion controls are available. Rendering
  pauses offscreen and in background tabs, and respects reduced motion.
- [Three.js](https://threejs.org/) v0.160.1 is bundled locally; its license is in
  [assets/three-LICENSE.txt](assets/three-LICENSE.txt).
- The fallback server-room photograph is bundled locally from
  [Unsplash](https://images.unsplash.com/photo-1558494949-ef010cbdcc31).
  It appears when WebGL or the rendering library is unavailable. It is
  illustrative photography, not a photograph of an HPE facility.
- [Lucide](https://lucide.dev/) v0.468.0 is bundled locally; its license is in
  [assets/lucide-LICENSE.txt](assets/lucide-LICENSE.txt).
- [Devicon](https://devicon.dev/) v2.16.0 supplies the locally bundled technology
  logos. Its license is in [assets/devicon-LICENSE.txt](assets/devicon-LICENSE.txt).
- Space Grotesk, DM Sans, and IBM Plex Mono load through
  Google Fonts, with system fallbacks if unavailable. The rest of the site runs
  without external requests.
- The HPE and college project illustrations are conceptual diagrams, not
  production dashboard screenshots. All professional impact figures come
  from the resume.
- The dark developer-portfolio design uses a personal introduction, technology
  grid, and keyboard-accessible Experience/Education tabs. The role text types
  once, then remains still; reduced-motion mode skips the typing effect.
- Project details and the complete toolbox use native HTML disclosure controls. Core content and links
  remain available without JavaScript; filters, navigation enhancements,
  experience tabs, scroll animations, reading progress, the Bengaluru clock, and email copying
  use JavaScript.
- Email links open the visitor's mail application. Clipboard copying depends
  on browser permission and a secure context; an inline fallback is provided.
- Reduced-motion preferences, keyboard focus, skip navigation, and screen
  reader announcements are supported.

Review the content and internal-project metrics before publishing. The site is
not automatically deployed and does not include analytics or a contact backend.