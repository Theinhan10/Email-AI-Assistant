package com.example.EmailAIAssistant.model;

import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;
    private String wantedContent;
}
