package com.rugved.paymentProject.service.impl;

import com.rugved.paymentProject.exception.BusinessException;
import com.rugved.paymentProject.model.User;
import com.rugved.paymentProject.model.Wallet;
import com.rugved.paymentProject.repository.UserRepository;
import com.rugved.paymentProject.repository.WalletRepository;
import com.rugved.paymentProject.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Wallet createWallet(Long userId) {
        if (walletRepository.existsByUserId(userId)) {
            throw new BusinessException("Wallet already exists for this user", BusinessException.ErrorCodes.WALLET_ALREADY_EXISTS);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found", BusinessException.ErrorCodes.USER_NOT_FOUND));

        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(new BigDecimal("10000.00"))
                .isActive(true)
                .dailyLimit(new BigDecimal("100000.00"))
                .perTransactionLimit(new BigDecimal("50000.00"))
                .dailySpent(BigDecimal.ZERO)
                .lastResetDate(LocalDateTime.now())
                .build();

        return walletRepository.save(wallet);
    }

    @Override
    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Wallet not found", BusinessException.ErrorCodes.WALLET_NOT_FOUND));
    }

    @Override
    public BigDecimal getBalance(Long userId) {
        Wallet wallet = getWalletByUserId(userId);
        return wallet.getBalance();
    }

    @Override
    @Transactional
    public void updateDailyLimit(Long userId, BigDecimal newLimit) {
        Wallet wallet = getWalletByUserId(userId);
        wallet.setDailyLimit(newLimit);
        walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public void updatePerTransactionLimit(Long userId, BigDecimal newLimit) {
        Wallet wallet = getWalletByUserId(userId);
        wallet.setPerTransactionLimit(newLimit);
        walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public void resetDailySpent() {
        List<Wallet> wallets = walletRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        for (Wallet wallet : wallets) {
            if (wallet.getLastResetDate() == null || 
                wallet.getLastResetDate().toLocalDate().isBefore(now.toLocalDate())) {
                wallet.resetDailyLimit();
                walletRepository.save(wallet);
            }
        }
        log.info("Daily spending limits reset for {} wallets", wallets.size());
    }
}
