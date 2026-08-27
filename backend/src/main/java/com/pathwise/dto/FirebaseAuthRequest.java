package com.pathwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirebaseAuthRequest {
    private String email;
    private String displayName;
    private String photoUrl;
    private String idToken;
    private String uid;
}
