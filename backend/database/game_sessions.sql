CREATE TABLE game_sessions (
    id BIGSERIAL PRIMARY KEY,
    invite_code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    initial_cash DECIMAL(15,2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    session_creator BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_creator
        FOREIGN KEY (session_creator)
        REFERENCES users(id)
        ON DELETE CASCADE
);