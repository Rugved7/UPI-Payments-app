package com.rugved.paymentProject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRCodeResponse {
    private String qrData;
    private String qrImage; // Base64 encoded image
    private String vpa;
    private String name;
    private BigDecimal amount;
    private String description;
}
