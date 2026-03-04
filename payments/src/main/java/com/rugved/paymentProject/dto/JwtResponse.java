package com.rugved.paymentProject.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private List<String> roles;

    public JwtResponse(String jwt, Long id, String email, List<String> roles) {
        this.token = jwt;
        this.type = "Bearer";
        this.id = id;
        this.email = email;
        this.roles = roles;
    }
}
