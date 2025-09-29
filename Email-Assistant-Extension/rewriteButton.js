// ------------------- Rewrite Button -------------------

// Function to create the "AI Rewrite" button
function createRewriteButton() {
  const button = document.createElement("div"); // Create a new <div> element (Gmail uses <div> for toolbar buttons)
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3 ai-rewrite-button"; // Apply Gmail button classes + custom class
  button.innerHTML = "AI Rewrite"; // The visible text on the button
  button.setAttribute("role", "button"); // Add accessibility role so Gmail treats it as a button
  button.setAttribute("data-tooltip", "Rewrite selected text with AI"); // Tooltip shown on hover
  return button; // Return the button element
}

// Function to inject the "Rewrite" button and its popup into the Gmail toolbar
function injectRewriteButton(toolbar, getEmailContent) {
  // Avoid inserting duplicate buttons (check if one already exists)
  if (toolbar.querySelector(".ai-rewrite-button")) return;

  // Create the rewrite button
  const button = createRewriteButton();

  // Add event listener: when the rewrite button is clicked
  button.addEventListener("click", () => {
    // If a popup already exists in this toolbar, remove it before creating a new one
    const oldPopup = toolbar.querySelector(".ai-rewrite-popup");
    if (oldPopup) oldPopup.remove();

    // Create the popup container (includes textarea + 2 buttons)
    const popup = document.createElement("div");
    popup.className = "ai-rewrite-popup"; // Assign popup class for styling
    popup.innerHTML = `
      <textarea id="rewriteInput" placeholder="Type what you want to say..." rows="5" cols="40"></textarea>
      <br>
      <button id="sendToAI">Rewrite</button>
      <button id="cancelRewrite" class="cancel-btn">Cancel</button>
    `;

    // Insert popup into the Gmail toolbar (so it disappears when toolbar closes)
    toolbar.appendChild(popup);
  
    // --- Close popup with ESC key ---
    const escListener = (event) => {
      if (event.key === "Escape") { // If user presses Escape
        popup.remove(); // Remove popup
        document.removeEventListener("keydown", escListener); // Clean up listener
      }
    };
    document.addEventListener("keydown", escListener);
    
    // --- Cancel button closes popup ---
    popup.querySelector("#cancelRewrite").addEventListener("click", () => popup.remove());

    // --- Handle rewrite request ---
    const sendBtn = popup.querySelector("#sendToAI"); // Grab "Rewrite" button inside popup
    sendBtn.addEventListener("click", async () => {
      // Get user input text from textarea
      const userInput = popup.querySelector("#rewriteInput").value.trim();
      if (!userInput) {
        alert("Please type what you want your email to say."); // Validation if empty
        return;
      }

      try {
        // Show loading state
        sendBtn.innerHTML = "Generating...";
        sendBtn.disabled = true;

        // Grab the original email content from Gmail
        const emailContent = getEmailContent();
        
        // Send both original email + user input to backend API
        const response = await fetch("http://localhost:8080/api/email/wantedContent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailContent, wantedContent: userInput }),
        });

        // If API request failed, throw an error
        if (!response.ok) throw new Error("API Request Failed");

        // Wait for rewritten text response from backend
        const rewrittenText = await response.text();

        // Log success in console if response is good
        if (response.ok) {
          console.log("Successfully Request Rewrite!");
        }

        // Find Gmail compose box and replace its content with rewritten text
        const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
        if (composeBox) {
          composeBox.focus(); // Focus on compose box
          composeBox.innerHTML = rewrittenText; // Insert AI-rewritten content
        }

        // Close popup after inserting text
        popup.remove();
      } catch (err) {
        // Handle errors gracefully
        console.error(err);
        alert("Failed to rewrite text");
      } finally {
        // Reset button state if popup is still open
        if (popup.isConnected) {
          sendBtn.innerHTML = "Rewrite";
          sendBtn.disabled = false;
        }
      }
    });
  });

  // Insert the "Rewrite" button at the start of the Gmail toolbar (next to Send button)
  toolbar.insertBefore(button, toolbar.firstChild);
}