package com.rugved.paymentProject.controller;

import com.rugved.paymentProject.dto.ApiResponse;
import com.rugved.paymentProject.dto.QRCodeRequest;
import com.rugved.paymentProject.dto.QRCodeResponse;
import com.rugved.paymentProject.service.QRCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/qr")
@RequiredArgsConstructor
@Tag(name = "QR Code", description = "QR Code generation and parsing APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class QRCodeController {

    private final QRCodeService qrCodeService;

    @GetMapping("/generate/static")
    @Operation(summary = "Generate static QR code", description = "Generate a static QR code with user's primary VPA")
    public ResponseEntity<ApiResponse> generateStaticQR(Authentication authentication) {
        String email = authentication.getName();
        QRCodeResponse qrCode = qrCodeService.generateStaticQR(email);
        return ResponseEntity.ok(ApiResponse.success("QR code generated successfully", qrCode));
    }

    @PostMapping("/generate/dynamic")
    @Operation(summary = "Generate dynamic QR code", description = "Generate a dynamic QR code with VPA, amount, and description")
    public ResponseEntity<ApiResponse> generateDynamicQR(
            @RequestBody QRCodeRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        QRCodeResponse qrCode = qrCodeService.generateDynamicQR(
                email,
                request.getAmount(),
                request.getDescription()
        );
        return ResponseEntity.ok(ApiResponse.success("QR code generated successfully", qrCode));
    }

    @PostMapping("/parse")
    @Operation(summary = "Parse QR code data", description = "Parse scanned QR code data and extract payment information")
    public ResponseEntity<ApiResponse> parseQRData(@RequestBody String qrData) {
        QRCodeResponse parsedData = qrCodeService.parseQRData(qrData);
        return ResponseEntity.ok(ApiResponse.success("QR code parsed successfully", parsedData));
    }
}
