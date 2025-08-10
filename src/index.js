import stylesheet from "./styles.css";

const PROCESSED_DATA_ATTR = "data-xcancel-redirect-processed";
const MAIN_SELECTOR = `a[href*="/status/"]:has(time):not([${PROCESSED_DATA_ATTR}])`;

function initialProcess() {
  const links = Array.from(document.querySelectorAll(MAIN_SELECTOR));
  for (const link of links) {
    processLink(link);
  }
}

function processLink(link) {
  link.setAttribute(PROCESSED_DATA_ATTR, "");
  const redirectUrl = new URL(link.href, window.location.href);
  redirectUrl.hostname = "xcancel.com";
  redirectUrl.protocol = "https:";
  const newLink = document.createElement("a");
  newLink.href = redirectUrl.toString();
  newLink.target = "_blank";
  newLink.classList.add("xcancel-redirect-link");
  newLink.appendChild(document.createTextNode("XC ↗"));
  link.parentElement?.appendChild(newLink);
}

function processAddedNode(target) {
  if (target.matches(MAIN_SELECTOR)) {
    processLink(target);
    return;
  }
  const childLinks = Array.from(target.querySelectorAll(MAIN_SELECTOR));
  for (const link of childLinks) {
    processLink(link);
  }
}

function childListCallback(entries) {
  const start = performance.now();
  for (const entry of entries) {
    if (entry.type !== "childList") {
      continue;
    }
    for (const node of entry.addedNodes) {
      processAddedNode(node);
    }
  }
  const end = performance.now();
  const showWarning = end - start > 2;
  if (!ENABLE_DEBUG_OUTPUT && !showWarning) {
    return;
  }
  const logger = showWarning
    ? console.warn.bind(console)
    : console.debug.bind(console);
  const interval = (end - start).toFixed(3);
  logger(`[open-in-xcancel] childlist callback took ${interval}ms to complete`);
}

function processRootNode(root) {
  const isDark = window.getComputedStyle(root).colorScheme === "dark";
  root.classList.toggle("xcancel-redirect-dark-theme", isDark);
}

function rootAttributeCallback(entries) {
  for (const entry of entries) {
    if (entry.type !== "attributes") {
      continue;
    }
    if (entry.target !== document.documentElement) {
      continue;
    }
    processRootNode(entry.target);
  }
}

function main() {
  const style = document.createElement("style");
  style.appendChild(document.createTextNode(stylesheet));
  document.head.appendChild(style);

  initialProcess();
  const subtreeObserver = new MutationObserver(childListCallback);
  subtreeObserver.observe(document.body, { subtree: true, childList: true });

  processRootNode(document.documentElement);
  const rootAttrObserver = new MutationObserver(rootAttributeCallback);
  rootAttrObserver.observe(document.documentElement, { attributes: true });
}

main();
