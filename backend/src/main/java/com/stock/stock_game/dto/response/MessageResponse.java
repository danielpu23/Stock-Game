package com.stock.stock_game.dto.response;

import lombok.Getter;

/** Success acknowledgement, so every response from the API is JSON. */
@Getter
public class MessageResponse {

    private final String message;

    public MessageResponse(String message) {
        this.message = message;
    }
}
