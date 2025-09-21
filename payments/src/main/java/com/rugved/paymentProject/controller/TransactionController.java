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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/transaction")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    public CompletableFuture<ResponseEntity<ApiResponse>> initiateTransfer(@Valid @RequestBody TransactionRequest request,
                                                                           @AuthenticationPrincipal UserPrincipal userPrincipal) {

        return transactionService.initiateTransaction(request, userPrincipal.getId())
                .thenApply(transactionResponse -> {
                    if (transactionResponse.getStatus() == Transaction.TransactionStatus.SUCCESS) {
                        return ResponseEntity.ok(ApiResponse.success("Transaction completed successfully", transactionResponse));
                    } else {
                        return ResponseEntity.badRequest().body(ApiResponse.error("Transaction failed : " + transactionResponse.getDescription()));
                    }
                });
    }

}
