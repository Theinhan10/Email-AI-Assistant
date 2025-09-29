
console.log("email writer extension");

// Helper to grab email content
function getEmailContent() {
  const selectors = [".h7", ".a3s.aiL", ".gmail_quote", '[role="presentation"]'];
  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) return content.innerText.trim();
  }
  return "";
}

// Observe Gmail DOM for compose windows
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.querySelector(".btC")) {
        console.log("Compose Window Detected");
        const toolbar = node.querySelector(".btC");
        if (toolbar) {
          injectAutoReplyButton(toolbar, getEmailContent);
          injectRewriteButton(toolbar, getEmailContent);
        }
      }
    });
  }
});

observer.observe(document.body, { childList: true, subtree: true });