CREATE TABLE player_sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    cash_balance DECIMAL(15, 2) NOT NULL,
    joined_at TIMESTAMP DEFAULT NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
    
    CONSTRAINT fk_session
        FOREIGN KEY(session_id) 
        REFERENCES game_sessions(id)
        ON DELETE CASCADE
    
    CONSTRAINT unique_player_per_session
    UNIQUE (user_id, session_id)
);