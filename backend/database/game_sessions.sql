-- Reference only: Hibernate generates the schema at startup (ddl-auto=update).
-- Kept in sync with com.stock.stock_game.model.entity.GameSession.

CREATE TABLE game_sessions (
    id BIGSERIAL PRIMARY KEY,
    invite_code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    initial_cash NUMERIC(15, 2) NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_game_sessions_created_by
        FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE CASCADE
);
