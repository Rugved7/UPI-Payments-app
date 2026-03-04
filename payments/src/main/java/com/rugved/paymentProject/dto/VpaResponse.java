package com.rugved.paymentProject.dto;

import com.rugved.paymentProject.model.VirtualPaymentAddress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VpaResponse {
    private Long id;
    private String vpa;
    private Boolean isPrimary;
    private Boolean isVerified;
    private LocalDateTime createdAt;

    public static VpaResponse fromEntity(VirtualPaymentAddress vpa) {
        return VpaResponse.builder()
                .id(vpa.getId())
                .vpa(vpa.getVpa())
                .isPrimary(vpa.getIsPrimary())
                .isVerified(vpa.getIsVerified())
                .createdAt(vpa.getCreatedAt())
                .build();
    }
}
