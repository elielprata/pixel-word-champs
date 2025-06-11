
-- Inserir configurações de pontuação por tamanho de palavra se não existirem
INSERT INTO public.game_settings (setting_key, setting_value, setting_type, description, category)
VALUES 
  ('points_per_3_letter_word', '10', 'number', 'Pontos por palavra de 3 letras', 'scoring'),
  ('points_per_4_letter_word', '20', 'number', 'Pontos por palavra de 4 letras', 'scoring'),
  ('points_per_5_letter_word', '30', 'number', 'Pontos por palavra de 5 letras', 'scoring'),
  ('points_per_expert_word', '50', 'number', 'Pontos por palavra expert (8+ letras)', 'scoring')
ON CONFLICT (setting_key) DO NOTHING;
