// ------------------- Auto Reply Button -------------------

// Create "AUTO Reply" button
function createAIButton() {
  const button = document.createElement("div"); // Create a new <div> element to act as a button
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button"; // Apply Gmail toolbar styles + custom class
  button.innerHTML = "AUTO Reply"; // Set the visible text of the button
  button.setAttribute("role", "button"); // Set ARIA role for accessibility
  button.setAttribute("data-tooltip", "Generate AI Reply"); // Tooltip shown on hover
  return button; // Return the button element for later insertion
}

// Inject AUTO Reply button into Gmail toolbar
function injectAutoReplyButton(toolbar, getEmailContent) {
  if (toolbar.querySelector(".ai-reply-button")) return; // Avoid adding duplicate buttons

  const button = createAIButton(); // Create the AUTO Reply button

  // Add click event listener for the button
  button.addEventListener("click", async () => {
    try {
      button.innerHTML = "Generating..."; // Show loading state
      button.disabled = true; // Disable button while processing

      const emailContent = getEmailContent(); // Grab current email content from Gmail

      // Send email content to backend API to generate automatic reply
      const response = await fetch("http://localhost:8080/api/email/generateAutomaticResponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Set request content type
        body: JSON.stringify({ emailContent, wantedContent: "" }), // Send email content in request body
      });

      if (!response.ok) throw new Error("API Request Failed"); // Throw error if API fails
      const generatedReply = await response.text(); // Get the AI-generated reply as text
      
      if(response.ok){
        console.log("successfully Request Auto Reply!"); // Log success to console
      }

      // Find Gmail compose box to insert generated reply
      const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
      if (composeBox) {
        composeBox.focus(); // Focus the compose box
        composeBox.innerHTML = generatedReply; // Insert AI-generated reply into compose box
      }
    } catch (err) {
      console.error(err); // Log any errors to console
      alert("Failed to generate reply"); // Show alert if something goes wrong
    } finally {
      button.innerHTML = "AUTO Reply"; // Reset button text
      button.disabled = false; // Re-enable the button
    }
  });

  toolbar.insertBefore(button, toolbar.firstChild); // Insert button at the left-most side of toolbar
}