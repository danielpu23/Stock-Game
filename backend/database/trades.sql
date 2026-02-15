CREATE TABLE trades (
    id BIGSERIAL PRIMARY KEY,
    player_session_id BIGINT NOT NULL,
    stock_symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    trade_type VARCHAR(10) NOT NULL,
    executed_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_player_session
        FOREIGN KEY (player_session_id)
        REFERENCES player_sessions(id)
        ON DELETE CASCADE
);