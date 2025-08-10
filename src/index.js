import stylesheet from "./styles.css";

function processLinks() {
  const links = Array.from(
    document.querySelectorAll(
      `a[href*="/status/"]:has(time):not([data-xcancel-redirect-processed])`
    )
  );
  for (const link of links) {
    link.dataset.xcancelRedirectProcessed = "";
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
}

function processTheme() {
  const isDark =
    window.getComputedStyle(document.documentElement).colorScheme === "dark";
  document.documentElement.classList.toggle(
    "xcancel-redirect-dark-theme",
    isDark
  );
}

function timer() {
  const start = performance.now();
  processTheme();
  processLinks();
  const end = performance.now();
  if (ENABLE_DEBUG_OUTPUT) {
    console.log(`[open-in-xcancel] timer took ${(end - start).toFixed(3)}ms to complete`);
  }
}

function main() {
  const style = document.createElement("style");
  style.appendChild(document.createTextNode(stylesheet));
  document.head.appendChild(style);

  timer();
  setInterval(timer, 200);
}

main();
