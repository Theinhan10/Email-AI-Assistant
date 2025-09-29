console.log("email writer extension"); 
// Log to the console that the extension's content script has loaded

// Helper function to grab the email content from Gmail's message or compose area
function getEmailContent() {
  // List of possible Gmail selectors for email content
  const selectors = [".h7", ".a3s.aiL", ".gmail_quote", '[role="presentation"]'];
  for (const selector of selectors) {
    const content = document.querySelector(selector); // Try to find the first matching element
    if (content) return content.innerText.trim(); // If found, return the text without extra spaces
  }
  return ""; // Fallback: return empty string if no content found
}

// Create a MutationObserver to watch for DOM changes (like new compose windows)
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    // Loop through newly added nodes in the DOM
    mutation.addedNodes.forEach((node) => {
      // Check if the added node is an element and contains a Gmail compose toolbar (.btC)
      if (node.nodeType === Node.ELEMENT_NODE && node.querySelector(".btC")) {
        console.log("Compose Window Detected"); // Log when a compose window is detected
        const toolbar = node.querySelector(".btC"); // Grab the toolbar inside the compose window
        if (toolbar) {
          // Inject the AUTO Reply button into the toolbar
          injectAutoReplyButton(toolbar, getEmailContent); 
          // Inject the Rewrite button into the toolbar
          injectRewriteButton(toolbar, getEmailContent); 
        }
      }
    });
  }
});

// Start observing the entire Gmail page body for changes
// childList: watch for added/removed nodes
// subtree: include all nested children, not just direct children
observer.observe(document.body, { childList: true, subtree: true });
