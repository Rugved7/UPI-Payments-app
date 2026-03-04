package com.rugved.paymentProject.controller;

import com.rugved.paymentProject.dto.ApiResponse;
import com.rugved.paymentProject.model.Wallet;
import com.rugved.paymentProject.security.UserPrincipal;
import com.rugved.paymentProject.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<ApiResponse> getWallet(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Wallet wallet = walletService.getWalletByUserId(userPrincipal.getId());
            
            // Create a DTO to avoid lazy loading issues
            var walletData = new WalletDTO(
                wallet.getId(),
                wallet.getBalance(),
                wallet.getDailyLimit(),
                wallet.getPerTransactionLimit(),
                wallet.getDailySpent(),
                wallet.getIsActive()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Wallet retrieved successfully", walletData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    record WalletDTO(
        Long id,
        java.math.BigDecimal balance,
        java.math.BigDecimal dailyLimit,
        java.math.BigDecimal perTransactionLimit,
        java.math.BigDecimal dailySpent,
        Boolean isActive
    ) {}

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse> getBalance(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            BigDecimal balance = walletService.getBalance(userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("Balance retrieved successfully", balance));
        } catch (Exception e) {
            // If wallet doesn't exist, create it
            try {
                walletService.createWallet(userPrincipal.getId());
                BigDecimal balance = walletService.getBalance(userPrincipal.getId());
                return ResponseEntity.ok(ApiResponse.success("Wallet created and balance retrieved", balance));
            } catch (Exception ex) {
                return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
            }
        }
    }
}
