package com.rugved.paymentProject.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VpaRequest {

    @JsonProperty("vpa")
    @NotBlank(message = "VPA is Required")
    @Size(min = 3, max = 50, message = "VPA must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$", message = "VPA format should be username@bank")
    private String vpa;

    @JsonProperty("isPrimary")
    private Boolean isPrimary = false;
}
