package com.strive.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddressDTO {
    private Integer id;
    private Integer userId;

    @NotBlank(message = "Name is required")
    @Size(max = 25, message = "Name must not exceed 25 characters")
    private String name;

    @NotBlank(message = "Recipient name is required")
    @Size(max = 25, message = "Recipient name must not exceed 25 characters")
    private String recipientName;

    @NotBlank(message = "Recipient phone is required")
    @Size(max = 25, message = "Recipient phone must not exceed 25 characters")
    private String recipientPhone;

    @NotBlank(message = "Street address is required")
    @Size(max = 255, message = "Street address must not exceed 255 characters")
    private String streetAddress;

    @NotBlank(message = "City is required")
    @Size(max = 25, message = "City must not exceed 25 characters")
    private String city;

    @Size(max = 25, message = "State must not exceed 25 characters")
    private String state;

    @Size(max = 25, message = "Postal code must not exceed 25 characters")
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(max = 25, message = "Country must not exceed 25 characters")
    private String country;

    private boolean isDefault;
}
