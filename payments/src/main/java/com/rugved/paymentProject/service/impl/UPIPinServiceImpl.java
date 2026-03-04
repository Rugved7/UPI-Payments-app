package com.rugved.paymentProject.service.impl;

import com.rugved.paymentProject.model.User;
import com.rugved.paymentProject.repository.UserRepository;
import com.rugved.paymentProject.service.UPIPinService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UPIPinServiceImpl implements UPIPinService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void setUPIPin(Long userId, String upiPin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (upiPin.length() != 4 || !upiPin.matches("\\d{4}")) {
            throw new RuntimeException("UPI Pin must be 4 digits");
        }

        if (user.getUpiPinHash() != null) {
            throw new RuntimeException("UPI Pin already set. Use change PIN endpoint to update.");
        }

        user.setUpiPinHash(passwordEncoder.encode(upiPin));
        userRepository.save(user);
    }

    @Override
    public boolean validateUPIPin(Long userId, String upiPin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getUpiPinHash() == null) {
            throw new RuntimeException("UPI Pin not set. Please set your UPI Pin first.");
        }

        return passwordEncoder.matches(upiPin, user.getUpiPinHash());
    }

    @Override
    @Transactional
    public void changeUPIPin(Long userId, String oldPin, String newPin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getUpiPinHash() == null) {
            throw new RuntimeException("UPI Pin not set. Please set your UPI Pin first.");
        }

        if (!validateUPIPin(userId, oldPin)) {
            throw new RuntimeException("Invalid current UPI Pin");
        }

        if (newPin.length() != 4 || !newPin.matches("\\d{4}")) {
            throw new RuntimeException("New UPI Pin must be 4 digits");
        }

        user.setUpiPinHash(passwordEncoder.encode(newPin));
        userRepository.save(user);
    }
}
