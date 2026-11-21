(() => {
  const componentBase = new URL("../components/thumbs/", document.currentScript.src);
  const requests = new Map();
  const loadedStyles = new Set();
  const componentStyle = document.createElement("style");
  componentStyle.textContent = "portfolio-thumb{display:block}";
  document.head.append(componentStyle);

  function loadThumbnail(key) {
    if (!requests.has(key)) {
      const request = fetch(new URL(`${key}.html`, componentBase)).then(response => {
        if (!response.ok) {
          throw new Error(`Could not load portfolio thumbnail "${key}": ${response.status}`);
        }
        return response.text();
      }).then(markup => {
        const template = document.createElement("template");
        template.innerHTML = markup;
        const style = template.content.querySelector("style");
        const svg = template.content.querySelector("svg");
        if (!style || !svg) {
          throw new Error(`Portfolio thumbnail "${key}" is missing its style or SVG`);
        }
        if (!loadedStyles.has(key)) {
          const sheet = document.createElement("style");
          sheet.textContent = style.textContent;
          document.head.append(sheet);
          loadedStyles.add(key);
        }
        return svg.outerHTML;
      });
      requests.set(key, request);
    }
    return requests.get(key);
  }

  class PortfolioThumb extends HTMLElement {
    connectedCallback() {
      const key = this.getAttribute("data-key");
      if (!key) {
        throw new Error("Portfolio thumbnail is missing its data-key");
      }
      if (!this.style.display) {
        this.style.display = "block";
      }

      loadThumbnail(key).then(markup => {
        if (!this.isConnected) return;
        const template = document.createElement("template");
        template.innerHTML = markup;
        this.replaceChildren(template.content.firstElementChild);
      });
    }
  }

  customElements.define("portfolio-thumb", PortfolioThumb);
})();
