(() => {
  const componentBase = new URL("../components/", document.currentScript.src);
  const projectCardUrl = new URL("../components/project-card.html", document.currentScript.src);
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const componentRequests = new Map();
  let projectCardTemplateRequest;

  function loadComponent(name) {
    if (!componentRequests.has(name)) {
      componentRequests.set(name, fetch(new URL(name, componentBase)).then(response => {
        if (!response.ok) throw new Error(`Could not load shared component "${name}": ${response.status}`);
        return response.text();
      }));
    }
    return componentRequests.get(name);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function renderProjectCards(container) {
    const projects = window.portfolioProjects;
    if (!container || !projects || container.dataset.rendering === "true" || container.dataset.rendered === "true") return;
    container.dataset.rendering = "true";

    if (!projectCardTemplateRequest) {
      projectCardTemplateRequest = fetch(projectCardUrl).then(response => {
        if (!response.ok) throw new Error(`Could not load project-card template: ${response.status}`);
        return response.text();
      });
    }

    projectCardTemplateRequest.then(template => {
      if (!container.isConnected) return;
      container.innerHTML = projects.map(project => {
        const values = {
          ...project,
          description: project.description,
          mobileDescription: project.mobileDescription
        };
        return template.replace(/\{\{(\w+)\}\}/g, (_, key) => escapeHtml(values[key] || ""));
      }).join("");
      container.dataset.rendered = "true";
      applyResponsiveContent();
    }).catch(error => {
      delete container.dataset.rendering;
      console.error("Could not render portfolio project cards.", error);
    });
  }

  function applyResponsiveContent() {
    const isMobile = mobileQuery.matches;
    document.documentElement.classList.toggle("is-mobile", isMobile);

    document.querySelectorAll("[data-desktop-text][data-mobile-text]").forEach(element => {
      element.textContent = isMobile ? element.dataset.mobileText : element.dataset.desktopText;
    });
    document.querySelectorAll("[data-desktop-href][data-mobile-href]").forEach(link => {
      link.href = isMobile ? link.dataset.mobileHref : link.dataset.desktopHref;
    });
    document.querySelectorAll("[data-desktop-title][data-mobile-title]").forEach(element => {
      document.title = isMobile ? element.dataset.mobileTitle : element.dataset.desktopTitle;
    });
  }

  class PortfolioSiteNav extends HTMLElement {
    connectedCallback() {
      loadComponent("nav.html").then(markup => {
        if (!this.isConnected) return;
        const active = this.getAttribute("data-active");
        const template = markup
          .replaceAll("{{workActive}}", active === "work" ? " is-active" : "")
          .replaceAll("{{aboutActive}}", active === "about" ? " is-active" : "")
          .replaceAll("{{workCurrent}}", active === "work" ? ' aria-current="page"' : "")
          .replaceAll("{{aboutCurrent}}", active === "about" ? ' aria-current="page"' : "")
          .replaceAll("{{contactHref}}", active === "about" ? "#contact" : "index.html#contact");
        const content = document.createElement("template");
        content.innerHTML = template;
        this.replaceChildren(content.content);
        applyResponsiveContent();
      }).catch(error => {
        console.error("Could not render the shared site navigation.", error);
      });
    }
  }

  class PortfolioSiteFooter extends HTMLElement {
    connectedCallback() {
      const kind = this.getAttribute("data-kind");
      if (kind !== "home" && kind !== "case") {
        console.error(`Unknown shared footer kind: ${kind}`);
        return;
      }
      loadComponent("footer.html").then(markup => {
        if (!this.isConnected) return;
        const content = document.createElement("template");
        content.innerHTML = markup;
        const source = content.content.querySelector(`#${kind}-footer`);
        if (!source) throw new Error(`Shared footer template "${kind}" was not found`);
        this.replaceChildren(source.content.cloneNode(true));
        applyResponsiveContent();
      }).catch(error => {
        console.error("Could not render the shared site footer.", error);
      });
    }
  }

  class PortfolioSectionNav extends HTMLElement {
    connectedCallback() {
      let sections;
      try {
        sections = JSON.parse(this.getAttribute("data-sections") || "[]");
      } catch (error) {
        console.error("Could not parse case-study navigation sections.", error);
        return;
      }
      if (!Array.isArray(sections) || sections.some(section =>
        !Array.isArray(section) || section.length !== 2 ||
        typeof section[0] !== "string" || typeof section[1] !== "string"
      )) {
        console.error("Case-study navigation sections have an invalid shape.");
        return;
      }

      loadComponent("case-nav.html").then(markup => {
        if (!this.isConnected) return;
        const content = document.createElement("template");
        content.innerHTML = markup;
        const nav = content.content.firstElementChild;
        nav.querySelector(".cs-project").textContent = this.getAttribute("data-project") || "";
        const list = nav.querySelector(".cs-list");
        const current = nav.querySelector(".cs-current");
        const progress = nav.querySelector(".cs-progress i");
        const trigger = nav.querySelector(".cs-trigger");

        const links = sections.map(([id, label]) => {
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.className = "cs-link";
          link.href = `#${id}`;
          link.textContent = label;
          link.addEventListener("click", () => {
            nav.dataset.open = "false";
            trigger.setAttribute("aria-expanded", "false");
          });
          item.append(link);
          list.append(item);
          return { id, label, link };
        });

        function setCurrent(sectionId) {
          const selected = links.find(section => section.id === sectionId) || links[0];
          if (!selected) return;
          links.forEach(section => {
            if (section === selected) section.link.setAttribute("aria-current", "true");
            else section.link.removeAttribute("aria-current");
          });
          current.textContent = selected.label;
        }

        trigger.addEventListener("click", () => {
          const open = nav.dataset.open !== "true";
          nav.dataset.open = String(open);
          trigger.setAttribute("aria-expanded", String(open));
        });

        if ("IntersectionObserver" in window) {
          const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) setCurrent(entry.target.id);
            });
          }, { rootMargin: "-15% 0px -75% 0px" });
          links.forEach(section => {
            const target = document.getElementById(section.id);
            if (target) observer.observe(target);
          });
        }

        const updateProgress = () => {
          const range = document.documentElement.scrollHeight - window.innerHeight;
          const value = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
          progress.style.transform = `scaleX(${value})`;
        };
        window.addEventListener("scroll", updateProgress, { passive: true });
        updateProgress();
        setCurrent(links[0] && links[0].id);
        this.replaceChildren(nav);
      }).catch(error => {
        console.error("Could not render the case-study navigation.", error);
      });
    }
  }

  customElements.define("portfolio-site-nav", PortfolioSiteNav);
  customElements.define("portfolio-site-footer", PortfolioSiteFooter);
  customElements.define("portfolio-section-nav", PortfolioSectionNav);

  document.addEventListener("DOMContentLoaded", () => {
    let stopWatching;
    const renderWhenReady = () => {
      const container = document.getElementById("project-grid");
      const nav = document.querySelector("portfolio-site-nav");
      if (!container || !nav || nav.childElementCount === 0) return;
      projectGridObserver.disconnect();
      window.clearTimeout(stopWatching);
      renderProjectCards(container);
    };
    const projectGridObserver = new MutationObserver(renderWhenReady);
    projectGridObserver.observe(document.documentElement, { childList: true, subtree: true });
    stopWatching = window.setTimeout(() => {
      projectGridObserver.disconnect();
      const container = document.getElementById("project-grid");
      if (container && container.dataset.rendered !== "true") {
        console.error("Could not render portfolio project cards because the shared navigation did not finish loading.");
      }
    }, 10000);
    renderWhenReady();
    applyResponsiveContent();
    mobileQuery.addEventListener("change", applyResponsiveContent);
  });
})();
