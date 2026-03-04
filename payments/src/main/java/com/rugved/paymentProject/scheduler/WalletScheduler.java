package com.rugved.paymentProject.scheduler;

import com.rugved.paymentProject.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class WalletScheduler {

    private final WalletService walletService;

    // Reset daily spending limits at midnight every day
    @Scheduled(cron = "0 0 0 * * *")
    public void resetDailyLimits() {
        log.info("Starting daily limit reset job");
        walletService.resetDailySpent();
        log.info("Daily limit reset job completed");
    }
}
