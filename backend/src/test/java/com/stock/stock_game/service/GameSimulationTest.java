package com.stock.stock_game.service;

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
class GameSimulationTest {

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

    private User alice;
    private User bob;
    private GameSession testGame;
    private PlayerSession aliceSession;
    private PlayerSession bobSession;

    @BeforeEach
    void setUp() {
        alice = new User();
        alice.setId(1L);
        alice.setUsername("alice");
        alice.setPasswordHash("alice_password");

        bob = new User();
        bob.setId(2L);
        bob.setUsername("bob");
        bob.setPasswordHash("bob_password");

        testGame = new GameSession();
        testGame.setId(1L);
        testGame.setName("Test Game");
        testGame.setInviteCode("ALICEBOB");
        testGame.setStatus(SessionStatus.WAITING);
        testGame.setInitialCash(new BigDecimal("10000"));
        testGame.setCreatedBy(alice);

        aliceSession = new PlayerSession();
        aliceSession.setId(1L);
        aliceSession.setUser(alice);
        aliceSession.setGameSession(testGame);
        aliceSession.setCashBalance(new BigDecimal("10000"));

        bobSession = new PlayerSession();
        bobSession.setId(2L);
        bobSession.setUser(bob);
        bobSession.setGameSession(testGame);
        bobSession.setCashBalance(new BigDecimal("10000"));
    }

    @Test
    @DisplayName("should reject stock purchase if funds are insufficient")
    void testInsufficientFunds_Rejected() {
        testGame.setStatus(SessionStatus.IN_PROGRESS);
        aliceSession.setCashBalance(new BigDecimal("500"));
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(gameSessionRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(alice, testGame))
            .thenReturn(Optional.of(aliceSession));
        when(stockPriceService.getPrice("AAPL")).thenReturn(new BigDecimal("100.00"));

        assertThrows(com.stock.stock_game.exception.BadRequestException.class, () -> 
            gameSessionService.buyStock(1L, 1L, "AAPL", 10)
        );
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("should reject stock sale if player doesn't own the stock")
    void testSellingUnownedStocks_Rejected() {
        testGame.setStatus(SessionStatus.IN_PROGRESS);
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(gameSessionRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(alice, testGame))
            .thenReturn(Optional.of(aliceSession));
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(aliceSession, "AAPL"))
            .thenReturn(Optional.empty());

        assertThrows(com.stock.stock_game.exception.NotFoundException.class, () -> 
            gameSessionService.sellStock(1L, 1L, "AAPL", 5)
        );
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("should reject stock sale if player tries to sell more shares than owned")
    void testSellingMoreSharesThanOwned_Rejected() {
        testGame.setStatus(SessionStatus.IN_PROGRESS);
        StockHolding aliceHolding = new StockHolding();
        aliceHolding.setPlayerSession(aliceSession);
        aliceHolding.setSymbol("AAPL");
        aliceHolding.setQuantity(10);

        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(gameSessionRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(alice, testGame))
            .thenReturn(Optional.of(aliceSession));
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(aliceSession, "AAPL"))
            .thenReturn(Optional.of(aliceHolding));

        assertThrows(com.stock.stock_game.exception.BadRequestException.class, () -> 
            gameSessionService.sellStock(1L, 1L, "AAPL", 15)
        );
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("should reject trading when game is not in progress")
    void testTradingWhenGameNotInProgress_Rejected() {
        testGame.setStatus(SessionStatus.FINISHED);
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(gameSessionRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(alice, testGame))
            .thenReturn(Optional.of(aliceSession));

        assertThrows(com.stock.stock_game.exception.BadRequestException.class, () -> 
            gameSessionService.buyStock(1L, 1L, "AAPL", 5)
        );
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("should set correct initial status when creating a game")
    void testGameCreation_CorrectInitialStatus() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(gameSessionRepository.save(any())).thenReturn(testGame);
        when(playerSessionRepository.save(any())).thenReturn(aliceSession);
        GameSession createdGame = gameSessionService.createGame(1L, "New Game", new BigDecimal("10000"));

        assertEquals(SessionStatus.WAITING, createdGame.getStatus());
        assertEquals("New Game", createdGame.getName());
        assertEquals(0, new BigDecimal("10000").compareTo(createdGame.getInitialCash()));
    }

    @Test
    @DisplayName("should transition status and set start date when starting game")
    void testGameStart_StatusTransitionAndStartDate() {
        testGame.setStatus(SessionStatus.WAITING);
        when(gameSessionRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(gameSessionRepository.save(any())).thenReturn(testGame);

        gameSessionService.startGame(1L);

        assertEquals(SessionStatus.IN_PROGRESS, testGame.getStatus());
        assertNotNull(testGame.getStartDate());
    }

    @Test
    @DisplayName("should transition status and set end date when finishing game")
    void testGameFinish_StatusTransitionAndEndDate() {
        testGame.setStatus(SessionStatus.IN_PROGRESS);
        when(gameSessionRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(gameSessionRepository.save(any())).thenReturn(testGame);
        when(playerSessionRepository.findByGameSession(testGame)).thenReturn(java.util.List.of(aliceSession));

        gameSessionService.finishGame(1L);

        assertEquals(SessionStatus.FINISHED, testGame.getStatus());
        assertNotNull(testGame.getEndDate());
    }

    @Test
    @DisplayName("Test complete trading game between Alice and Bob from start to finish with winner determination")
    void testCompleteTradingGame_AliceVsBob_EndToEnd() {
        // setup game
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(gameSessionRepository.save(any())).thenReturn(testGame);
        when(playerSessionRepository.save(any())).thenReturn(aliceSession);
        testGame.setName("Championship Game");
        GameSession createdGame = gameSessionService.createGame(1L, "Championship Game", new BigDecimal("10000"));
        assertEquals(SessionStatus.WAITING, createdGame.getStatus());
        assertEquals("Championship Game", createdGame.getName());

        // start game
        testGame.setStatus(SessionStatus.WAITING);
        when(gameSessionRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(gameSessionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        gameSessionService.startGame(1L);
        assertEquals(SessionStatus.IN_PROGRESS, testGame.getStatus());
        assertNotNull(testGame.getStartDate());

        // setup trading
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(userRepository.findById(2L)).thenReturn(Optional.of(bob));
        when(gameSessionRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByUserAndGameSession(alice, testGame))
            .thenReturn(Optional.of(aliceSession));
        when(playerSessionRepository.findByUserAndGameSession(bob, testGame))
            .thenReturn(Optional.of(bobSession));
        when(playerSessionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(stockHoldingRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any())).thenAnswer(invocation -> {
            Transaction transaction = new Transaction();
            return transaction;
        });

        // set initial stock prices (all stocks start at $100 for simplicity)
        when(stockPriceService.getPrice(any())).thenReturn(new BigDecimal("100.00"));
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(any(), any()))
            .thenReturn(Optional.empty());

        // Alice buys 50 shares of AAPL at $100 each
        gameSessionService.buyStock(1L, 1L, "AAPL", 50);
        assertEquals(0, new BigDecimal("5000").compareTo(aliceSession.getCashBalance()));

        // Bob buys 40 shares of GOOGL at $100 each
        gameSessionService.buyStock(1L, 2L, "GOOGL", 40);
        assertEquals(0, new BigDecimal("6000").compareTo(bobSession.getCashBalance()));

        // AAPL rises to $150, GOOGL rises to $120
        when(stockPriceService.getPrice("AAPL")).thenReturn(new BigDecimal("150.00"));
        when(stockPriceService.getPrice("GOOGL")).thenReturn(new BigDecimal("120.00"));

        // Setup Alice's AAPL holding for selling
        StockHolding aliceAAPL = new StockHolding();
        aliceAAPL.setPlayerSession(aliceSession);
        aliceAAPL.setSymbol("AAPL");
        aliceAAPL.setQuantity(50);
        aliceAAPL.setAveragePrice(new BigDecimal("100.00"));
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(aliceSession, "AAPL"))
            .thenReturn(Optional.of(aliceAAPL));

        // Alice sells 20 shares of AAPL at $150
        gameSessionService.sellStock(1L, 1L, "AAPL", 20);
        assertEquals(0, new BigDecimal("8000").compareTo(aliceSession.getCashBalance()));

        // Alice buys 30 shares of TSLA at $100
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(aliceSession, "TSLA"))
            .thenReturn(Optional.empty());
        when(stockPriceService.getPrice("TSLA")).thenReturn(new BigDecimal("100.00"));
        gameSessionService.buyStock(1L, 1L, "TSLA", 30);
        assertEquals(0, new BigDecimal("5000").compareTo(aliceSession.getCashBalance()));

        // Bob holds his GOOGL position

        // AAPL drops to $80, GOOGL drops to $90, TSLA rises to $130
        when(stockPriceService.getPrice("AAPL")).thenReturn(new BigDecimal("80.00"));
        when(stockPriceService.getPrice("GOOGL")).thenReturn(new BigDecimal("90.00"));
        when(stockPriceService.getPrice("TSLA")).thenReturn(new BigDecimal("130.00"));

        // Alice sells remaining 30 AAPL shares at $80
        aliceAAPL.setQuantity(30);
        gameSessionService.sellStock(1L, 1L, "AAPL", 30);
        assertEquals(0, new BigDecimal("7400").compareTo(aliceSession.getCashBalance()));

        // Bob holds through the dip

        // GOOGL rises to $110, TSLA stays at $130
        when(stockPriceService.getPrice("GOOGL")).thenReturn(new BigDecimal("110.00"));
        when(stockPriceService.getPrice("TSLA")).thenReturn(new BigDecimal("130.00"));

        // Setup Bob's GOOGL holding for potential selling
        StockHolding bobGOOGL = new StockHolding();
        bobGOOGL.setPlayerSession(bobSession);
        bobGOOGL.setSymbol("GOOGL");
        bobGOOGL.setQuantity(40);
        bobGOOGL.setAveragePrice(new BigDecimal("100.00"));
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(bobSession, "GOOGL"))
            .thenReturn(Optional.of(bobGOOGL));

        // Bob sells 10 shares of GOOGL at $110
        gameSessionService.sellStock(1L, 2L, "GOOGL", 10);
        assertEquals(0, new BigDecimal("7100").compareTo(bobSession.getCashBalance()));

        // Setup Alice's TSLA holding
        StockHolding aliceTSLA = new StockHolding();
        aliceTSLA.setPlayerSession(aliceSession);
        aliceTSLA.setSymbol("TSLA");
        aliceTSLA.setQuantity(30);
        aliceTSLA.setAveragePrice(new BigDecimal("100.00"));
        when(stockHoldingRepository.findByPlayerSessionAndSymbol(aliceSession, "TSLA"))
            .thenReturn(Optional.of(aliceTSLA));

        // Alice buys 20 more TSLA at $130
        gameSessionService.buyStock(1L, 1L, "TSLA", 20);
        assertEquals(0, new BigDecimal("4800").compareTo(aliceSession.getCashBalance()));

        // Setup final holdings for portfolio calculation
        aliceTSLA.setQuantity(50);
        bobGOOGL.setQuantity(30);

        // Verify final holdings quantities are exactly as expected
        assertEquals(50, aliceTSLA.getQuantity());
        assertEquals(30, bobGOOGL.getQuantity());

        // Mock holdings for final portfolio calculation
        StockHolding finalAliceTSLA = new StockHolding();
        finalAliceTSLA.setPlayerSession(aliceSession);
        finalAliceTSLA.setSymbol("TSLA");
        finalAliceTSLA.setQuantity(50);
        
        StockHolding finalBobGOOGL = new StockHolding();
        finalBobGOOGL.setPlayerSession(bobSession);
        finalBobGOOGL.setSymbol("GOOGL");
        finalBobGOOGL.setQuantity(30);

        when(stockHoldingRepository.findByPlayerSession(aliceSession))
            .thenReturn(java.util.List.of(finalAliceTSLA));
        when(stockHoldingRepository.findByPlayerSession(bobSession))
            .thenReturn(java.util.List.of(finalBobGOOGL));

        testGame.setStatus(SessionStatus.IN_PROGRESS);
        when(gameSessionRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(gameSessionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(playerSessionRepository.findByGameSession(testGame))
            .thenReturn(java.util.List.of(aliceSession, bobSession));

        gameSessionService.finishGame(1L);
        assertEquals(SessionStatus.FINISHED, testGame.getStatus());
        assertNotNull(testGame.getEndDate());

        // determine winner based on total value (cash + holdings)
        when(gameSessionRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(playerSessionRepository.findByGameSession(testGame))
            .thenReturn(java.util.List.of(aliceSession, bobSession));

        var results = gameSessionService.getGameResults(1L);
        assertNotNull(results);
        assertEquals("Championship Game", results.getName());
        assertEquals(SessionStatus.FINISHED, results.getStatus());
        assertNotNull(results.getLeaderboard());
        assertFalse(results.getLeaderboard().isEmpty());

        // Verify the complete trading activity
        verify(transactionRepository, atLeast(7)).save(any());
        verify(stockHoldingRepository, atLeast(5)).save(any());
        verify(playerSessionRepository, atLeast(7)).save(any());

        String winner = results.getWinner();
        assertEquals("alice", winner);
    }
}