package com.stock.stock_game.exception;

/** The caller is authenticated but not allowed to touch this resource. */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
