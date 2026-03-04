package com.rugved.paymentProject.service.impl;

import com.rugved.paymentProject.dto.VpaRequest;
import com.rugved.paymentProject.model.BankAccount;
import com.rugved.paymentProject.model.VirtualPaymentAddress;
import com.rugved.paymentProject.repository.BankAccountRepository;
import com.rugved.paymentProject.repository.VpaRepository;
import com.rugved.paymentProject.service.VpaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VpaServiceImpl implements VpaService {

    private final VpaRepository vpaRepository;
    private final com.rugved.paymentProject.repository.WalletRepository walletRepository;
    private final com.rugved.paymentProject.repository.UserRepository userRepository;

    @Override
    @Transactional
    public VirtualPaymentAddress createVpa(VpaRequest vpaRequest, Long userId) {
        if (vpaRepository.existsByVpa(vpaRequest.getVpa())) {
            throw new com.rugved.paymentProject.exception.BusinessException("VPA already exists", 
                com.rugved.paymentProject.exception.BusinessException.ErrorCodes.VPA_ALREADY_EXISTS);
        }

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new com.rugved.paymentProject.exception.BusinessException("User not found", 
                    com.rugved.paymentProject.exception.BusinessException.ErrorCodes.USER_NOT_FOUND));

        var wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new com.rugved.paymentProject.exception.BusinessException("Wallet not found", 
                    com.rugved.paymentProject.exception.BusinessException.ErrorCodes.WALLET_NOT_FOUND));

        VirtualPaymentAddress vpa = VirtualPaymentAddress.builder()
                .vpa(vpaRequest.getVpa())
                .isPrimary(vpaRequest.getIsPrimary())
                .user(user)
                .wallet(wallet)
                .build();

        // If setting as primary, remove primary status from other VPAs
        if (vpaRequest.getIsPrimary()) {
            vpaRepository.findByUserIdAndIsPrimaryTrue(userId).ifPresent(existingPrimary -> {
                existingPrimary.setIsPrimary(false);
                vpaRepository.save(existingPrimary);
            });
        }
        
        return vpaRepository.save(vpa);
    }

    @Override
    public List<VirtualPaymentAddress> getUserVpas(Long userId) {
        return vpaRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public VirtualPaymentAddress setPrimaryVpa(String vpa, Long userId) {
        VirtualPaymentAddress vpaEntity = vpaRepository.findByVpa(vpa)
                .orElseThrow(() -> new RuntimeException("VPA not found"));

        if (!vpaEntity.getUser().getId().equals(userId)) {
            throw new RuntimeException("VPA does not belong to user");
        }
        vpaRepository.findByUserIdAndIsPrimaryTrue(userId).ifPresent(existingPrimary -> {
            existingPrimary.setIsPrimary(false);
            vpaRepository.save(existingPrimary);
        });
        vpaEntity.setIsPrimary(true);
        return vpaRepository.save(vpaEntity);
    }

    @Override
    public boolean checkVpaAvailability(String vpa) {
        return !vpaRepository.existsByVpa(vpa);
    }

    @Override
    @Transactional
    public boolean deleteVpa(String vpa, Long userId) {
        Optional<VirtualPaymentAddress> vpaEntity = vpaRepository.findByVpa(vpa);
        if (vpaEntity.isPresent() && vpaEntity.get().getUser().getId().equals(userId)) {
            vpaRepository.delete(vpaEntity.get());
            return true;
        }
        return false;
    }

    @Override
    public Optional<VirtualPaymentAddress> getVpaByAddress(String vpa) {
        return vpaRepository.findByVpa(vpa);
    }
}
