package com.stock.stock_game.service;

import com.stock.stock_game.model.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    private User testUser;
    private String testSecret = "testSecretKeyForJwtTokenGenerationThatIsLongEnough";
    private long testExpiration = 86400000; // 24 hours

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "secret", testSecret);
        ReflectionTestUtils.setField(jwtService, "expiration", testExpiration);

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPasswordHash("encodedPassword");
    }

    @Test
    @DisplayName("should generate a valid JWT token")
    void generateToken_Success() {
        String token = jwtService.generateToken(testUser);
        assertNotNull(token);
        assertFalse(token.isEmpty());
        // JWT tokens have 3 parts separated by dots
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length);
    }

    @Test
    @DisplayName("should include the correct subject in the generated token")
    void generateToken_ContainsCorrectSubject() {
        String token = jwtService.generateToken(testUser);
        String extractedUsername = jwtService.extractUsername(token);
        assertEquals("testuser", extractedUsername);
    }

    @Test
    @DisplayName("should extract the correct username from a valid token")
    void extractUsername_Success() {
        String token = jwtService.generateToken(testUser);
        String username = jwtService.extractUsername(token);
        assertEquals("testuser", username);
    }

    @Test
    @DisplayName("should throw an exception when extracting username from an invalid token")
    void extractUsername_InvalidToken() {
        String invalidToken = "invalid.token.string";
        assertThrows(Exception.class, () -> jwtService.extractUsername(invalidToken));
    }

    @Test
    @DisplayName("should validate a valid token")
    void isTokenValid_ValidToken() {
        String token = jwtService.generateToken(testUser);
        boolean isValid = jwtService.isTokenValid(token, testUser);
        assertTrue(isValid);
    }

    @Test
    @DisplayName("should reject an invalid token")
    void isTokenValid_InvalidToken() {
        String invalidToken = "invalid.token.string";
        boolean isValid = jwtService.isTokenValid(invalidToken, testUser);
        assertFalse(isValid);
    }

    @Test
    @DisplayName("should reject a token for a different user")
    void isTokenValid_WrongUser() {
        String token = jwtService.generateToken(testUser);
        User differentUser = new User();
        differentUser.setId(2L);
        differentUser.setUsername("differentuser");
        differentUser.setPasswordHash("differentPassword");
        boolean isValid = jwtService.isTokenValid(token, differentUser);
        assertFalse(isValid);
    }

    @Test
    @DisplayName("should reject an expired token")
    void isTokenValid_ExpiredToken() {
        // Create a token with 1 ms expiration
        ReflectionTestUtils.setField(jwtService, "expiration", 1);
        String token = jwtService.generateToken(testUser);
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        boolean isValid = jwtService.isTokenValid(token, testUser);
        assertFalse(isValid);
    }

    @Test
    @DisplayName("should reject a tampered token")
    void isTokenValid_TamperedToken() {
        String validToken = jwtService.generateToken(testUser);
        String tamperedToken = validToken + "tampered";
        boolean isValid = jwtService.isTokenValid(tamperedToken, testUser);
        assertFalse(isValid);
    }
}