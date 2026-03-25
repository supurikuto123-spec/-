-- m0choma6qa@sutemeado.com / vFXKuJe46S
INSERT OR REPLACE INTO users (address, password, created_at) 
VALUES ('m0choma6qa@sutemeado.com', 'vFXKuJe46S', CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER));

-- r9ves5fjck@sutemeado.com / Pass123456（最初のパスワード）
INSERT OR REPLACE INTO users (address, password, created_at) 
VALUES ('r9ves5fjck@sutemeado.com', 'Pass123456', CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER));

-- 累計アドレスカウンターを2つ増加
INSERT INTO cumulative_stats (key, value) VALUES ('total_addresses', 1) ON CONFLICT(key) DO UPDATE SET value = value + 1;
INSERT INTO cumulative_stats (key, value) VALUES ('total_addresses', 1) ON CONFLICT(key) DO UPDATE SET value = value + 1;

-- 確認
SELECT address, password FROM users WHERE address IN ('m0choma6qa@sutemeado.com', 'r9ves5fjck@sutemeado.com');
