package com.strive.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderAddressDTO {
    private Integer id;
    private String name;
    private String recipientName;
    private String recipientPhone;
    private String streetAddress;
    private String city;
    private String state;
    private String postalCode;
    private String country;
} 