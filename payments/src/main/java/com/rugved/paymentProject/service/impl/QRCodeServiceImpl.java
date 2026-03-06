package com.rugved.paymentProject.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.rugved.paymentProject.dto.QRCodeResponse;
import com.rugved.paymentProject.exception.BusinessException;
import com.rugved.paymentProject.model.User;
import com.rugved.paymentProject.model.VirtualPaymentAddress;
import com.rugved.paymentProject.repository.UserRepository;
import com.rugved.paymentProject.repository.VpaRepository;
import com.rugved.paymentProject.service.QRCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QRCodeServiceImpl implements QRCodeService {

    private final UserRepository userRepository;
    private final VpaRepository vpaRepository;
    private final ObjectMapper objectMapper;

    private static final int QR_CODE_SIZE = 300;

    @Override
    public QRCodeResponse generateStaticQR(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "User not found"));

        VirtualPaymentAddress primaryVpa = vpaRepository.findByUserAndIsPrimary(user, true)
                .orElseThrow(() -> new BusinessException("NO_PRIMARY_VPA", "No primary VPA found. Please create a VPA first."));

        Map<String, Object> qrData = new HashMap<>();
        qrData.put("vpa", primaryVpa.getVpa());
        qrData.put("name", user.getFirstName() + " " + user.getLastName());
        qrData.put("type", "static");

        try {
            String qrDataString = objectMapper.writeValueAsString(qrData);
            String qrImage = generateQRCodeImage(qrDataString);

            QRCodeResponse response = new QRCodeResponse();
            response.setQrData(qrDataString);
            response.setQrImage(qrImage);
            response.setVpa(primaryVpa.getVpa());
            response.setName(user.getFirstName() + " " + user.getLastName());
            response.setAmount(null);
            response.setDescription(null);

            return response;
        } catch (Exception e) {
            throw new BusinessException("QR_GENERATION_FAILED", "Failed to generate QR code: " + e.getMessage());
        }
    }

    @Override
    public QRCodeResponse generateDynamicQR(String email, BigDecimal amount, String description) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "User not found"));

        VirtualPaymentAddress primaryVpa = vpaRepository.findByUserAndIsPrimary(user, true)
                .orElseThrow(() -> new BusinessException("NO_PRIMARY_VPA", "No primary VPA found. Please create a VPA first."));

        Map<String, Object> qrData = new HashMap<>();
        qrData.put("vpa", primaryVpa.getVpa());
        qrData.put("name", user.getFirstName() + " " + user.getLastName());
        qrData.put("amount", amount);
        qrData.put("description", description);
        qrData.put("type", "dynamic");

        try {
            String qrDataString = objectMapper.writeValueAsString(qrData);
            String qrImage = generateQRCodeImage(qrDataString);

            QRCodeResponse response = new QRCodeResponse();
            response.setQrData(qrDataString);
            response.setQrImage(qrImage);
            response.setVpa(primaryVpa.getVpa());
            response.setName(user.getFirstName() + " " + user.getLastName());
            response.setAmount(amount);
            response.setDescription(description);

            return response;
        } catch (Exception e) {
            throw new BusinessException("QR_GENERATION_FAILED", "Failed to generate QR code: " + e.getMessage());
        }
    }

    @Override
    public QRCodeResponse parseQRData(String qrData) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(qrData, Map.class);

            QRCodeResponse response = new QRCodeResponse();
            response.setQrData(qrData);
            response.setVpa((String) data.get("vpa"));
            response.setName((String) data.get("name"));
            
            if (data.get("amount") != null) {
                response.setAmount(new BigDecimal(data.get("amount").toString()));
            }
            
            response.setDescription((String) data.get("description"));

            return response;
        } catch (Exception e) {
            throw new BusinessException("INVALID_QR_DATA", "Invalid QR code data");
        }
    }

    private String generateQRCodeImage(String data) throws WriterException, IOException {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1);

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, QR_CODE_SIZE, QR_CODE_SIZE, hints);

        BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "PNG", outputStream);
        byte[] imageBytes = outputStream.toByteArray();

        return Base64.getEncoder().encodeToString(imageBytes);
    }
}
