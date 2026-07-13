package com.stock.stock_game.service;

import com.stock.stock_game.dto.response.GameResponse;
import com.stock.stock_game.dto.response.GameResultsResponse;
import com.stock.stock_game.dto.response.GameStateResponse;
import com.stock.stock_game.dto.response.HoldingResponse;
import com.stock.stock_game.dto.response.LeaderboardResponse;
import com.stock.stock_game.dto.response.PlayerResponse;
import com.stock.stock_game.dto.response.PlayerStateResponse;
import com.stock.stock_game.dto.response.TransactionResponse;
import com.stock.stock_game.model.entity.*;
import com.stock.stock_game.model.enums.SessionStatus;
import com.stock.stock_game.model.enums.TransactionType;
import com.stock.stock_game.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class GameSessionService {

    private final GameSessionRepository gameSessionRepository;
    private final PlayerSessionRepository playerSessionRepository;
    private final UserRepository userRepository;
    private final StockHoldingRepository stockHoldingRepository;
    private final StockPriceService stockPriceService;
    private final TransactionRepository transactionRepository;

    public GameSessionService(GameSessionRepository gameSessionRepository,
                              PlayerSessionRepository playerSessionRepository,
                              UserRepository userRepository,
                              StockHoldingRepository stockHoldingRepository,
                              StockPriceService stockPriceService,
                              TransactionRepository transactionRepository) {
        this.gameSessionRepository = gameSessionRepository;
        this.playerSessionRepository = playerSessionRepository;
        this.userRepository = userRepository;
        this.stockHoldingRepository = stockHoldingRepository;
        this.stockPriceService = stockPriceService;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public GameSession createGame(Long creatorUserId, String name, BigDecimal initialCash) {

        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GameSession game = new GameSession();
        game.setName(name);
        game.setInitialCash(initialCash);
        game.setStartDate(null);
        game.setEndDate(null);
        game.setStatus(SessionStatus.WAITING);
        game.setInviteCode(generateInviteCode());
        game.setCreatedBy(creator);
        gameSessionRepository.save(game);
        
        PlayerSession playerSession = new PlayerSession();
        playerSession.setUser(creator);
        playerSession.setGameSession(game);
        playerSession.setCashBalance(initialCash);

        playerSessionRepository.save(playerSession);
        return game;
    }

    public void joinGame(Long userId, String inviteCode) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GameSession game = gameSessionRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        
        if (playerSessionRepository.existsByUserAndGameSession(user, game)) {
            throw new RuntimeException("Already joined");
        }

        if (game.getStatus() != SessionStatus.WAITING) {
            throw new RuntimeException("Game already started");
        }

        PlayerSession playerSession = new PlayerSession();
        playerSession.setUser(user);
        playerSession.setGameSession(game);
        playerSession.setCashBalance(game.getInitialCash());

        playerSessionRepository.save(playerSession);
    }

    // Simple invite code generator
    private String generateInviteCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }

        return code.toString();
    }

    public GameResponse getGame(Long gameId) {

        GameSession game = gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        List<PlayerSession> playerSessions =
                playerSessionRepository.findByGameSession(game);

        List<PlayerResponse> players =
                playerSessions.stream()
                .map(playerSession -> {
                    PlayerResponse player = new PlayerResponse();
                    player.setUsername(
                        playerSession.getUser().getUsername()
                    );
                    player.setCashBalance(
                        playerSession.getCashBalance()
                    );
                    return player;
                })
                .collect(Collectors.toList());

        GameResponse response = new GameResponse();

        response.setId(game.getId());
        response.setName(game.getName());
        response.setInviteCode(game.getInviteCode());
        response.setStatus(game.getStatus());
        response.setPlayers(players);

        return response;
    }

    public GameResponse startGame(Long gameId) {

        GameSession game = gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != SessionStatus.WAITING) {
            throw new RuntimeException("Game already started");
        }

        game.setStatus(SessionStatus.IN_PROGRESS);
        game.setStartDate(LocalDateTime.now());

        gameSessionRepository.save(game);
        return getGame(game.getId());
    }

    public GameStateResponse getGameState(Long gameId) {

        GameSession game = gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        List<PlayerSession> playerSessions =
                playerSessionRepository.findByGameSession(game);

        List<PlayerStateResponse> players =
                playerSessions.stream()
                .map(playerSession -> {
                    PlayerStateResponse player = new PlayerStateResponse();
                    player.setUsername(
                            playerSession.getUser().getUsername()
                    );
                    player.setCashBalance(
                            playerSession.getCashBalance()
                    );
                    List<StockHolding> holdings =
                            stockHoldingRepository.findByPlayerSession(playerSession);

                    List<HoldingResponse> holdingResponses =
                            holdings.stream()
                            .map(holding -> {
                                HoldingResponse response =
                                        new HoldingResponse();
                                response.setSymbol(
                                        holding.getSymbol()
                                );
                                response.setQuantity(
                                        holding.getQuantity()
                                );
                                response.setAveragePrice(
                                        holding.getAveragePrice()
                                );
                                return response;
                            })
                            .collect(Collectors.toList());

                    player.setHoldings(holdingResponses);

                    player.setPortfolioValue(
                        calculatePortfolioValue(playerSession)
                    );
                    return player;
                })
                .collect(Collectors.toList());

        GameStateResponse response = new GameStateResponse();
        response.setGameId(game.getId());
        response.setStatus(game.getStatus());
        response.setPlayers(players);
        return response;
    }

    @Transactional
    public void buyStock(
            Long gameId,
            Long userId,
            String symbol,
            Integer quantity
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> 
                    new RuntimeException("User not found")
                );
        GameSession game =
                gameSessionRepository.findById(gameId)
                .orElseThrow(() ->
                    new RuntimeException("Game not found")
                );

        PlayerSession playerSession =
                playerSessionRepository
                .findByUserAndGameSession(user, game)
                .orElseThrow(() ->
                    new RuntimeException("Player not in game")
                );

        if (game.getStatus() != SessionStatus.IN_PROGRESS) {
                throw new RuntimeException("Game is not in progress");
        }

        BigDecimal price =
                stockPriceService.getPrice(symbol);

        BigDecimal cost =
                price.multiply(
                    BigDecimal.valueOf(quantity)
                );

        if(playerSession.getCashBalance()
                .compareTo(cost) < 0){

            throw new RuntimeException(
                    "Not enough cash"
            );
        }

        playerSession.setCashBalance(
                playerSession.getCashBalance()
                .subtract(cost)
        );

        playerSessionRepository.save(playerSession);

        StockHolding holding =
                stockHoldingRepository
                .findByPlayerSessionAndSymbol(
                        playerSession,
                        symbol
                )
                .orElse(null);

        if(holding == null){
            holding = new StockHolding();
            holding.setPlayerSession(playerSession);
            holding.setSymbol(symbol);
            holding.setQuantity(quantity);
            holding.setAveragePrice(price);
        }
        else {
            int oldQuantity = holding.getQuantity();
            BigDecimal oldTotal =
                holding.getAveragePrice()
                .multiply(
                        BigDecimal.valueOf(oldQuantity)
                );
            BigDecimal newTotal =
                price.multiply(
                        BigDecimal.valueOf(quantity)
                );
            int totalQuantity =
                oldQuantity + quantity;
                BigDecimal newAveragePrice =
                        oldTotal
                        .add(newTotal)
                        .divide(
                                BigDecimal.valueOf(totalQuantity),
                                2,
                                RoundingMode.HALF_UP
                        );
                holding.setQuantity(totalQuantity);
                holding.setAveragePrice(newAveragePrice);
        }
        stockHoldingRepository.save(holding);

        Transaction transaction = new Transaction();
        transaction.setPlayerSession(playerSession);
        transaction.setSymbol(symbol);
        transaction.setType(TransactionType.BUY);
        transaction.setQuantity(quantity);
        transaction.setPrice(price);
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);
    }

    public List<TransactionResponse> getTransactions(Long playerSessionId) {

        PlayerSession playerSession = playerSessionRepository.findById(playerSessionId)
                .orElseThrow(() -> new RuntimeException("Player session not found"));

        List<Transaction> transactions =
                transactionRepository.findByPlayerSession(playerSession);

        return transactions.stream()
                .map(transaction -> {
                        TransactionResponse response = new TransactionResponse();
                        response.setId(transaction.getId());
                        response.setSymbol(transaction.getSymbol());
                        response.setQuantity(transaction.getQuantity());
                        response.setPrice(transaction.getPrice());
                        response.setType(transaction.getType());
                        response.setCreatedAt(transaction.getCreatedAt());
                        return response;
                })
                .toList();
        }

   @Transactional
   public void sellStock(
                Long gameId,
                Long userId,
                String symbol,
                Integer quantity) {

        GameSession game = gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        PlayerSession playerSession =
                playerSessionRepository.findByUserAndGameSession(
                        userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found")),
                        game)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (game.getStatus() != SessionStatus.IN_PROGRESS) {
                throw new RuntimeException("Game is not in progress");
        }

        StockHolding holding =
                stockHoldingRepository.findByPlayerSessionAndSymbol(
                        playerSession,
                        symbol)
                .orElseThrow(() -> new RuntimeException("Stock not owned"));

        if (holding.getQuantity() < quantity) {
                throw new RuntimeException("Not enough shares");
        }

        BigDecimal currentPrice = stockPriceService.getPrice(symbol);

        holding.setQuantity(
                holding.getQuantity() - quantity
        );

        if (holding.getQuantity() == 0) {
                stockHoldingRepository.delete(holding);
        } else {
                stockHoldingRepository.save(holding);
        }

        playerSession.setCashBalance(
                playerSession.getCashBalance().add(
                        currentPrice.multiply(BigDecimal.valueOf(quantity))
                )
        );

        playerSessionRepository.save(playerSession);

        Transaction transaction = new Transaction();

        transaction.setPlayerSession(playerSession);
        transaction.setSymbol(symbol);
        transaction.setQuantity(quantity);
        transaction.setPrice(currentPrice);
        transaction.setType(TransactionType.SELL);
        transaction.setCreatedAt(LocalDateTime.now());

        transactionRepository.save(transaction);
  }

  private BigDecimal calculatePortfolioValue(PlayerSession playerSession) {

        List<StockHolding> holdings =
                stockHoldingRepository.findByPlayerSession(playerSession);
        BigDecimal total = BigDecimal.ZERO;

        for (StockHolding holding : holdings) {
                BigDecimal currentPrice =
                        stockPriceService.getPrice(holding.getSymbol());
                BigDecimal holdingValue =
                        currentPrice.multiply(
                        BigDecimal.valueOf(holding.getQuantity())
                        );
                total = total.add(holdingValue);
        }
        return total;
  }

  public List<LeaderboardResponse> getLeaderboard(Long gameId) {

        GameSession game =
                gameSessionRepository.findById(gameId)
                .orElseThrow(() ->
                        new RuntimeException("Game not found")
                );
                
        List<PlayerSession> players =
                playerSessionRepository
                .findByGameSession(game);

        return players.stream()
                .map(playerSession -> {
                        BigDecimal holdingsValue =
                                calculatePortfolioValue(playerSession);
                        BigDecimal cash =
                                playerSession.getCashBalance();
                        LeaderboardResponse response =
                                new LeaderboardResponse();
                        response.setUsername(
                                playerSession
                                .getUser()
                                .getUsername()
                        );
                        response.setCashBalance(cash);
                        response.setHoldingsValue(
                                holdingsValue
                        );
                        response.setTotalValue(
                                cash.add(holdingsValue)
                        );
                        return response;
                })
                .sorted(
                        (a,b) ->
                        b.getTotalValue()
                        .compareTo(a.getTotalValue())
                )
                .collect(Collectors.toList());
        }

  @Transactional
  public GameResponse finishGame(Long gameId) {

        GameSession game = gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != SessionStatus.IN_PROGRESS) {
                throw new RuntimeException("Game is not in progress");
        }

        game.setStatus(SessionStatus.FINISHED);
        game.setEndDate(LocalDateTime.now());

        gameSessionRepository.save(game);

        return getGame(gameId);
  }

  public GameResultsResponse getGameResults(Long gameId) {

        GameSession game = gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (game.getStatus() != SessionStatus.FINISHED) {
                throw new RuntimeException("Game has not finished");
        }

        List<LeaderboardResponse> leaderboard =
                getLeaderboard(gameId);

        GameResultsResponse response =
                new GameResultsResponse();

        response.setGameId(game.getId());
        response.setName(game.getName());
        response.setStatus(game.getStatus());
        response.setStartDate(game.getStartDate());
        response.setEndDate(game.getEndDate());

        response.setLeaderboard(leaderboard);

        if (!leaderboard.isEmpty()) {
                response.setWinner(
                        leaderboard.get(0).getUsername()
                );
        }

        return response;
  }
}