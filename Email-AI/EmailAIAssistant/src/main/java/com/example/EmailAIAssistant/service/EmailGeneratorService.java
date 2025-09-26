package com.example.EmailAIAssistant.service;

import com.example.EmailAIAssistant.model.EmailRequest;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;

@Service // Marks this class as a Spring service (Spring will manage its lifecycle and make it injectable)
public class EmailGeneratorService {

    // This is the AI model (OpenAI) that Spring will inject for us
    private final OpenAiChatModel chatModel;

    // Constructor: Spring automatically provides (injects) the OpenAiChatModel bean when creating this service
    public EmailGeneratorService(OpenAiChatModel chatModel) {
        this.chatModel = chatModel;
    }

    // Method that generates an automatic response using the AI
    public String generateAutomaticResponse(String prompt) {
        // Build a structured prompt from the raw email content
        String finalPrompt = buildPrompt(prompt);

        // Call the AI model with the prompt and configuration (model type)
        ChatResponse response = chatModel.call(
                new Prompt(
                        finalPrompt, // The actual text we want to send to the AI
                        OpenAiChatOptions.builder()
                                .model("gpt-4o") // Specify which AI model to use
                                .build()
                ));

        // Extract and return the generated text from the AI response
        return response.getResult().getOutput().getText();
    }

    // Method where the AI helps polish and reword a reply idea provided by the user
    public String generateWantedResponse(EmailRequest emailRequest) {
        // Build a prompt that uses both the original email and the user’s rough draft
        String finalPrompt = buildWantedResponsePrompt(emailRequest);

        // Call the AI model with the constructed prompt
        ChatResponse response = chatModel.call(
                new Prompt(
                        finalPrompt,
                        OpenAiChatOptions.builder()
                                .model("gpt-4o") // Again, specify the AI model
                                .build()
                ));

        // Extract and return the polished reply text
        return response.getResult().getOutput().getText();
    }

    // Helper method to build a clean, controlled prompt for auto-responses
    private String buildPrompt(String emailContent) {
        StringBuilder prompt = new StringBuilder();

        // Tell the AI how to behave and what style to use
        prompt.append("You are helping me write professional email replies. ");
        prompt.append("Only generate the reply body text (no subject line, no greeting like 'Dear ...', no sign-off). ");
        prompt.append("Keep the reply concise and professional. ");
        prompt.append("Do not add filler phrases like 'Thank you for your prompt response' unless I explicitly ask. ");
        prompt.append("Focus only on addressing the content of the email.\n\n");

        // Provide the original email text that we want a response to
        prompt.append("Original email:\n").append(emailContent).append("\n\n");

        // Instruction for the AI to write a professional reply
        prompt.append("Now write my professional reply to this email.");

        // Return the full prompt as a string
        return prompt.toString();
    }

    // Helper method to build a prompt where the user provides their rough draft idea for the reply
    private String buildWantedResponsePrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();

        // General instructions to the AI
        prompt.append("You are helping me write professional email replies. ");
        prompt.append("Use my rough draft/idea as the basis of the reply. ");
        prompt.append("Polish the language, improve clarity, and keep it professional. ");
        prompt.append("Do not add filler phrases like 'Thank you for your prompt response' unless I explicitly ask. ");
        prompt.append("Do not include a subject line. ");
        prompt.append("Only output the body of the email reply. ");
        prompt.append("Stay close to the meaning of my rough draft/idea, but make it sound natural and professional.\n\n");

        // Give the AI context: the original email received
        prompt.append("Original email:\n").append(emailRequest.getEmailContent()).append("\n\n");

        // Add the user’s rough draft idea for the reply
        prompt.append("My rough idea of the reply:\n")
                .append(emailRequest.getWantedContent()).append("\n\n");

        // Final instruction: polish and rewrite the rough draft
        prompt.append("Now write a professional reply using my wantedContent.");

        // Return the completed prompt string
        return prompt.toString();
    }
}
