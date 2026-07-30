package com.stock.stock_game.service;

import com.stock.stock_game.dto.response.GameResponse;
import com.stock.stock_game.dto.response.GameResultsResponse;
import com.stock.stock_game.dto.response.GameStateResponse;
import com.stock.stock_game.dto.response.GameSummaryResponse;
import com.stock.stock_game.dto.response.HoldingResponse;
import com.stock.stock_game.dto.response.LeaderboardResponse;
import com.stock.stock_game.dto.response.PlayerResponse;
import com.stock.stock_game.dto.response.PlayerStateResponse;
import com.stock.stock_game.dto.response.TransactionResponse;
import com.stock.stock_game.exception.NotFoundException;
import com.stock.stock_game.exception.BadRequestException;
import com.stock.stock_game.exception.ConflictException;
import com.stock.stock_game.exception.ForbiddenException;
import com.stock.stock_game.model.entity.*;
import com.stock.stock_game.model.enums.SessionStatus;
import com.stock.stock_game.model.enums.TransactionType;
import com.stock.stock_game.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class GameSessionService {

    private static final int INVITE_CODE_LENGTH = 6;
    private static final int INVITE_CODE_ATTEMPTS = 10;

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
    public GameResponse createGame(Long creatorUserId, String name, BigDecimal initialCash) {

        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (initialCash == null || initialCash.signum() <= 0) {
            throw new BadRequestException("Starting cash must be greater than zero");
        }

        GameSession game = new GameSession();
        game.setName(name.trim());
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

        // Return a DTO, never the entity: GameSession holds a lazy reference to the
        // creating User, so serialising it both failed outside the transaction and
        // exposed that user's password hash.
        return toGameResponse(game, List.of(playerSession));
    }

    @Transactional
    public GameResponse joinGame(Long userId, String inviteCode) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (inviteCode == null || inviteCode.isBlank()) {
            throw new BadRequestException("An invite code is required");
        }

        // Codes are generated uppercase, so accept them typed in any case.
        GameSession game = gameSessionRepository
                .findByInviteCode(inviteCode.trim().toUpperCase())
                .orElseThrow(() ->
                        new NotFoundException("No game found with that invite code"));

        if (playerSessionRepository.existsByUserAndGameSession(user, game)) {
            throw new ConflictException("You have already joined this game");
        }

        if (game.getStatus() != SessionStatus.WAITING) {
            throw new BadRequestException("That game has already started");
        }

        PlayerSession playerSession = new PlayerSession();
        playerSession.setUser(user);
        playerSession.setGameSession(game);
        playerSession.setCashBalance(game.getInitialCash());

        playerSessionRepository.save(playerSession);

        return toGameResponse(game, playerSessionRepository.findByGameSession(game));
    }

    /**
     * Invite codes are random, so a collision would otherwise surface as an opaque
     * unique-constraint violation. Retry a handful of times instead.
     */
    private String generateInviteCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();

        for (int attempt = 0; attempt < INVITE_CODE_ATTEMPTS; attempt++) {
            StringBuilder code = new StringBuilder();
            for (int i = 0; i < INVITE_CODE_LENGTH; i++) {
                code.append(chars.charAt(random.nextInt(chars.length())));
            }
            String candidate = code.toString();
            if (gameSessionRepository.findByInviteCode(candidate).isEmpty()) {
                return candidate;
            }
        }

        throw new ConflictException("Could not allocate an invite code, please retry");
    }

    public GameResponse getGame(Long gameId) {

        GameSession game = findGame(gameId);

        return toGameResponse(game, playerSessionRepository.findByGameSession(game));
    }

    private GameResponse toGameResponse(GameSession game, List<PlayerSession> playerSessions) {

        List<PlayerResponse> players =
                playerSessions.stream()
                .map(playerSession -> {
                    PlayerResponse player = new PlayerResponse();
                    player.setUsername(playerSession.getUser().getUsername());
                    player.setCashBalance(playerSession.getCashBalance());
                    return player;
                })
                .collect(Collectors.toList());

        GameResponse response = new GameResponse();

        response.setId(game.getId());
        response.setName(game.getName());
        response.setInviteCode(game.getInviteCode());
        response.setStatus(game.getStatus());
        response.setInitialCash(game.getInitialCash());
        response.setCreatedByUsername(game.getCreatedBy().getUsername());
        response.setPlayers(players);

        return response;
    }

    /** Games the given user has joined, most recent first. */
    public List<GameSummaryResponse> getMyGames(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return playerSessionRepository.findByUserOrderByJoinedAtDesc(user).stream()
                .map(playerSession -> {
                    GameSession game = playerSession.getGameSession();

                    GameSummaryResponse summary = new GameSummaryResponse();
                    summary.setId(game.getId());
                    summary.setName(game.getName());
                    summary.setInviteCode(game.getInviteCode());
                    summary.setStatus(game.getStatus());
                    summary.setCashBalance(playerSession.getCashBalance());
                    summary.setJoinedAt(playerSession.getJoinedAt());
                    summary.setPlayerCount(
                            playerSessionRepository.findByGameSession(game).size());
                    summary.setCreatedByMe(
                            game.getCreatedBy().getId().equals(userId));
                    return summary;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public GameResponse startGame(Long gameId, Long userId) {

        GameSession game = findGame(gameId);

        requireCreator(game, userId, "Only the player who created this game can start it");

        if (game.getStatus() != SessionStatus.WAITING) {
            throw new BadRequestException("That game has already started");
        }

        game.setStatus(SessionStatus.IN_PROGRESS);
        game.setStartDate(LocalDateTime.now());

        gameSessionRepository.save(game);
        return getGame(game.getId());
    }

    public GameStateResponse getGameState(Long gameId) {

        GameSession game = findGame(gameId);

        List<PlayerSession> playerSessions =
                playerSessionRepository.findByGameSession(game);

        List<PlayerStateResponse> players =
                playerSessions.stream()
                .map(playerSession -> {
                    PlayerStateResponse player = new PlayerStateResponse();
                    player.setUsername(playerSession.getUser().getUsername());
                    player.setCashBalance(playerSession.getCashBalance());

                    List<HoldingResponse> holdings = priceHoldings(playerSession);
                    player.setHoldings(holdings);

                    // Sum the values just computed rather than re-querying and
                    // re-pricing every holding a second time.
                    player.setPortfolioValue(sumMarketValue(holdings));
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
        requirePositiveQuantity(quantity);

        GameSession game = findGame(gameId);
        PlayerSession playerSession = findPlayerSession(game, userId);

        requireInProgress(game);

        // Normalise so "aapl" and "AAPL" can't become two separate holdings.
        String ticker = stockPriceService.normalize(symbol);

        BigDecimal price = stockPriceService.getPrice(ticker);
        BigDecimal cost = price.multiply(BigDecimal.valueOf(quantity));

        if (playerSession.getCashBalance().compareTo(cost) < 0) {
            throw new BadRequestException(
                    "Not enough cash: that costs $"
                    + cost.setScale(2, RoundingMode.HALF_UP)
                    + " but you only have $"
                    + playerSession.getCashBalance().setScale(2, RoundingMode.HALF_UP));
        }

        playerSession.setCashBalance(playerSession.getCashBalance().subtract(cost));
        playerSessionRepository.save(playerSession);

        StockHolding holding =
                stockHoldingRepository
                .findByPlayerSessionAndSymbol(playerSession, ticker)
                .orElse(null);

        if (holding == null) {
            holding = new StockHolding();
            holding.setPlayerSession(playerSession);
            holding.setSymbol(ticker);
            holding.setQuantity(quantity);
            holding.setAveragePrice(price);
        } else {
            int oldQuantity = holding.getQuantity();
            BigDecimal oldTotal =
                holding.getAveragePrice().multiply(BigDecimal.valueOf(oldQuantity));
            BigDecimal newTotal = price.multiply(BigDecimal.valueOf(quantity));
            int totalQuantity = oldQuantity + quantity;

            BigDecimal newAveragePrice =
                    oldTotal
                    .add(newTotal)
                    .divide(BigDecimal.valueOf(totalQuantity), 2, RoundingMode.HALF_UP);

            holding.setQuantity(totalQuantity);
            holding.setAveragePrice(newAveragePrice);
        }
        stockHoldingRepository.save(holding);

        recordTransaction(playerSession, ticker, TransactionType.BUY, quantity, price);
    }

    @Transactional
    public void sellStock(
            Long gameId,
            Long userId,
            String symbol,
            Integer quantity) {

        requirePositiveQuantity(quantity);

        GameSession game = findGame(gameId);
        PlayerSession playerSession = findPlayerSession(game, userId);

        requireInProgress(game);

        String ticker = stockPriceService.normalize(symbol);

        StockHolding holding =
                stockHoldingRepository
                .findByPlayerSessionAndSymbol(playerSession, ticker)
                .orElseThrow(() ->
                        new BadRequestException("You don't own any " + ticker));

        if (holding.getQuantity() < quantity) {
            throw new BadRequestException(
                    "Not enough shares: you own " + holding.getQuantity()
                    + " " + ticker + " but tried to sell " + quantity);
        }

        BigDecimal currentPrice = stockPriceService.getPrice(ticker);

        holding.setQuantity(holding.getQuantity() - quantity);

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

        recordTransaction(playerSession, ticker, TransactionType.SELL, quantity, currentPrice);
    }

    /**
     * The current user's own trade history for a game. Replaces a lookup by raw
     * playerSessionId, which let any signed-in user read anybody's trades.
     */
    public List<TransactionResponse> getMyTransactions(Long gameId, Long userId) {

        GameSession game = findGame(gameId);
        PlayerSession playerSession = findPlayerSession(game, userId);

        return transactionRepository.findByPlayerSession(playerSession).stream()
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
                .collect(Collectors.toList());
    }

    /** Prices every holding once, reusing the quote for market value and P/L. */
    private List<HoldingResponse> priceHoldings(PlayerSession playerSession) {

        List<StockHolding> holdings =
                stockHoldingRepository.findByPlayerSession(playerSession);

        List<HoldingResponse> responses = new ArrayList<>(holdings.size());

        for (StockHolding holding : holdings) {
            BigDecimal currentPrice = stockPriceService.getPrice(holding.getSymbol());
            BigDecimal quantity = BigDecimal.valueOf(holding.getQuantity());
            BigDecimal marketValue = currentPrice.multiply(quantity);

            HoldingResponse response = new HoldingResponse();
            response.setSymbol(holding.getSymbol());
            response.setQuantity(holding.getQuantity());
            response.setAveragePrice(holding.getAveragePrice());
            response.setCurrentPrice(currentPrice);
            response.setMarketValue(marketValue.setScale(2, RoundingMode.HALF_UP));
            response.setProfitLoss(
                    currentPrice.subtract(holding.getAveragePrice())
                            .multiply(quantity)
                            .setScale(2, RoundingMode.HALF_UP));

            responses.add(response);
        }

        return responses;
    }

    private BigDecimal sumMarketValue(List<HoldingResponse> holdings) {
        return holdings.stream()
                .map(HoldingResponse::getMarketValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public List<LeaderboardResponse> getLeaderboard(Long gameId) {

        GameSession game = findGame(gameId);

        List<PlayerSession> players = playerSessionRepository.findByGameSession(game);

        List<LeaderboardResponse> leaderboard = players.stream()
                .map(playerSession -> {
                    BigDecimal holdingsValue = sumMarketValue(priceHoldings(playerSession));
                    BigDecimal cash = playerSession.getCashBalance();
                    BigDecimal total = cash.add(holdingsValue);

                    LeaderboardResponse response = new LeaderboardResponse();
                    response.setUsername(playerSession.getUser().getUsername());
                    response.setCashBalance(cash);
                    response.setHoldingsValue(holdingsValue);
                    response.setTotalValue(total);
                    response.setProfitLoss(
                            total.subtract(game.getInitialCash())
                                    .setScale(2, RoundingMode.HALF_UP));
                    return response;
                })
                .sorted((a, b) -> b.getTotalValue().compareTo(a.getTotalValue()))
                .collect(Collectors.toList());

        // The frontend's GameResult type expects a rank; it was never populated.
        for (int i = 0; i < leaderboard.size(); i++) {
            leaderboard.get(i).setRank(i + 1);
        }

        return leaderboard;
    }

    @Transactional
    public GameResponse finishGame(Long gameId, Long userId) {

        GameSession game = findGame(gameId);

        requireCreator(game, userId, "Only the player who created this game can finish it");

        if (game.getStatus() != SessionStatus.IN_PROGRESS) {
            throw new BadRequestException("That game is not in progress");
        }

        game.setStatus(SessionStatus.FINISHED);
        game.setEndDate(LocalDateTime.now());

        gameSessionRepository.save(game);

        return getGame(gameId);
    }

    public GameResultsResponse getGameResults(Long gameId) {

        GameSession game = findGame(gameId);

        if (game.getStatus() != SessionStatus.FINISHED) {
            throw new BadRequestException("That game has not finished yet");
        }

        List<LeaderboardResponse> leaderboard = getLeaderboard(gameId);

        GameResultsResponse response = new GameResultsResponse();

        response.setGameId(game.getId());
        response.setName(game.getName());
        response.setStatus(game.getStatus());
        response.setStartDate(game.getStartDate());
        response.setEndDate(game.getEndDate());
        response.setLeaderboard(leaderboard);

        if (!leaderboard.isEmpty()) {
            response.setWinner(leaderboard.get(0).getUsername());
        }

        return response;
    }

    private GameSession findGame(Long gameId) {
        return gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new NotFoundException("Game not found"));
    }

    private PlayerSession findPlayerSession(GameSession game, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return playerSessionRepository.findByUserAndGameSession(user, game)
                .orElseThrow(() -> new ForbiddenException("You have not joined this game"));
    }

    private void requireCreator(GameSession game, Long userId, String message) {
        if (!game.getCreatedBy().getId().equals(userId)) {
            throw new ForbiddenException(message);
        }
    }

    private void requireInProgress(GameSession game) {
        if (game.getStatus() != SessionStatus.IN_PROGRESS) {
            throw new BadRequestException("That game is not in progress");
        }
    }

    private void requirePositiveQuantity(Integer quantity) {
        // Without this a negative quantity would credit cash and create a negative
        // position, letting a player mint money through the buy endpoint.
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Quantity must be at least 1");
        }
    }

    private void recordTransaction(
            PlayerSession playerSession,
            String symbol,
            TransactionType type,
            Integer quantity,
            BigDecimal price) {

        Transaction transaction = new Transaction();
        transaction.setPlayerSession(playerSession);
        transaction.setSymbol(symbol);
        transaction.setType(type);
        transaction.setQuantity(quantity);
        transaction.setPrice(price);
        transaction.setCreatedAt(LocalDateTime.now());

        transactionRepository.save(transaction);
    }
}
