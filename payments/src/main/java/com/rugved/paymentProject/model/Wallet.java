package com.rugved.paymentProject.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Builder.Default
    @Column(name = "balance", precision = 15, scale = 2, nullable = false)
    private BigDecimal balance = new BigDecimal("10000.00");

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "daily_limit", precision = 15, scale = 2)
    private BigDecimal dailyLimit = new BigDecimal("100000.00");

    @Builder.Default
    @Column(name = "per_transaction_limit", precision = 15, scale = 2)
    private BigDecimal perTransactionLimit = new BigDecimal("50000.00");

    @Builder.Default
    @Column(name = "daily_spent", precision = 15, scale = 2)
    private BigDecimal dailySpent = BigDecimal.ZERO;

    @Column(name = "last_reset_date")
    private LocalDateTime lastResetDate;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean canTransact(BigDecimal amount) {
        if (!isActive) return false;
        if (balance.compareTo(amount) < 0) return false;
        if (amount.compareTo(perTransactionLimit) > 0) return false;
        if (dailySpent.add(amount).compareTo(dailyLimit) > 0) return false;
        return true;
    }

    public void debit(BigDecimal amount) {
        this.balance = this.balance.subtract(amount);
        this.dailySpent = this.dailySpent.add(amount);
    }

    public void credit(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }

    public void resetDailyLimit() {
        this.dailySpent = BigDecimal.ZERO;
        this.lastResetDate = LocalDateTime.now();
    }
}
