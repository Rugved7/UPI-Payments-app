package com.rugved.paymentProject.controller;

import com.rugved.paymentProject.dto.ApiResponse;
import com.rugved.paymentProject.dto.VpaRequest;
import com.rugved.paymentProject.dto.VpaResponse;
import com.rugved.paymentProject.model.VirtualPaymentAddress;
import com.rugved.paymentProject.security.UserPrincipal;
import com.rugved.paymentProject.service.VpaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/vpa")
@RequiredArgsConstructor
public class VpaController {

    private final VpaService vpaService;

    @PostMapping
    public ResponseEntity<ApiResponse> createVpa(
            @Valid @RequestBody VpaRequest vpaRequest,
            @AuthenticationPrincipal UserPrincipal userprincipal) {

        try {
            VirtualPaymentAddress vpa = vpaService.createVpa(vpaRequest, userprincipal.getId());
            VpaResponse response = VpaResponse.fromEntity(vpa);
            return ResponseEntity.ok(ApiResponse.success("VPA Created Successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getUserVpas(@AuthenticationPrincipal UserPrincipal userprincipal) {
        List<VirtualPaymentAddress> vpas = vpaService.getUserVpas(userprincipal.getId());
        List<VpaResponse> response = vpas.stream()
                .map(VpaResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("User VPAs Retrieved", response));
    }

    @PatchMapping("/{vpa}/primary")
    public ResponseEntity<ApiResponse> setPrimaryVpa(
            @PathVariable String vpa,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            VirtualPaymentAddress updatedVpa = vpaService.setPrimaryVpa(vpa, userPrincipal.getId());
            VpaResponse response = VpaResponse.fromEntity(updatedVpa);
            return ResponseEntity.ok(ApiResponse.success("Primary VPA updated", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/check-availability")
    public ResponseEntity<ApiResponse> checkVpaAvailability(@RequestParam String vpa) {
        boolean available = vpaService.checkVpaAvailability(vpa);
        return ResponseEntity.ok(ApiResponse.success("VPA availability checked", available));
    }

    @DeleteMapping("/{vpa}")
    public ResponseEntity<ApiResponse> deleteVpa(
            @PathVariable String vpa,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        boolean deleted = vpaService.deleteVpa(vpa, userPrincipal.getId());
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success("VPA deleted successfully", null));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to delete VPA"));
        }
    }
}
