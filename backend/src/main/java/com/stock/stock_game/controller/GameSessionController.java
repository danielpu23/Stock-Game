package com.stock.stock_game.controller;

import com.stock.stock_game.model.entity.GameSession;
import com.stock.stock_game.service.GameSessionService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/games")
public class GameSessionController {

    private final GameSessionService service;

    public GameSessionController(GameSessionService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public GameSession createGame(@RequestParam Long userId,
                                  @RequestParam String name,
                                  @RequestParam BigDecimal initialCash) {

        return service.createGame(userId, name, initialCash);
    }

    @PostMapping("/join")
    public String joinGame(@RequestParam Long userId,
                           @RequestParam String inviteCode) {

        service.joinGame(userId, inviteCode);
        return "Joined successfully";
    }
}