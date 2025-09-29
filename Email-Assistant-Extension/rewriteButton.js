// ------------------- Rewrite Button -------------------

// Create "Rewrite with AI" button
function createRewriteButton() {
    const button = document.createElement("div");
    button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3 ai-rewrite-button";
    button.innerHTML = "AI Rewrite";
    button.setAttribute("role", "button");
    button.setAttribute("data-tooltip", "Rewrite selected text with AI");
    return button;
  }
  
  // Inject Rewrite button + popup into Gmail toolbar
function injectRewriteButton(toolbar, getEmailContent) {
    if (toolbar.querySelector(".ai-rewrite-button")) return;
  
    const button = createRewriteButton();
  
    button.addEventListener("click", () => {
      // Remove old popup if one exists
      const oldPopup = toolbar.querySelector(".ai-rewrite-popup");
      if (oldPopup) oldPopup.remove();
  
      // Create popup
      const popup = document.createElement("div");
      popup.className = "ai-rewrite-popup";
      popup.innerHTML = `
        <textarea id="rewriteInput" placeholder="Type what you want to say..." rows="5" cols="40"></textarea>
        <br>
        <button id="sendToAI">Rewrite</button>
        <button id="cancelRewrite" class="cancel-btn">Cancel</button>
      `;
  
      toolbar.appendChild(popup);
    
      // ESC key closes popup
    const escListener = (event) => {
        if (event.key === "Escape") {
          popup.remove();
          document.removeEventListener("keydown", escListener); // cleanup
        }
      };
      document.addEventListener("keydown", escListener);
      
      // Cancel closes popup
      popup.querySelector("#cancelRewrite").addEventListener("click", () => popup.remove());
  
      // Handle rewrite
      const sendBtn = popup.querySelector("#sendToAI");
      sendBtn.addEventListener("click", async () => {
        const userInput = popup.querySelector("#rewriteInput").value.trim();
        if (!userInput) {
          alert("Please type what you want your email to say.");
          return;
        }
  
        try {
          sendBtn.innerHTML = "Generating...";
          sendBtn.disabled = true;
  
          const emailContent = getEmailContent();
          const response = await fetch("http://localhost:8080/api/email/wantedContent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailContent, wantedContent: userInput }),
          });
  
          if (!response.ok) throw new Error("API Request Failed");
          const rewrittenText = await response.text();
  
          const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
          if (composeBox) {
            composeBox.focus();
            composeBox.innerHTML = rewrittenText;
          }
  
          popup.remove();
        } catch (err) {
          console.error(err);
          alert("Failed to rewrite text");
        } finally {
          if (popup.isConnected) {
            sendBtn.innerHTML = "Rewrite";
            sendBtn.disabled = false;
          }
        }
      });
    });
  
    toolbar.insertBefore(button, toolbar.firstChild);
  }