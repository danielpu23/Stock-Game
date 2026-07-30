-- Reference only: Hibernate generates the schema at startup (ddl-auto=update).
-- Kept in sync with com.stock.stock_game.model.entity.PlayerSession.

CREATE TABLE player_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    game_session_id BIGINT NOT NULL,
    cash_balance NUMERIC(15, 2) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_player_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_player_sessions_game
        FOREIGN KEY (game_session_id)
        REFERENCES game_sessions (id)
        ON DELETE CASCADE,

    CONSTRAINT unique_player_per_session
        UNIQUE (user_id, game_session_id)
);
