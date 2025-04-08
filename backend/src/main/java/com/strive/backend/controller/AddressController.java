package com.strive.backend.controller;

import com.strive.backend.dto.AddressDTO;
import com.strive.backend.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {
    private final AddressService addressService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AddressDTO>> getUserAddresses(@PathVariable Integer userId) {
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }

    @PostMapping
    public ResponseEntity<AddressDTO> createAddress(@Valid @RequestBody AddressDTO addressDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.createAddress(addressDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressDTO> updateAddress(
            @PathVariable Integer id,
            @Valid @RequestBody AddressDTO addressDTO) {
        return ResponseEntity.ok(addressService.updateAddress(id, addressDTO));
    }

    @DeleteMapping("/{id}/user/{userId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Integer id,
            @PathVariable Integer userId) {
        addressService.deleteAddress(id, userId);
        return ResponseEntity.noContent().build();
    }
}