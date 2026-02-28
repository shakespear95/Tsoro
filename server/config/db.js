/**
 * SQLite database initialization and schema migration.
 */
import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let db = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS players (
  id           TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url   TEXT,
  elo          INTEGER NOT NULL DEFAULT 1200,
  created_at   INTEGER NOT NULL,
  last_seen    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS player_stats (
  player_id  TEXT NOT NULL REFERENCES players(id),
  game_type  TEXT NOT NULL,
  wins       INTEGER NOT NULL DEFAULT 0,
  losses     INTEGER NOT NULL DEFAULT 0,
  draws      INTEGER NOT NULL DEFAULT 0,
  streak     INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, game_type)
);

CREATE TABLE IF NOT EXISTS games (
  id           TEXT PRIMARY KEY,
  game_type    TEXT NOT NULL,
  player1_id   TEXT NOT NULL REFERENCES players(id),
  player2_id   TEXT NOT NULL REFERENCES players(id),
  winner_id    TEXT REFERENCES players(id),
  forfeit      INTEGER NOT NULL DEFAULT 0,
  duration_s   INTEGER,
  move_count   INTEGER,
  elo_delta_p1 INTEGER,
  elo_delta_p2 INTEGER,
  played_at    INTEGER NOT NULL
);
`;

export function initDatabase() {
  if (db) return db;

  const dir = dirname(config.DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  db = new Database(config.DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);

  logger.info(`SQLite database ready at ${config.DB_PATH}`);
  return db;
}

export function getDatabase() {
  if (!db) throw new Error('Database not initialized');
  return db;
}
