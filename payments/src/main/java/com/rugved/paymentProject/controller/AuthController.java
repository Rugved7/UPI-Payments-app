package com.rugved.paymentProject.controller;

import com.rugved.paymentProject.dto.ApiResponse;
import com.rugved.paymentProject.dto.SignupRequest;
import com.rugved.paymentProject.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        if(authService.existsByEmail(signupRequest.getEmail())){
            return ResponseEntity.badRequest().body(ApiResponse.error("Email already in use"));
        }
        if(authService.existsByPhone(signupRequest.getPhone())){
            return ResponseEntity.badRequest().body(ApiResponse.error("Phone already in use"));
        }
        var user = authService.registerUser(signupRequest);
        return ResponseEntity.ok().body(ApiResponse.success("User registered successfully", user));
    }

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse> checkEmailActivity(@RequestParam String email){
        boolean avaliable = !authService.existsByEmail(email);
        return ResponseEntity.ok().body(ApiResponse.success("Email avaliablity checked", avaliable));
    }

    @GetMapping("/check-phone")
    public ResponseEntity<ApiResponse> checkPhoneAvailability(@RequestParam String phone) {
        boolean available = !authService.existsByPhone(phone);
        return ResponseEntity.ok()
                .body(ApiResponse.success("Phone availability checked", available));
    }
}
