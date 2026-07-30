package com.stock.stock_game.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BuyStockRequest {

    @NotBlank(message = "is required")
    private String symbol;

    @NotNull(message = "is required")
    @Min(value = 1, message = "must be at least 1")
    private Integer quantity;
}
