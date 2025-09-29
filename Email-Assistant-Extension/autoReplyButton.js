// ------------------- Auto Reply Button -------------------

// Create "AUTO Reply" button
function createAIButton() {
    const button = document.createElement("div");
    button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button";
    button.innerHTML = "AUTO Reply";
    button.setAttribute("role", "button");
    button.setAttribute("data-tooltip", "Generate AI Reply");
    return button;
  }
  
  // Inject AUTO Reply button into Gmail toolbar
function injectAutoReplyButton(toolbar, getEmailContent) {
    if (toolbar.querySelector(".ai-reply-button")) return;
  
    const button = createAIButton();
  
    button.addEventListener("click", async () => {
      try {
        button.innerHTML = "Generating...";
        button.disabled = true;
  
        const emailContent = getEmailContent();
        const response = await fetch("http://localhost:8080/api/email/generateAutomaticResponse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailContent, wantedContent: "" }),
        });
  
        if (!response.ok) throw new Error("API Request Failed");
        const generatedReply = await response.text();
  
        const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
        if (composeBox) {
          composeBox.focus();
          composeBox.innerHTML = generatedReply;
        }
      } catch (err) {
        console.error(err);
        alert("Failed to generate reply");
      } finally {
        button.innerHTML = "AUTO Reply";
        button.disabled = false;
      }
    });
  
    toolbar.insertBefore(button, toolbar.firstChild);
  }