"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const scriptUrl = new URL(document.currentScript.src);
const rootUrl = new URL("./", scriptUrl);
const rootPath = rootUrl.pathname.endsWith("/") ? rootUrl.pathname : `${rootUrl.pathname}/`;
const dataUrl = new URL("products.json", rootUrl);

if (window.__productHubRedirectRoute) {
  history.replaceState(null, "", window.__productHubRedirectRoute);
}

const fallbackData = {
  schemaVersion: 1,
  site: { brand: "KuhyaKuya", productLabel: "Product Hub" },
  products: [{
    id: "ez-guys-pr",
    name: "EZ Guys Complete",
    category: "Plugin",
    subtitle: "Adobe Premiere Pro workflow toolkit",
    description: "A toolkit for reusable clip packs, clip arrangement, and sequence framing.",
    status: "In development",
    version: "",
    metadata: [{ label: "Platform", value: "Adobe Premiere Pro" }],
    primaryAction: { label: "Access product", url: "" },
    media: { demoVideo: { youtubeId: "", title: "" } },
    sections: [],
    documentation: { description: "", topics: [] },
    changelog: []
  }]
};

const state = { data: fallbackData, route: null, activeDoc: "overview" };

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function routeUrl(path = "", query = "") {
  const clean = String(path).replace(/^\/+|\/+$/g, "");
  const target = new URL(clean ? `${clean}/` : "./", rootUrl);
  target.search = query;
  return `${target.pathname}${target.search}`;
}

function getRelativePath() {
  let pathname = location.pathname;
  if (pathname.startsWith(rootPath)) pathname = pathname.slice(rootPath.length);
  else pathname = pathname.replace(/^\//, "");
  return pathname.replace(/^\/+|\/+$/g, "");
}

function parseRoute() {
  const parts = getRelativePath().split("/").filter(Boolean).map(decodeURIComponent);
  if (!parts.length || parts[0] === "index.html") return { view: "catalog", slug: "" };
  if (parts.length === 1) return { view: "product", slug: parts[0] };
  if (parts.length === 2 && parts[1] === "docs") return { view: "docs", slug: parts[0] };
  if (parts.length === 2 && parts[1] === "changelog") return { view: "changelog", slug: parts[0] };
  return { view: "not-found", slug: parts[0] || "" };
}

function getProduct(slug) {
  return state.data.products.find((product) => product.id === slug);
}

function updateDescription(text) {
  $("meta[name='description']").setAttribute("content", text);
}

function statusClass(status) {
  return String(status).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function productCategory(product) {
  return product.category || product.type || "Product";
}

function productMetadata(product) {
  if (Array.isArray(product.metadata)) {
    return product.metadata.filter((item) => item && item.label && item.value !== undefined && item.value !== null && String(item.value).trim());
  }
  return [
    product.platform ? { label: "Platform", value: product.platform } : null,
    product.minVersion ? { label: "Minimum version", value: `${product.minVersion}+` } : null,
    product.technology ? { label: "Technology", value: product.technology } : null
  ].filter(Boolean);
}

function productSections(product) {
  if (Array.isArray(product.sections)) return product.sections;
  if (Array.isArray(product.features) && product.features.length) {
    return [{ id: "features", type: "item-list", eyebrow: "Highlights", title: "Features", items: product.features }];
  }
  return [];
}

function productDocs(product) {
  if (product.documentation && Array.isArray(product.documentation.topics)) return product.documentation.topics;
  return Array.isArray(product.docs) ? product.docs : [];
}

function productMeta(product) {
  const metadata = productMetadata(product).slice(0, 2).map((item) => item.value);
  const items = [productCategory(product), product.version ? `Version ${product.version}` : "", ...metadata].filter(Boolean);
  return items.map((item) => `<span>${esc(item)}</span>`).join("");
}

function renderMedia(product, compact = false) {
  const media = product.media || {};
  const demo = media.demoVideo && typeof media.demoVideo === "object" ? media.demoVideo : {};
  const youtubeId = demo.youtubeId || media.youtubeId || "";
  const videoAvailable = validYoutubeId(youtubeId);
  const cover = safeMediaPath(media.cover);

  if (compact) {
    if (cover) return `<div class="card-preview"><img src="${esc(cover)}" alt="${esc(product.name)} cover" loading="lazy"></div>`;
    return `<div class="media-placeholder${compact ? " compact" : ""}">
      <span class="placeholder-label">Product preview</span>
      <strong>${videoAvailable ? "Demo available" : "Media optional"}</strong>
      <small>${videoAvailable ? "Open the product page to watch the demo." : "A product demo can be added when it is ready."}</small>
    </div>`;
  }

  if (!videoAvailable) return "";

  return `<div class="media-gallery"><div class="video-embed">
    <iframe src="https://www.youtube-nocookie.com/embed/${esc(youtubeId)}?rel=0" title="${esc(demo.title || `${product.name} demo`)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  </div></div>`;
}

function validYoutubeId(value) {
  return /^[a-zA-Z0-9_-]{11}$/.test(value || "");
}

function safeMediaPath(value) {
  if (typeof value !== "string") return "";
  const path = value.trim();
  if (!path || /^(?:javascript|data|vbscript):/i.test(path) || path.includes("..")) return "";
  if (/^https:\/\//i.test(path)) return path;
  if (path.startsWith("/") || path.startsWith("//")) return "";
  return /^[a-zA-Z0-9_./-]+$/.test(path) ? new URL(path, rootUrl).pathname : "";
}

function safeLinkUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim(), rootUrl);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch (error) {
    return "";
  }
}

function productPrimaryAction(product) {
  const source = product.primaryAction && typeof product.primaryAction === "object"
    ? product.primaryAction
    : { label: "Access product", url: product.purchaseUrl || "" };
  const url = safeLinkUrl(source.url);
  if (!url) return null;
  const destination = new URL(url);
  const host = destination.hostname.toLowerCase().replace(/^www\./, "");
  const trusted = destination.origin === location.origin || host === "kuhyakuya.com" || host.endsWith(".kuhyakuya.com");
  return {
    label: source.label || "Access product",
    url,
    external: destination.origin !== location.origin,
    warningRequired: !trusted
  };
}

function externalLinkDialog() {
  let dialog = $("#external-link-dialog");
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.id = "external-link-dialog";
  dialog.className = "external-dialog";
  dialog.setAttribute("aria-labelledby", "external-dialog-title");
  dialog.innerHTML = `<div class="external-dialog-content">
    <p class="section-label">External destination</p>
    <h2 id="external-dialog-title">You’re leaving KuhyaKuya</h2>
    <p>The product link opens a third-party website. Its content, availability, privacy practices, and transactions are outside KuhyaKuya’s control.</p>
    <div class="external-destination"><span>Destination</span><strong id="external-destination-host"></strong><code id="external-destination-url"></code></div>
    <div class="dialog-actions">
      <form method="dialog"><button class="button secondary" value="cancel">Stay here</button></form>
      <a class="button primary" id="external-dialog-continue" href="#" target="_blank" rel="noopener noreferrer">Continue <span aria-hidden="true">↗</span></a>
    </div>
  </div>`;
  document.body.append(dialog);
  $("#external-dialog-continue", dialog).addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  return dialog;
}

function bindExternalAccessLinks(target) {
  target.querySelectorAll("[data-external-access]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = safeLinkUrl(link.href);
      if (!url) return;
      event.preventDefault();
      const destination = new URL(url);
      const dialog = externalLinkDialog();
      $("#external-destination-host", dialog).textContent = destination.hostname;
      $("#external-destination-url", dialog).textContent = url;
      $("#external-dialog-continue", dialog).href = url;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    });
  });
}

function productCard(product) {
  const detail = routeUrl(product.id);
  const docs = routeUrl(`${product.id}/docs`);
  const category = productCategory(product);
  const documentation = productDocs(product);
  const searchText = [product.name, product.subtitle, product.description, category, product.status, product.version, ...productMetadata(product).flatMap((item) => [item.label, item.value])].join(" ").toLowerCase();
  return `<article class="product-card" data-search="${esc(searchText)}" data-type="${esc(category)}">
    ${renderMedia(product, true)}
    <div class="product-card-body">
      <div class="card-labels">
        ${product.status ? `<span class="status ${statusClass(product.status)}">${esc(product.status)}</span>` : ""}
        <span class="quiet-label">${esc(category)}</span>
      </div>
      <h2><a href="${detail}">${esc(product.name)}</a></h2>
      <p class="product-subtitle">${esc(product.subtitle)}</p>
      <p>${esc(product.description)}</p>
      <div class="card-meta">${productMeta(product)}</div>
      <div class="card-actions">
        <a class="button primary" href="${detail}">View product</a>
        ${documentation.length ? `<a class="button secondary" href="${docs}">Documentation</a>` : ""}
      </div>
    </div>
  </article>`;
}

function renderCatalog() {
  const products = state.data.products;
  const types = [...new Set(products.map(productCategory).filter(Boolean))];
  $("#app").innerHTML = `
    <section class="catalog-intro" aria-labelledby="catalog-title">
      <div>
        <p class="eyebrow">KuhyaKuya / Product directory</p>
        <h1 id="catalog-title">Product Hub</h1>
      </div>
      <p class="intro-copy">Browse software, plugins, utilities, and product documentation from KuhyaKuya. Product-specific information stays with each product.</p>
    </section>

    <section class="directory" aria-labelledby="directory-title">
      <div class="directory-heading">
        <div>
          <p class="section-label">Directory</p>
          <h2 id="directory-title">All products</h2>
        </div>
        <div class="directory-stats" aria-label="Catalog summary">
          <span><strong>${products.length}</strong> listed</span>
          <span><strong>${types.length}</strong> categories</span>
        </div>
      </div>
      <div class="catalog-tools">
        <label class="search-field" for="catalog-search">
          <span>Search</span>
          <input id="catalog-search" type="search" placeholder="Name, category, or metadata" autocomplete="off">
        </label>
        <label class="filter-field" for="type-filter">
          <span>Product type</span>
          <select id="type-filter"><option value="">All types</option>${types.map((type) => `<option value="${esc(type)}">${esc(type)}</option>`).join("")}</select>
        </label>
      </div>
      <div id="product-grid" class="product-grid">${products.map(productCard).join("")}</div>
      <p id="catalog-empty" class="empty-results" hidden>No products match this filter.</p>
    </section>`;

  document.title = "KuhyaKuya Product Hub";
  updateDescription("Browse KuhyaKuya software, plugins, utilities, documentation, and release information.");
  bindCatalogFilters();
}

function bindCatalogFilters() {
  const search = $("#catalog-search");
  const type = $("#type-filter");
  const cards = Array.from(document.querySelectorAll(".product-card"));
  const apply = () => {
    const term = search.value.trim().toLowerCase();
    const selectedType = type.value;
    let visible = 0;
    cards.forEach((card) => {
      const show = (!term || card.dataset.search.includes(term)) && (!selectedType || card.dataset.type === selectedType);
      card.hidden = !show;
      if (show) visible += 1;
    });
    $("#catalog-empty").hidden = visible !== 0;
  };
  search.addEventListener("input", apply);
  type.addEventListener("change", apply);
}

function renderBreadcrumb(product, current) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="${routeUrl()}">Products</a><span aria-hidden="true">/</span>
    ${current ? `<a href="${routeUrl(product.id)}">${esc(product.name)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(current)}</span>` : `<span aria-current="page">${esc(product.name)}</span>`}
  </nav>`;
}

function renderProductFacts(product) {
  const facts = [];
  if (product.version !== undefined && product.version !== null && String(product.version).trim()) {
    facts.push({ label: "Version", value: product.version });
  }
  productMetadata(product).forEach((item) => facts.push(item));
  if (product.status) facts.push({ label: "Release status", value: product.status });
  if (!facts.length) return "";
  return `<dl class="product-facts">${facts.map((item) => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join("")}</dl>`;
}

function renderProductSection(section, index) {
  if (!section || typeof section !== "object") return "";
  const items = Array.isArray(section.items) ? section.items : [];
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];
  let content = "";

  if (section.type === "item-list" && items.length) {
    content = `<div class="feature-list">${items.map((item, itemIndex) => `<article><span>${String(itemIndex + 1).padStart(2, "0")}</span><div><h3>${esc(item.title)}</h3>${item.description ? `<p>${esc(item.description)}</p>` : ""}</div></article>`).join("")}</div>`;
  } else if (section.type === "content" && blocks.length) {
    content = `<div class="section-content">${blocks.map(renderDocBlock).join("")}</div>`;
  }

  if (!content) return "";
  const idPart = statusClass(section.id || section.title || `section-${index + 1}`) || `section-${index + 1}`;
  const headingId = `product-${idPart}`;
  return `<section class="detail-section" aria-labelledby="${esc(headingId)}">
    <div class="section-copy"><p class="section-label">${esc(section.eyebrow || "Details")}</p><h2 id="${esc(headingId)}">${esc(section.title || "Product details")}</h2>${section.description ? `<p>${esc(section.description)}</p>` : ""}</div>
    ${content}
  </section>`;
}

function renderProduct(product) {
  const sections = productSections(product);
  const docs = productDocs(product);
  const docsAvailable = docs.length > 0;
  const changelogAvailable = Array.isArray(product.changelog) && product.changelog.length > 0;
  const category = productCategory(product);
  const facts = renderProductFacts(product);
  const demoVideo = renderMedia(product);
  const primaryAction = productPrimaryAction(product);
  const resourceLinks = [
    docsAvailable ? `<a href="${routeUrl(`${product.id}/docs`)}"><span>Documentation</span><small>${docs.length} published topics</small></a>` : "",
    changelogAvailable ? `<a href="${routeUrl(`${product.id}/changelog`)}"><span>Changelog</span><small>${product.changelog.length} published entries</small></a>` : ""
  ].filter(Boolean).join("");
  $("#app").innerHTML = `
    ${renderBreadcrumb(product)}
    <article class="product-page">
      <header class="product-header${facts ? "" : " single-column"}">
        <div class="product-heading">
          <div class="card-labels">${product.status ? `<span class="status ${statusClass(product.status)}">${esc(product.status)}</span>` : ""}<span class="quiet-label">${esc(category)}</span></div>
          <h1>${esc(product.name)}</h1>
          ${product.subtitle ? `<p class="product-subtitle large">${esc(product.subtitle)}</p>` : ""}
          ${product.description ? `<p class="product-description">${esc(product.description)}</p>` : ""}
          <div class="header-actions">
            ${primaryAction ? `<a class="button primary" href="${esc(primaryAction.url)}"${primaryAction.warningRequired ? ' data-external-access="true"' : ""}${primaryAction.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(primaryAction.label)}${primaryAction.external ? ' <span aria-hidden="true">↗</span>' : ""}</a>` : ""}
            ${docsAvailable ? `<a class="button ${primaryAction ? "secondary" : "primary"}" href="${routeUrl(`${product.id}/docs`)}">Read documentation</a>` : ""}
            ${changelogAvailable ? `<a class="button secondary" href="${routeUrl(`${product.id}/changelog`)}">View changelog</a>` : ""}
          </div>
        </div>
        ${facts}
      </header>

      ${demoVideo ? `<section class="detail-section" aria-labelledby="media-heading">
        <div class="section-copy"><p class="section-label">${esc(product.media.eyebrow || "Media")}</p><h2 id="media-heading">${esc(product.media.heading || "Demo video")}</h2><p>${esc(product.media.description || "Watch a focused overview of this product.")}</p></div>
        ${demoVideo}
      </section>` : ""}

      ${sections.map(renderProductSection).join("")}

      ${resourceLinks ? `<section class="product-resources" aria-labelledby="resources-heading">
        <div><p class="section-label">Resources</p><h2 id="resources-heading">Product information</h2></div>
        <div class="resource-links">${resourceLinks}</div>
      </section>` : ""}
    </article>`;

  document.title = `${product.name} — KuhyaKuya Product Hub`;
  updateDescription(product.description);
  bindExternalAccessLinks($("#app"));
}

function renderDocBlock(block) {
  if (!block || !block.type) return "";
  if (block.type === "paragraph") return `<p>${esc(block.text)}</p>`;
  if (block.type === "heading") return `<h3>${esc(block.text)}</h3>`;
  if (block.type === "list") return `<ul>${(block.items || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
  if (block.type === "note") return `<aside class="doc-note">${esc(block.text)}</aside>`;
  return "";
}

function normalizeScreenshot(item, productName, toolName, index) {
  const source = typeof item === "string" ? item : item && item.src;
  const src = safeMediaPath(source);
  if (!src) return null;
  return {
    src,
    alt: typeof item === "object" && item.alt ? item.alt : `${productName} ${toolName} screenshot ${index + 1}`,
    caption: typeof item === "object" && item.caption ? item.caption : ""
  };
}

function renderDocScreenshots(product, doc) {
  const screenshots = (Array.isArray(doc.screenshots) ? doc.screenshots : [])
    .map((item, index) => normalizeScreenshot(item, product.name, doc.title, index))
    .filter(Boolean);
  if (!screenshots.length) return "";
  const headingId = `screenshots-${statusClass(doc.id)}`;
  return `<section class="doc-screenshots" aria-labelledby="${esc(headingId)}">
    <div class="doc-media-heading"><p class="section-label">Topic media</p><h3 id="${esc(headingId)}">${esc(doc.title)} screenshots</h3></div>
    <div class="doc-screenshot-grid">${screenshots.map((item) => `<figure>
      <a href="${esc(item.src)}" target="_blank" rel="noopener noreferrer"><img src="${esc(item.src)}" alt="${esc(item.alt)}" loading="lazy"></a>
      ${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ""}
    </figure>`).join("")}</div>
  </section>`;
}

function renderDocs(product) {
  const docs = productDocs(product);
  if (!docs.length) {
    renderUnavailable(product, "Documentation", "No documentation has been published for this product.");
    return;
  }
  const requested = new URLSearchParams(location.search).get("topic");
  const active = docs.find((doc) => doc.id === requested) || docs[0];
  state.activeDoc = active.id;
  $("#app").innerHTML = `
    ${renderBreadcrumb(product, "Documentation")}
    <header class="page-heading compact-heading">
      <p class="eyebrow">${esc(product.name)} / Documentation</p>
      <h1>Documentation</h1>
      <p>${esc(product.documentation?.description || "Guides and supporting information for this product.")}</p>
    </header>
    <div class="docs-layout">
      <aside class="docs-sidebar">
        <label class="search-field" for="docs-search"><span>Find a topic</span><input id="docs-search" type="search" placeholder="Search documentation" autocomplete="off"></label>
        <nav id="docs-nav" aria-label="Documentation topics">${docLinks(product, docs, active.id)}</nav>
      </aside>
      <article class="docs-article" id="docs-article" tabindex="-1">
        ${docArticle(product, active)}
      </article>
    </div>`;
  document.title = `${active.title} — ${product.name} Documentation`;
  updateDescription(active.summary || `${product.name} documentation.`);
  bindDocs(product, docs);
}

function docLinks(product, docs, activeId, term = "") {
  const filtered = docs.filter((doc) => [doc.title, doc.category, doc.summary].some((value) => String(value || "").toLowerCase().includes(term)));
  if (!filtered.length) return '<p class="empty-results">No matching topics.</p>';
  const groups = [...new Set(filtered.map((doc) => doc.category || "Guides"))];
  return groups.map((group) => `<div class="doc-group"><p>${esc(group)}</p>${filtered.filter((doc) => (doc.category || "Guides") === group).map((doc) => `<a href="${routeUrl(`${product.id}/docs`, `topic=${encodeURIComponent(doc.id)}`)}" data-doc="${esc(doc.id)}" class="${doc.id === activeId ? "active" : ""}">${esc(doc.title)}</a>`).join("")}</div>`).join("");
}

function docArticle(product, doc) {
  return `<p class="section-label">${esc(doc.category || "Guide")} / ${esc(product.name)}</p><h2>${esc(doc.title)}</h2><p class="doc-summary">${esc(doc.summary)}</p>${renderDocScreenshots(product, doc)}${(doc.blocks || []).map(renderDocBlock).join("")}`;
}

function bindDocs(product, docs) {
  const search = $("#docs-search");
  const nav = $("#docs-nav");
  search.addEventListener("input", () => {
    nav.innerHTML = docLinks(product, docs, state.activeDoc, search.value.trim().toLowerCase());
    bindDocLinks(product, docs);
  });
  bindDocLinks(product, docs);
}

function bindDocLinks(product, docs) {
  document.querySelectorAll("[data-doc]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const doc = docs.find((item) => item.id === link.dataset.doc);
      if (!doc) return;
      history.pushState(null, "", link.href);
      state.activeDoc = doc.id;
      $("#docs-article").innerHTML = docArticle(product, doc);
      document.querySelectorAll("[data-doc]").forEach((item) => item.classList.toggle("active", item.dataset.doc === doc.id));
      document.title = `${doc.title} — ${product.name} Documentation`;
      updateDescription(doc.summary || `${product.name} documentation.`);
      $("#docs-article").focus({ preventScroll: true });
    });
  });
}

function renderChangelog(product) {
  const entries = Array.isArray(product.changelog) ? product.changelog : [];
  $("#app").innerHTML = `
    ${renderBreadcrumb(product, "Changelog")}
    <header class="page-heading compact-heading">
      <p class="eyebrow">${esc(product.name)} / Release history</p>
      <h1>Changelog</h1>
      <p>Published release notes for this product.</p>
    </header>
    ${entries.length ? `<div class="changelog-list">${entries.map((entry) => `<article><div><time>${esc(entry.date || "Date not published")}</time><h2>${esc(entry.version || entry.title)}</h2></div><div>${(entry.items || []).map((item) => `<p>${esc(item)}</p>`).join("")}</div></article>`).join("")}</div>` : `<div class="empty-state"><p class="section-label">No entries</p><h2>No release history published.</h2><p>${esc(product.name)} is currently marked “${esc(product.status)}”. Changelog entries will appear here only after verified release information is available.</p><a class="button secondary" href="${routeUrl(product.id)}">Back to product</a></div>`}`;
  document.title = `Changelog — ${product.name}`;
  updateDescription(`Release history for ${product.name}.`);
}

function renderUnavailable(product, title, message) {
  $("#app").innerHTML = `${renderBreadcrumb(product, title)}<div class="empty-state page-empty"><p class="section-label">${esc(product.name)}</p><h1>${esc(title)}</h1><p>${esc(message)}</p><a class="button secondary" href="${routeUrl(product.id)}">Back to product</a></div>`;
  document.title = `${title} — ${product.name}`;
  updateDescription(message);
}

function renderNotFound(slug = "") {
  $("#app").innerHTML = `<div class="empty-state page-empty"><p class="section-label">404</p><h1>Page not found</h1><p>${slug ? `No published product or page matches “${esc(slug)}”.` : "This page is not available."}</p><a class="button primary" href="${routeUrl()}">Open product index</a></div>`;
  document.title = "Page not found — KuhyaKuya Product Hub";
  updateDescription("The requested Product Hub page was not found.");
}

function renderContextNav(route, product) {
  const container = $("#context-nav");
  $("[data-nav='catalog']").classList.toggle("active", route.view === "catalog");
  if (!product) {
    container.innerHTML = "";
    return;
  }
  const hasDocs = productDocs(product).length > 0;
  const hasChangelog = Array.isArray(product.changelog) && product.changelog.length > 0;
  container.innerHTML = `<a class="${route.view === "product" ? "active" : ""}" href="${routeUrl(product.id)}">${esc(product.name)}</a>${hasDocs ? `<a class="${route.view === "docs" ? "active" : ""}" href="${routeUrl(`${product.id}/docs`)}">Documentation</a>` : ""}${hasChangelog ? `<a class="${route.view === "changelog" ? "active" : ""}" href="${routeUrl(`${product.id}/changelog`)}">Changelog</a>` : ""}`;
}

function renderRoute() {
  const route = parseRoute();
  const product = route.slug ? getProduct(route.slug) : null;
  state.route = route;
  renderContextNav(route, product);
  closeMenu();

  if (route.view === "catalog") renderCatalog();
  else if (!product) renderNotFound(route.slug);
  else if (route.view === "product") renderProduct(product);
  else if (route.view === "docs") renderDocs(product);
  else if (route.view === "changelog") renderChangelog(product);
  else renderNotFound(route.slug);
}

function closeMenu() {
  $("#site-nav").classList.remove("open");
  $("#menu-toggle").setAttribute("aria-expanded", "false");
}

async function boot() {
  try {
    const response = await fetch(dataUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Product data unavailable");
    const json = await response.json();
    if (!Array.isArray(json.products) || !json.products.length) throw new Error("Product data invalid");
    state.data = json;
  } catch (error) {
    console.warn("Using built-in catalog fallback:", error);
  }

  document.querySelectorAll("[data-home-link]").forEach((link) => { link.href = routeUrl(); });
  $("#year").textContent = new Date().getFullYear();
  $("#menu-toggle").addEventListener("click", () => {
    const nav = $("#site-nav");
    const open = nav.classList.toggle("open");
    $("#menu-toggle").setAttribute("aria-expanded", String(open));
  });
  window.addEventListener("popstate", renderRoute);
  renderRoute();
}

document.addEventListener("DOMContentLoaded", boot);
