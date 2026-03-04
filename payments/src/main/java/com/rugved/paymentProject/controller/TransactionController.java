package com.rugved.paymentProject.controller;

import com.rugved.paymentProject.dto.ApiResponse;
import com.rugved.paymentProject.dto.TransactionRequest;
import com.rugved.paymentProject.dto.TransactionResponse;
import com.rugved.paymentProject.model.Transaction;
import com.rugved.paymentProject.security.UserPrincipal;
import com.rugved.paymentProject.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transaction")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse> initiateTransfer(@Valid @RequestBody TransactionRequest request,
                                                        @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            TransactionResponse transactionResponse = transactionService.initiateTransaction(request, userPrincipal.getId()).get();
            
            if (transactionResponse.getStatus() == Transaction.TransactionStatus.SUCCESS) {
                return ResponseEntity.ok(ApiResponse.success("Transaction completed successfully", transactionResponse));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Transaction failed: " + transactionResponse.getDescription()));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Transaction failed: " + e.getMessage()));
        }
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<ApiResponse> getTransactionId(@PathVariable String transactionId,
                                                        @AuthenticationPrincipal UserPrincipal userPrincipal) {

        try {
            TransactionResponse transaction = transactionService.getTransaction(transactionId, userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("Transaction retireved", transaction));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse> getTransactionHistory(@AuthenticationPrincipal UserPrincipal userprincipal) {
        try {
            List<TransactionResponse> transactions = transactionService.getUserTransactions(userprincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("Transaction history retrieved", transactions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/status/{transactionId}")
    public ResponseEntity<ApiResponse> getTransactionStatus(@PathVariable String transactionId,
                                                            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            TransactionResponse transaction = transactionService.getTransaction(transactionId, userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("Transaction Status", new TransactionStatusResponse(transaction.getTransactionId(), transaction.getStatus())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    private record TransactionStatusResponse(String transactionId, Transaction.TransactionStatus status) {
    }   
}
