package com.rugved.paymentProject.service;

import com.rugved.paymentProject.model.User;
import com.rugved.paymentProject.repository.UserRepository;
import com.rugved.paymentProject.service.impl.UPIPinServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UPIPinServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UPIPinServiceImpl upiPinService;

    private User testUser;
    private final Long userId = 1L;
    private final String validPin = "1234";
    private final String encodedPin = "$2a$10$encodedPinHash";
    private final String userPassword = "$2a$10$encodedPasswordHash";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(userId)
                .email("test@example.com")
                .password(userPassword)
                .upiPinHash(null)
                .build();
    }

    @Test
    void setUPIPin_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(validPin)).thenReturn(encodedPin);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        upiPinService.setUPIPin(userId, validPin);

        verify(userRepository).save(any(User.class));
        assertEquals(encodedPin, testUser.getUpiPinHash());
        assertEquals(userPassword, testUser.getPassword()); // Password should remain unchanged
    }

    @Test
    void setUPIPin_AlreadySet_ThrowsException() {
        testUser.setUpiPinHash(encodedPin);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            upiPinService.setUPIPin(userId, validPin);
        });

        assertEquals("UPI Pin already set. Use change PIN endpoint to update.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void setUPIPin_InvalidFormat_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            upiPinService.setUPIPin(userId, "12345"); // 5 digits
        });

        assertEquals("UPI Pin must be 4 digits", exception.getMessage());
    }

    @Test
    void setUPIPin_NonNumeric_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            upiPinService.setUPIPin(userId, "abcd");
        });

        assertEquals("UPI Pin must be 4 digits", exception.getMessage());
    }

    @Test
    void validateUPIPin_Success() {
        testUser.setUpiPinHash(encodedPin);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(validPin, encodedPin)).thenReturn(true);

        boolean result = upiPinService.validateUPIPin(userId, validPin);

        assertTrue(result);
        assertEquals(userPassword, testUser.getPassword()); // Password should remain unchanged
    }

    @Test
    void validateUPIPin_WrongPin_ReturnsFalse() {
        testUser.setUpiPinHash(encodedPin);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("9999", encodedPin)).thenReturn(false);

        boolean result = upiPinService.validateUPIPin(userId, "9999");

        assertFalse(result);
    }

    @Test
    void validateUPIPin_NotSet_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            upiPinService.validateUPIPin(userId, validPin);
        });

        assertEquals("UPI Pin not set. Please set your UPI Pin first.", exception.getMessage());
    }

    @Test
    void changeUPIPin_Success() {
        String newPin = "5678";
        String encodedNewPin = "$2a$10$encodedNewPinHash";
        
        testUser.setUpiPinHash(encodedPin);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(validPin, encodedPin)).thenReturn(true);
        when(passwordEncoder.encode(newPin)).thenReturn(encodedNewPin);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        upiPinService.changeUPIPin(userId, validPin, newPin);

        verify(userRepository).save(any(User.class));
        assertEquals(encodedNewPin, testUser.getUpiPinHash());
        assertEquals(userPassword, testUser.getPassword()); // Password should remain unchanged
    }

    @Test
    void changeUPIPin_WrongOldPin_ThrowsException() {
        testUser.setUpiPinHash(encodedPin);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("9999", encodedPin)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            upiPinService.changeUPIPin(userId, "9999", "5678");
        });

        assertEquals("Invalid current UPI Pin", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void changeUPIPin_NotSet_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            upiPinService.changeUPIPin(userId, validPin, "5678");
        });

        assertEquals("UPI Pin not set. Please set your UPI Pin first.", exception.getMessage());
    }

    @Test
    void changeUPIPin_InvalidNewPin_ThrowsException() {
        testUser.setUpiPinHash(encodedPin);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(validPin, encodedPin)).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            upiPinService.changeUPIPin(userId, validPin, "12345");
        });

        assertEquals("New UPI Pin must be 4 digits", exception.getMessage());
    }

    @Test
    void userNotFound_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            upiPinService.setUPIPin(userId, validPin);
        });

        assertEquals("User not found", exception.getMessage());
    }
}
