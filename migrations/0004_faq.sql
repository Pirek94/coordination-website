-- Questions for /faq: sent by visitors through the form or written in the
-- panel, answered and published from /admin/faq.
CREATE TABLE faq_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- The public wording; the admin shortens it and removes what identifies the asker.
  question TEXT NOT NULL,
  -- Exactly what the visitor sent. Admin only, never edited.
  submitted TEXT NOT NULL DEFAULT '',
  -- Optional, admin only: the e-mail is for telling the asker the answer is out.
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  -- HTML from the panel's text editor.
  answer TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'published', 'archived')),
  -- Pinned first on /faq and on the home page.
  featured INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  -- When the asker was told about the answer; set once, so they are told once.
  notified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX faq_questions_public ON faq_questions (status, featured DESC, published_at DESC);

-- The one question the page had before answers moved to the database.
INSERT INTO faq_questions (question, answer, status, featured, published_at) VALUES (
  'Czy doradztwo to dobry wybór dla mojej firmy?',
  '<p>Odpowiedź na to pytanie nie jest jednoznaczna. Trzeba przemyśleć parę rzeczy… doradztwo jest dobrym wyborem dla firmy wtedy, gdy nie traktuje się go jako zewnętrznej opinii ani gotowej recepty, lecz jako sposób uporządkowania decyzji, które dziś wpływają na sprzedaż, marżę, operacje i rozwój firmy. Doradztwo ma sens dla firmy, która po prostu trochę błądzi i nie wie w jakim kierunku iść albo sprzedaż nie zachowuje się tak jakby tego oczekiwał właściciel.</p><p>Doradztwo nie jest natomiast dobrym wyborem, jeżeli firma szuka tylko potwierdzenia swoich wcześniejszych decyzji albo oczekuje, że ktoś z zewnątrz naprawi sprzedaż bez pracy nad ofertą, klientem, marżą i sposobem działania oraz bez zaangażowania zespołu jak i samego właściciela.</p><p>Czyli podsumowując, doradztwo może być bardzo dobrym wyborem, ale tylko wtedy, gdy jego celem jest diagnoza i poprawa jakości decyzji w firmie, a nie samo wygenerowanie kolejnych pomysłów. Dobre doradztwo powinno pomóc zobaczyć, gdzie firma realnie zarabia, które działania tworzą tylko obrót, które decyzje obniżają marżę oraz jaki jest koszt dalszego działania bez zmiany.</p>',
  'published',
  0,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);
