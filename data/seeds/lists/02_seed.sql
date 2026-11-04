insert into lists (slug,title,subtitle,category,value_label,unit,method,updated_at) values ('most-expensive-paintings-auction','The most expensive paintings ever sold at auction','Public auction results, final price including buyer''s premium','Culture','Price (US$ million)','usd million','Paintings only (sculptures excluded). Prices are final auction prices including the buyer''s premium, in nominal US dollars, not adjusted for inflation. Flag = country of birth of the artist (present-day borders).',date '2026-11-04') on conflict (slug) do update set title=excluded.title, subtitle=excluded.subtitle, method=excluded.method, updated_at=excluded.updated_at;
delete from list_items where list_id=(select id from lists where slug='most-expensive-paintings-auction');
insert into list_items (list_id,rank,title,subtitle,country_iso,year,value,status,detail) values
((select id from lists where slug='most-expensive-paintings-auction'),1,'Salvator Mundi','Leonardo da Vinci','IT',2017,450.3,'verified','Christie''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),2,'Portrait of Elisabeth Lederer','Gustav Klimt','AT',2025,236.4,'verified','Sotheby''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),3,'Shot Sage Blue Marilyn','Andy Warhol','US',2022,195.0,'verified','Christie''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),4,'Number 7A','Jackson Pollock','US',2026,181.2,'verified','Christie''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),5,'Les Femmes d''Alger (Version O)','Pablo Picasso','ES',2015,179.4,'verified','Christie''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),6,'Nu couché','Amedeo Modigliani','IT',2015,170.4,'verified','Christie''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),7,'Nu couché (sur le côté gauche)','Amedeo Modigliani','IT',2018,157.2,'verified','Sotheby''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),8,'Les Poseuses, ensemble (petite version)','Georges Seurat','FR',2022,149.2,'verified','Christie''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),9,'Three Studies of Lucian Freud','Francis Bacon','IE',2013,142.4,'verified','Christie''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),10,'Twelve Landscape Screens','Qi Baishi','CN',2017,140.8,'verified','Poly Auction, Beijing'),
((select id from lists where slug='most-expensive-paintings-auction'),11,'Femme à la montre','Pablo Picasso','ES',2023,139.4,'verified','Sotheby''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),12,'La Montagne Sainte-Victoire','Paul Cézanne','FR',2022,137.8,'verified','Christie''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),13,'L''empire des lumières','René Magritte','BE',2024,121.2,'verified','Christie''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),14,'The Scream (pastel)','Edvard Munch','NO',2012,119.9,'verified','Sotheby''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),15,'Verger avec cyprès','Vincent van Gogh','NL',2022,117.2,'verified','Christie''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),16,'Fillette à la corbeille fleurie','Pablo Picasso','ES',2018,115.0,'verified','Christie''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),17,'Meules','Claude Monet','FR',2019,110.7,'verified','Sotheby''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),18,'Untitled (1982)','Jean-Michel Basquiat','US',2017,110.5,'verified','Sotheby''s New York'),
((select id from lists where slug='most-expensive-paintings-auction'),19,'Dame mit Fächer','Gustav Klimt','AT',2023,108.4,'verified','Sotheby''s London (£85.3m)'),
((select id from lists where slug='most-expensive-paintings-auction'),20,'Nude, Green Leaves and Bust','Pablo Picasso','ES',2010,106.5,'verified','Christie''s New York');
insert into lists (slug,title,subtitle,category,value_label,unit,method,updated_at) values ('most-expensive-paintings-private','The most expensive paintings sold privately','Private sales as reported in the press — prices not officially confirmed','Culture','Reported price (US$ million)','usd million','Private sales are not public: prices come from press reports and court documents and should be read as orders of magnitude. Flag = country of birth of the artist (present-day borders).',date '2026-11-04') on conflict (slug) do update set title=excluded.title, subtitle=excluded.subtitle, method=excluded.method, updated_at=excluded.updated_at;
delete from list_items where list_id=(select id from lists where slug='most-expensive-paintings-private');
insert into list_items (list_id,rank,title,subtitle,country_iso,year,value,status,detail) values
((select id from lists where slug='most-expensive-paintings-private'),1,'Interchange','Willem de Kooning','NL',2015,300.0,'reported','Private sale'),
((select id from lists where slug='most-expensive-paintings-private'),2,'The Card Players','Paul Cézanne','FR',2011,250.0,'reported','Private sale'),
((select id from lists where slug='most-expensive-paintings-private'),3,'Nafea Faa Ipoipo?','Paul Gauguin','FR',2014,210.0,'reported','Private sale — price disputed in a 2017 court case'),
((select id from lists where slug='most-expensive-paintings-private'),4,'Number 17A','Jackson Pollock','US',2015,200.0,'reported','Private sale'),
((select id from lists where slug='most-expensive-paintings-private'),5,'Portrait of Adele Bloch-Bauer I','Gustav Klimt','AT',2006,135.0,'reported','Private sale');
update lists set sources = 'Auction results from Christie''s, Sotheby''s and Poly Auction, cross-checked with ARTnews, Artsy, Artprice and press reports' where slug = 'most-expensive-paintings-auction';
update lists set sources = 'Press reports (Artnet, The National, Masterworks compilation) and court records for the Gauguin sale' where slug = 'most-expensive-paintings-private';
