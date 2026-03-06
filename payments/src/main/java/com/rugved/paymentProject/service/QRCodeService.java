package com.rugved.paymentProject.service;

import com.rugved.paymentProject.dto.QRCodeResponse;

import java.math.BigDecimal;

public interface QRCodeService {
    QRCodeResponse generateStaticQR(String email);
    QRCodeResponse generateDynamicQR(String email, BigDecimal amount, String description);
    QRCodeResponse parseQRData(String qrData);
}
