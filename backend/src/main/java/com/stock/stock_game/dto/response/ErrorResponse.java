package com.stock.stock_game.dto.response;

import java.time.LocalDateTime;

import lombok.Getter;

/**
 * Uniform JSON error body. The handlers used to return bare strings, which the
 * frontend read as {@code error.response.data.message} and always found
 * undefined — so every real error surfaced as a generic fallback message.
 */
@Getter
public class ErrorResponse {

    private final int status;
    private final String message;
    private final LocalDateTime timestamp = LocalDateTime.now();

    public ErrorResponse(int status, String message) {
        this.status = status;
        this.message = message;
    }
}
