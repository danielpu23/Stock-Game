-- Reference only: Hibernate generates the schema at startup (ddl-auto=update).
-- Kept in sync with com.stock.stock_game.model.entity.Transaction.

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    player_session_id BIGINT NOT NULL,
    symbol VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_transactions_player_session
        FOREIGN KEY (player_session_id)
        REFERENCES player_sessions (id)
        ON DELETE CASCADE
);
