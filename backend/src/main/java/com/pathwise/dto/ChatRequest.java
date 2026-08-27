package com.pathwise.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private Boolean isSearchGrounded;
    private String searchFocus; // "WEB", "ACADEMIC", "ROADMAP", "CODE"
}
