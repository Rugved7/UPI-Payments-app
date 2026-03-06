package com.rugved.paymentProject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRCodeRequest {
    private String vpa;
    private BigDecimal amount;
    private String description;
}
