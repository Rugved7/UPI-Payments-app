package com.rugved.paymentProject.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "virtual_payment_address", uniqueConstraints = {
        @UniqueConstraint(columnNames = "vpa")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VirtualPaymentAddress  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 50)
    @Pattern(regexp = "^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$", message = "VPA format should be username@bank")
    @Column(unique = true, nullable = false)
    private String vpa;

    @Builder.Default
    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Builder.Default
    @Column(name = "is_verified")
    private Boolean isVerified = true;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
