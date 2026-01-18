-- Seed Records with Sample Data
-- マイグレーション後に実行

-- サンプルレコード1: 胡桃チーム
INSERT INTO records (title, time_ms, category_slug, runner_name, platform, game_version, theater_buff, leyline_buff, main_attacker_ids, party_ids, video_url)
VALUES (
  'WL9 400EE - 1:23.456',
  83456,
  'wl9_400ee',
  'SpeedRunner01',
  'PC',
  '5.3',
  FALSE,
  FALSE,
  ARRAY['Hu Tao'],
  ARRAY['Hu Tao', 'Yelan', 'Xingqiu', 'Zhongli'],
  'https://youtu.be/example1'
);

-- サンプルレコード2: 雷電チーム
INSERT INTO records (title, time_ms, category_slug, runner_name, platform, game_version, theater_buff, leyline_buff, main_attacker_ids, party_ids, video_url)
VALUES (
  'WL9 400EE - 1:45.789',
  105789,
  'wl9_400ee',
  'RTAMaster',
  'PC',
  '5.3',
  FALSE,
  TRUE,
  ARRAY['Raiden Shogun'],
  ARRAY['Raiden Shogun', 'Bennett', 'Kaedehara Kazuha', 'Nahida'],
  'https://youtu.be/example2'
);

-- サンプルレコード3: ヌヴィレットチーム
INSERT INTO records (title, time_ms, category_slug, runner_name, platform, game_version, theater_buff, leyline_buff, main_attacker_ids, party_ids, video_url)
VALUES (
  'WL9 400EE - 1:12.345',
  72345,
  'wl9_400ee',
  'WaterDragon',
  'PS5',
  '5.2',
  TRUE,
  FALSE,
  ARRAY['Neuvillette'],
  ARRAY['Neuvillette', 'Furina', 'Kaedehara Kazuha', 'Zhongli'],
  'https://youtu.be/example3'
);

-- サンプルレコード4: マーヴィカチーム
INSERT INTO records (title, time_ms, category_slug, runner_name, platform, game_version, theater_buff, leyline_buff, main_attacker_ids, party_ids, video_url)
VALUES (
  'Enkanomiya - 2:05.123',
  125123,
  'enkanomiya',
  'PyroKing',
  'PC',
  '5.3',
  FALSE,
  FALSE,
  ARRAY['Mavuika'],
  ARRAY['Mavuika', 'Xilonen', 'Bennett', 'Citlali'],
  'https://youtu.be/example4'
);

-- サンプルレコード5: アルレッキーノチーム
INSERT INTO records (title, time_ms, category_slug, runner_name, platform, game_version, theater_buff, leyline_buff, main_attacker_ids, party_ids, video_url)
VALUES (
  'Local Legend - 0:58.999',
  58999,
  'local_legend',
  'FatherOfAll',
  'Mobile',
  '5.3',
  TRUE,
  TRUE,
  ARRAY['Arlecchino'],
  ARRAY['Arlecchino', 'Yelan', 'Xingqiu', 'Zhongli'],
  'https://youtu.be/example5'
);
