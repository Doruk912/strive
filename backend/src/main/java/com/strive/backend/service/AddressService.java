package com.strive.backend.service;

import com.strive.backend.dto.AddressDTO;
import com.strive.backend.model.Address;
import com.strive.backend.repository.AddressRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<AddressDTO> getUserAddresses(Integer userId) {
        return addressRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Address getAddressById(Integer id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new Error("Address not found"));
    }

    public AddressDTO createAddress(AddressDTO addressDTO) {
        Address address = Address.builder()
                .userId(addressDTO.getUserId())
                .name(addressDTO.getName())
                .recipientName(addressDTO.getRecipientName())
                .recipientPhone(addressDTO.getRecipientPhone())
                .streetAddress(addressDTO.getStreetAddress())
                .city(addressDTO.getCity())
                .state(addressDTO.getState())
                .postalCode(addressDTO.getPostalCode())
                .country(addressDTO.getCountry())
                .isDefault(addressDTO.isDefault())
                .build();

        return convertToDTO(addressRepository.save(address));
    }

    public AddressDTO updateAddress(Integer id, AddressDTO addressDTO) {
        Address address = addressRepository.findByIdAndUserId(id, addressDTO.getUserId())
                .orElseThrow(() -> new Error("Address not found"));

        address.setName(addressDTO.getName());
        address.setRecipientName(addressDTO.getRecipientName());
        address.setRecipientPhone(addressDTO.getRecipientPhone());
        address.setStreetAddress(addressDTO.getStreetAddress());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPostalCode(addressDTO.getPostalCode());
        address.setCountry(addressDTO.getCountry());
        address.setDefault(addressDTO.isDefault());

        return convertToDTO(addressRepository.save(address));
    }

    public void deleteAddress(Integer id, Integer userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new Error("Address not found"));
        addressRepository.delete(address);
    }

    private AddressDTO convertToDTO(Address address) {
        return AddressDTO.builder()
                .id(address.getId())
                .userId(address.getUserId())
                .name(address.getName())
                .recipientName(address.getRecipientName())
                .recipientPhone(address.getRecipientPhone())
                .streetAddress(address.getStreetAddress())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.isDefault())
                .build();
    }

}
