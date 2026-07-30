-- Reference only: Hibernate generates the schema at startup (ddl-auto=update).
-- Kept in sync with com.stock.stock_game.model.entity.StockHolding.

CREATE TABLE stock_holdings (
    id BIGSERIAL PRIMARY KEY,
    player_session_id BIGINT NOT NULL,
    symbol VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    average_price NUMERIC(15, 2) NOT NULL,

    CONSTRAINT fk_stock_holdings_player_session
        FOREIGN KEY (player_session_id)
        REFERENCES player_sessions (id)
        ON DELETE CASCADE,

    CONSTRAINT unique_symbol_per_player
        UNIQUE (player_session_id, symbol)
);
