package com.rugved.paymentProject.controller;

import com.rugved.paymentProject.dto.ApiResponse;
import com.rugved.paymentProject.security.UserPrincipal;
import com.rugved.paymentProject.service.UPIPinService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/upi-pin")
@RequiredArgsConstructor
public class UPIController {

    private final UPIPinService upiPinService;

    @PostMapping("/set")
    public ResponseEntity<ApiResponse> setUPIPin(@RequestParam @NotBlank @Size(min = 4, max = 4)
                                                 @Pattern(regexp = "\\d{4}") String upiPin, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            upiPinService.setUPIPin(userPrincipal.getId(), upiPin);
            return ResponseEntity.ok(ApiResponse.success("UPI Pin Set Successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/change")
    public ResponseEntity<ApiResponse> changeUPIPin(
            @RequestParam @NotBlank @Size(min = 4, max = 4) @Pattern(regexp = "\\d{4}") String oldPin,
            @RequestParam @NotBlank @Size(min = 4, max = 4) @Pattern(regexp = "\\d{4}") String newPin,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            upiPinService.changeUPIPin(userPrincipal.getId(), oldPin, newPin);
            return ResponseEntity.ok(ApiResponse.success("UPI PIN changed successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse> validateUPIPin(
            @RequestParam @NotBlank @Size(min = 4, max = 4) @Pattern(regexp = "\\d{4}") String upiPin,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            boolean isValid = upiPinService.validateUPIPin(userPrincipal.getId(), upiPin);
            return ResponseEntity.ok(ApiResponse.success("UPI PIN validation result", isValid));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
