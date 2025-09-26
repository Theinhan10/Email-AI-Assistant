console.log("email writer extension");

// ------------------- Rewrite Button -------------------

// Function that creates a custom "Rewrite with AI" button
function createRewriteButton() {
  const button = document.createElement("div"); // create a new <div> element (Gmail uses <div> for toolbar buttons)
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3 ai-rewrite-button"; // Gmail button CSS classes + our custom class
  button.innerHTML = "AI Rewrite"; // text shown on the button
  button.setAttribute("role", "button"); // accessibility role so Gmail treats it like a button
  button.setAttribute("data-tooltip", "Rewrite selected text with AI"); // hover tooltip
  return button; // return the button element so we can insert it later
}

// Inject Rewrite button + popup INSIDE toolbar
function injectRewriteButton(toolbar) {
  if (toolbar.querySelector(".ai-rewrite-button")) return; // avoid duplicate button if it already exists

  const button = createRewriteButton(); // create the button

  // Add event when the "Rewrite" button is clicked
  button.addEventListener("click", () => {
    // If a popup already exists inside this toolbar, remove it first
    const oldPopup = toolbar.querySelector(".ai-rewrite-popup");
    if (oldPopup) oldPopup.remove();

    // Create the popup (textbox + buttons)
    const popup = document.createElement("div");
    popup.className = "ai-rewrite-popup";
    popup.innerHTML = `
        <textarea id="rewriteInput" placeholder="Type what you want to say..." rows="5" cols="40"></textarea>
        <br>
        <button id="sendToAI">Rewrite</button>
        <button id="cancelRewrite" class="cancel-btn">Cancel</button>
      `;

    // Insert popup INSIDE the toolbar so it disappears when toolbar closes
    toolbar.appendChild(popup);

    // Cancel button removes popup
    popup.querySelector("#cancelRewrite").addEventListener("click", () => {
      popup.remove();
    });

    // Rewrite button sends text to backend API
    popup.querySelector("#sendToAI").addEventListener("click", async () => {
      const userInput = popup.querySelector("#rewriteInput").value.trim();
      if (!userInput) {
        alert("Please type what you want your email to say."); // validation
        return;
      }

      try {
        
        // Grab the current email content
        const emailContent = getEmailContent();

        // Send email + wanted rewrite to backend API
        const response = await fetch(
          "http://localhost:8080/api/email/wantedContent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailContent, wantedContent: userInput }),
          }
        );

        if (!response.ok) throw new Error("API Request Failed");

        // Get rewritten text from API
        const rewrittenText = await response.text();

        // Insert rewritten text into Gmail compose box
        const composeBox = document.querySelector(
          '[role="textbox"][g_editable="true"]'
        );
        if (composeBox) {
          composeBox.focus();
          composeBox.innerHTML = rewrittenText;
        }

        popup.remove(); // close popup after inserting text
      } catch (err) {
        console.error(err);
        alert("Failed to rewrite text");
      }
    });
  });

  // Insert button to the LEFT side of toolbar (before Send button area)
  toolbar.insertBefore(button, toolbar.firstChild);
}

// ------------------- Auto Reply Button -------------------

// Function that creates a custom "AUTO Reply" button
function createAIButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button"; // Gmail button CSS + custom class
  button.innerHTML = "AUTO Reply"; // text shown on button
  button.setAttribute("role", "button"); // accessibility role
  button.setAttribute("data-tooltip", "Generate AI Reply"); // hover tooltip
  return button;
}

// Inject AUTO Reply button inside toolbar
function injectButton(toolbar) {
  if (toolbar.querySelector(".ai-reply-button")) return; // avoid duplicates
  const button = createAIButton();

  // Add click event for auto-reply button
  button.addEventListener("click", async () => {
    try {
      // Show loading state
      button.innerHTML = "Generating...";
      button.disabled = true;

      // Get current email content
      const emailContent = getEmailContent();

      // Send to backend API for automatic reply
      const response = await fetch(
        "http://localhost:8080/api/email/generateAutomaticResponse",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailContent, wantedContent: "" }),
        }
      );

      if (!response.ok) throw new Error("API Request Failed");

      // Get AI-generated reply
      const generatedReply = await response.text();

      // Insert into Gmail compose box
      const composeBox = document.querySelector(
        '[role="textbox"][g_editable="true"]'
      );
      if (composeBox) {
        composeBox.focus();
        composeBox.innerHTML = generatedReply;
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate reply");
    } finally {
      // Reset button state
      button.innerHTML = "AUTO Reply";
      button.disabled = false;
    }
  });

  // Insert at the LEFT of the toolbar
  toolbar.insertBefore(button, toolbar.firstChild);
}

// ------------------- Helpers -------------------

// Function to grab the email content (from thread/reply window)
function getEmailContent() {
  const selectors = [
    ".h7",
    ".a3s.aiL",
    ".gmail_quote",
    '[role="presentation"]',
  ]; // Gmail uses multiple different selectors
  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) return content.innerText.trim(); // return first found content
  }
  return ""; // fallback if no email found
}

// ------------------- Mutation Observer -------------------

// Gmail dynamically adds/removes compose windows, so we need to "watch" DOM changes
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      // Check if added node is a compose window (toolbar = .btC)
      if (node.nodeType === Node.ELEMENT_NODE && node.querySelector(".btC")) {
        console.log("Compose Window Detected");
        const toolbar = node.querySelector(".btC");
        if (toolbar) {
          injectButton(toolbar); // add AUTO Reply button
          injectRewriteButton(toolbar); // add Rewrite button
        }
      }
    });
  }
});

// Start observing the whole Gmail page for new compose windows
observer.observe(document.body, { childList: true, subtree: true });
