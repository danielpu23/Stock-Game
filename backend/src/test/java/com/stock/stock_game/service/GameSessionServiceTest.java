package com.stock.stock_game.service;

import com.stock.stock_game.dto.response.GameResponse;
import com.stock.stock_game.exception.NotFoundException;
import com.stock.stock_game.exception.ConflictException;
import com.stock.stock_game.model.entity.GameSession;
import com.stock.stock_game.model.entity.User;
import com.stock.stock_game.model.entity.PlayerSession;
import com.stock.stock_game.model.enums.SessionStatus;
import com.stock.stock_game.repository.GameSessionRepository;
import com.stock.stock_game.repository.PlayerSessionRepository;
import com.stock.stock_game.repository.UserRepository;
import com.stock.stock_game.repository.StockHoldingRepository;
import com.stock.stock_game.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameSessionServiceTest {

    @Mock
    private GameSessionRepository gameSessionRepository;

    @Mock
    private PlayerSessionRepository playerSessionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StockHoldingRepository stockHoldingRepository;

    @Mock
    private StockPriceService stockPriceService;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private GameSessionService gameSessionService;

    private User testUser;
    private GameSession testGame;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPasswordHash("encodedPassword");

        testGame = new GameSession();
        testGame.setId(1L);
        testGame.setName("Test Game");
        testGame.setInviteCode("TEST123");
        testGame.setStatus(SessionStatus.WAITING);
        testGame.setInitialCash(new BigDecimal("10000"));
        testGame.setCreatedBy(testUser);
    }

    @Test
    void createGame_Success() {
        // Arrange
        Long userId = 1L;
        String gameName = "New Game";
        BigDecimal initialCash = new BigDecimal("10000");

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(gameSessionRepository.save(any(GameSession.class))).thenReturn(testGame);
        when(playerSessionRepository.save(any(PlayerSession.class))).thenReturn(new PlayerSession());

        // Act
        GameSession result = gameSessionService.createGame(userId, gameName, initialCash);

        // Assert
        assertNotNull(result);
        assertEquals(gameName, result.getName());
        assertEquals(initialCash, result.getInitialCash());
        assertEquals(SessionStatus.WAITING, result.getStatus());
        verify(userRepository).findById(userId);
        verify(gameSessionRepository).save(any(GameSession.class));
        verify(playerSessionRepository).save(any(PlayerSession.class));
    }

    @Test
    void createGame_UserNotFound() {
        // Arrange
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> 
            gameSessionService.createGame(userId, "Test Game", new BigDecimal("10000"))
        );
        verify(userRepository).findById(userId);
        verify(gameSessionRepository, never()).save(any());
    }

    @Test
    void getUserGames_Success() {
        // Arrange
        Long userId = 1L;
        when(gameSessionRepository.findByCreatedById(userId)).thenReturn(java.util.List.of(testGame));

        // Act
        java.util.List<GameSession> result = gameSessionService.getUserGames(userId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Game", result.get(0).getName());
        verify(gameSessionRepository).findByCreatedById(userId);
    }
}