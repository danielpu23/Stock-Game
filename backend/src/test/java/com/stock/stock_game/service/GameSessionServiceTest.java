package com.stock.stock_game.service;

import com.stock.stock_game.dto.response.GameResponse;
import com.stock.stock_game.exception.NotFoundException;
import com.stock.stock_game.exception.BadRequestException;
import com.stock.stock_game.model.entity.GameSession;
import com.stock.stock_game.model.entity.User;
import com.stock.stock_game.model.entity.PlayerSession;
import com.stock.stock_game.model.entity.StockHolding;
import com.stock.stock_game.model.entity.Transaction;
import com.stock.stock_game.model.enums.SessionStatus;
import com.stock.stock_game.repository.GameSessionRepository;
import com.stock.stock_game.repository.PlayerSessionRepository;
import com.stock.stock_game.repository.UserRepository;
import com.stock.stock_game.repository.StockHoldingRepository;
import com.stock.stock_game.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
    private PlayerSession testPlayerSession;
    private StockHolding testHolding;

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

        testPlayerSession = new PlayerSession();
        testPlayerSession.setId(1L);
        testPlayerSession.setUser(testUser);
        testPlayerSession.setGameSession(testGame);
        testPlayerSession.setCashBalance(new BigDecimal("10000"));

        testHolding = new StockHolding();
        testHolding.setId(1L);
        testHolding.setPlayerSession(testPlayerSession);
        testHolding.setSymbol("AAPL");
        testHolding.setQuantity(10);
        testHolding.setAveragePrice(new BigDecimal("150.00"));
    }

    @Test
    @DisplayName("Should successfully create a new game session")
    void createGame_Success() {
        Long userId = 1L;
        String gameName = "New Game";
        BigDecimal initialCash = new BigDecimal("10000");

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(gameSessionRepository.save(any(GameSession.class))).thenReturn(testGame);
        when(playerSessionRepository.save(any(PlayerSession.class))).thenReturn(new PlayerSession());

        GameSession result = gameSessionService.createGame(userId, gameName, initialCash);

        assertNotNull(result);
        assertEquals(gameName, result.getName());
        assertEquals(initialCash, result.getInitialCash());
        assertEquals(SessionStatus.WAITING, result.getStatus());
        verify(userRepository).findById(userId);
        verify(gameSessionRepository).save(any(GameSession.class));
        verify(playerSessionRepository).save(any(PlayerSession.class));
    }

    @Test
    @DisplayName("Should throw NotFoundException when creating a game with a non-existent user")
    void createGame_UserNotFound() {
        Long userId = 999L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> 
            gameSessionService.createGame(userId, "Test Game", new BigDecimal("10000"))
        );
        verify(userRepository).findById(userId);
        verify(gameSessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should successfully retrieve user's game sessions")
    void getUserGames_Success() {
        Long userId = 1L;
        when(gameSessionRepository.findByCreatedById(userId)).thenReturn(java.util.List.of(testGame));

        java.util.List<GameSession> result = gameSessionService.getUserGames(userId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Game", result.get(0).getName());
        verify(gameSessionRepository).findByCreatedById(userId);
    }

    @Test
    @DisplayName("Should successfully buy stock if user can afford transaction with remaining cash")
    void buyStock_Success() { 
        Long gameId = 1L;
        Long userId = 1L;
        String symbol = "AAPL";
        Integer quantity = 10;
        BigDecimal stockPrice = new BigDecimal("150.00");

        testGame.setStatus(SessionStatus.IN_PROGRESS);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(testUser, testGame))
            .thenReturn(Optional.of(testPlayerSession));
        when(stockPriceService.getPrice(symbol)).thenReturn(stockPrice);
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(testPlayerSession, symbol))
            .thenReturn(Optional.empty());
        when(stockHoldingRepository.save(any(StockHolding.class))).thenReturn(testHolding);
        when(playerSessionRepository.save(any(PlayerSession.class))).thenReturn(testPlayerSession);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(new Transaction());

        gameSessionService.buyStock(gameId, userId, symbol, quantity);

        verify(playerSessionRepository).save(any(PlayerSession.class));
        verify(stockHoldingRepository).save(any(StockHolding.class));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when user cannot afford transaction with remaining cash")
    void buyStock_NotEnoughCash() {
        Long gameId = 1L;
        Long userId = 1L;
        String symbol = "AAPL";
        Integer quantity = 100;
        BigDecimal stockPrice = new BigDecimal("150.00");

        testGame.setStatus(SessionStatus.IN_PROGRESS);
        testPlayerSession.setCashBalance(new BigDecimal("1000")); // Not enough for 100 shares at $150

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(testUser, testGame))
            .thenReturn(Optional.of(testPlayerSession));
        when(stockPriceService.getPrice(symbol)).thenReturn(stockPrice);

        assertThrows(BadRequestException.class, () -> 
            gameSessionService.buyStock(gameId, userId, symbol, quantity)
        );
        verify(playerSessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when trying to buy stock in a game that is not in progress")
    void buyStock_GameNotInProgress() {
        Long gameId = 1L;
        Long userId = 1L;
        String symbol = "AAPL";
        Integer quantity = 10;

        testGame.setStatus(SessionStatus.WAITING);

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(testUser, testGame))
            .thenReturn(Optional.of(testPlayerSession));

        assertThrows(BadRequestException.class, () -> 
            gameSessionService.buyStock(gameId, userId, symbol, quantity)
        );
        verify(stockPriceService, never()).getPrice(any());
    }

    @Test
    @DisplayName("Should successfully sell stock if user owns enough shares")
    void sellStock_Success() {
        Long gameId = 1L;
        Long userId = 1L;
        String symbol = "AAPL";
        Integer quantity = 5;
        BigDecimal currentPrice = new BigDecimal("155.00");

        testGame.setStatus(SessionStatus.IN_PROGRESS);
        testHolding.setQuantity(10); // Has 10 shares, selling 5

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(testUser, testGame))
            .thenReturn(Optional.of(testPlayerSession));
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(testPlayerSession, symbol))
            .thenReturn(Optional.of(testHolding));
        when(stockPriceService.getPrice(symbol)).thenReturn(currentPrice);
        when(playerSessionRepository.save(any(PlayerSession.class))).thenReturn(testPlayerSession);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(new Transaction());

        gameSessionService.sellStock(gameId, userId, symbol, quantity);

        verify(playerSessionRepository).save(any(PlayerSession.class));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when user tries to sell more shares than they own")
    void sellStock_NotEnoughShares() {
        Long gameId = 1L;
        Long userId = 1L;
        String symbol = "AAPL";
        Integer quantity = 15; // Trying to sell 15 but only have 10

        testGame.setStatus(SessionStatus.IN_PROGRESS);
        testHolding.setQuantity(10);

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(testUser, testGame))
            .thenReturn(Optional.of(testPlayerSession));
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(testPlayerSession, symbol))
            .thenReturn(Optional.of(testHolding));

        assertThrows(BadRequestException.class, () -> 
            gameSessionService.sellStock(gameId, userId, symbol, quantity)
        );
        verify(playerSessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw NotFoundException when user tries to sell stock they don't own")
    void sellStock_StockNotOwned() {
        Long gameId = 1L;
        Long userId = 1L;
        String symbol = "GOOGL"; // Doesn't own this stock
        Integer quantity = 5;

        testGame.setStatus(SessionStatus.IN_PROGRESS);

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(testUser, testGame))
            .thenReturn(Optional.of(testPlayerSession));
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(testPlayerSession, symbol))
            .thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> 
            gameSessionService.sellStock(gameId, userId, symbol, quantity)
        );
        verify(stockPriceService, never()).getPrice(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when trying to sell stock in a game that is not in progress")
    void sellStock_GameNotInProgress() {
        Long gameId = 1L;
        Long userId = 1L;
        String symbol = "AAPL";
        Integer quantity = 5;

        testGame.setStatus(SessionStatus.FINISHED); // Not in progress

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(testUser, testGame))
            .thenReturn(Optional.of(testPlayerSession));

        assertThrows(BadRequestException.class, () -> 
            gameSessionService.sellStock(gameId, userId, symbol, quantity)
        );
        verify(stockHoldingRepository, never()).findByPlayerSessionAndSymbol(any(), any());
    }

    @Test
    @DisplayName("Should successfully sell all shares and remove holding from repository")
    void sellStock_SellAllShares() {
        Long gameId = 1L;
        Long userId = 1L;
        String symbol = "AAPL";
        Integer quantity = 10; // Selling all shares
        BigDecimal currentPrice = new BigDecimal("155.00");

        testGame.setStatus(SessionStatus.IN_PROGRESS);
        testHolding.setQuantity(10);

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(testUser, testGame))
            .thenReturn(Optional.of(testPlayerSession));
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(testPlayerSession, symbol))
            .thenReturn(Optional.of(testHolding));
        when(stockPriceService.getPrice(symbol)).thenReturn(currentPrice);
        when(playerSessionRepository.save(any(PlayerSession.class))).thenReturn(testPlayerSession);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(new Transaction());

        gameSessionService.sellStock(gameId, userId, symbol, quantity);

        verify(stockHoldingRepository).delete(testHolding);
        verify(playerSessionRepository).save(any(PlayerSession.class));
    }

    @Test
    @DisplayName("Should successfully finish a game in progress")
    void finishGame_Success() {
        Long gameId = 1L;
        testGame.setStatus(SessionStatus.IN_PROGRESS);
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));
        when(gameSessionRepository.save(any(GameSession.class))).thenReturn(testGame);
        when(playerSessionRepository.findByGameSession(testGame)).thenReturn(java.util.List.of(testPlayerSession));

        GameResponse result = gameSessionService.finishGame(gameId);

        assertNotNull(result);
        assertEquals(SessionStatus.FINISHED, result.getStatus());
        assertNotNull(testGame.getEndDate());
        verify(gameSessionRepository, atLeastOnce()).save(any(GameSession.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when trying to finish a game that is not in progress")
    void finishGame_GameNotInProgress() {
        Long gameId = 1L;
        testGame.setStatus(SessionStatus.WAITING);
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));

        assertThrows(BadRequestException.class, () -> gameSessionService.finishGame(gameId));
        verify(gameSessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw NotFoundException when trying to finish a game that does not exist")
    void finishGame_GameNotFound() {
        Long gameId = 999L;
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> gameSessionService.finishGame(gameId));
        verify(gameSessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should successfully retrieve game results for a finished game")
    void getGameResults_Success() {
        Long gameId = 1L;
        testGame.setStatus(SessionStatus.FINISHED);
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByGameSession(testGame)).thenReturn(java.util.List.of(testPlayerSession));
        when(stockHoldingRepository.findByPlayerSession(testPlayerSession)).thenReturn(java.util.List.of());

        var result = gameSessionService.getGameResults(gameId);

        assertNotNull(result);
        assertEquals(gameId, result.getGameId());
        assertEquals("Test Game", result.getName());
        assertEquals(SessionStatus.FINISHED, result.getStatus());
        verify(gameSessionRepository, atLeastOnce()).findById(gameId);
    }

    @Test
    @DisplayName("Should throw BadRequestException when trying to retrieve results for a game that is not finished")
    void getGameResults_GameNotFinished() {
        Long gameId = 1L;
        testGame.setStatus(SessionStatus.IN_PROGRESS);
        when(gameSessionRepository.findById(gameId)).thenReturn(Optional.of(testGame));

        assertThrows(BadRequestException.class, () -> gameSessionService.getGameResults(gameId));
        verify(playerSessionRepository, never()).findByGameSession(any());
    }
}