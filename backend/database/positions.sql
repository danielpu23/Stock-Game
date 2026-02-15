CREATE TABLE positions (
    id BIGSERIAL PRIMARY KEY,
    player_session_id BIGINT NOT NULL,
    stock_symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,

    CONSTRAINT fk_position_player
        FOREIGN KEY (player_session_id)
        REFERENCES player_sessions(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_symbol_per_player
        UNIQUE (player_session_id, stock_symbol)
);