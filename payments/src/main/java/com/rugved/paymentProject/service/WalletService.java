package com.rugved.paymentProject.service;

import com.rugved.paymentProject.model.Wallet;

import java.math.BigDecimal;

public interface WalletService {
    Wallet createWallet(Long userId);
    Wallet getWalletByUserId(Long userId);
    BigDecimal getBalance(Long userId);
    void updateDailyLimit(Long userId, BigDecimal newLimit);
    void updatePerTransactionLimit(Long userId, BigDecimal newLimit);
    void resetDailySpent();
}
