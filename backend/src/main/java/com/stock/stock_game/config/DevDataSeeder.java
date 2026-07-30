package com.stock.stock_game.config;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.ApplicationArguments;
import org.springframework.context.annotation.Configuration;

import com.stock.stock_game.dto.request.RegisterRequest;
import com.stock.stock_game.dto.response.GameResponse;
import com.stock.stock_game.model.entity.User;
import com.stock.stock_game.repository.UserRepository;
import com.stock.stock_game.service.AuthService;
import com.stock.stock_game.service.GameSessionService;

/**
 * Populates the in-memory dev database with two players and a game already in
 * progress, so the leaderboard and holdings tables have something in them
 * without registering users by hand. Never runs unless app.dev.seed is true.
 */
@Configuration
@ConditionalOnProperty(name = "app.dev.seed", havingValue = "true")
public class DevDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    private static final String DEMO_PASSWORD = "password123";
    private static final BigDecimal STARTING_CASH = new BigDecimal("10000.00");

    private final AuthService authService;
    private final GameSessionService gameSessionService;
    private final UserRepository userRepository;

    public DevDataSeeder(AuthService authService,
                         GameSessionService gameSessionService,
                         UserRepository userRepository) {
        this.authService = authService;
        this.gameSessionService = gameSessionService;
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {

        if (userRepository.existsByUsername("alice")) {
            return;
        }

        User alice = register("alice", "alice@example.com");
        User bob = register("bob", "bob@example.com");

        GameResponse game = gameSessionService.createGame(
                alice.getId(), "Demo Trading Floor", STARTING_CASH);

        gameSessionService.joinGame(bob.getId(), game.getInviteCode());
        gameSessionService.startGame(game.getId(), alice.getId());

        buy(game.getId(), alice.getId(), "AAPL", 12);
        buy(game.getId(), alice.getId(), "MSFT", 5);
        buy(game.getId(), bob.getId(), "TSLA", 8);
        buy(game.getId(), bob.getId(), "NVDA", 3);

        log.info("""

                ─────────────────────────────────────────────
                 Dev data seeded.
                 Sign in as  alice / {}
                         or  bob   / {}
                 Game "{}" is in progress, invite code {}
                ─────────────────────────────────────────────
                """,
                DEMO_PASSWORD, DEMO_PASSWORD, game.getName(), game.getInviteCode());
    }

    private User register(String username, String email) {

        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setEmail(email);
        request.setPassword(DEMO_PASSWORD);

        authService.register(request);

        return userRepository.findByUsername(username).orElseThrow();
    }

    /**
     * A seeded trade failing shouldn't stop the app from starting — if the live
     * price feed is unreachable we just end up with fewer demo holdings.
     */
    private void buy(Long gameId, Long userId, String symbol, int quantity) {
        try {
            gameSessionService.buyStock(gameId, userId, symbol, quantity);
        } catch (RuntimeException e) {
            log.warn("Skipped seed trade {} x{}: {}", symbol, quantity, e.getMessage());
        }
    }
}
