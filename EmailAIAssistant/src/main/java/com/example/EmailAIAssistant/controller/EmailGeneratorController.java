package com.example.EmailAIAssistant.controller;

import com.example.EmailAIAssistant.model.EmailRequest;
import com.example.EmailAIAssistant.service.EmailGeneratorService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Marks this class as a REST controller, so it can handle HTTP requests and return JSON/text responses
@RestController
// Base path for all endpoints inside this controller: "/api/email"
@RequestMapping("/api/email")
// Lombok annotation: generates a constructor with required arguments (final fields are injected automatically)
@AllArgsConstructor
// Allow requests coming from Gmail's domain (useful if you’re embedding/testing inside Gmail)
@CrossOrigin(origins = "https://mail.google.com")
public class EmailGeneratorController {

    // Inject the service layer where the AI logic lives
    private final EmailGeneratorService emailGeneratorService;

    // Endpoint: POST /api/email/generateAutomaticResponse
    // Takes in an EmailRequest object, builds a response automatically using AI
    @PostMapping("/generateAutomaticResponse")
    public ResponseEntity<String> generateAutomaticEmail(@RequestBody EmailRequest emailRequest) {
        // Call the service to generate an automatic reply using the email content
        String response = emailGeneratorService.generateAutomaticResponse(emailRequest.getEmailContent());

        // Return the AI-generated reply wrapped in a 200 OK response
        return ResponseEntity.ok(response);
    }

    // Endpoint: POST /api/email/wantedContent
    // Takes in an EmailRequest object, where user provides a "wantedContent" draft
    @PostMapping("/wantedContent")
    public ResponseEntity<String> generateWantedResponse(@RequestBody EmailRequest emailRequest) {
        String response = emailGeneratorService.generateWantedResponse(emailRequest);

        // Return the AI-polished reply wrapped in a 200 OK response
        return ResponseEntity.ok(response);
    }
}