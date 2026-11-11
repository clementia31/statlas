import duckdb, json, os, glob, sys
src, out = sys.argv[1], sys.argv[2]
if os.path.exists(out): os.remove(out)
con = duckdb.connect(out)
for sch in ['common','immo','finance','studio']: con.execute(f'create schema if not exists {sch}')
skip = {'public.article_drafts','public.social_posts','public.studio_ideas','public.studio_idea_items','public.studio_metric_readings','common.import_log'}  # prive : pas dans la copie hors ligne
n = {}
for f in sorted(glob.glob(f'{src}/data/*.jsonl')):
    name = os.path.basename(f)[:-6]
    if name in skip or os.path.getsize(f) < 3: continue
    sch, tab = name.split('.', 1)
    q = f'"{tab}"' if sch == 'public' else f'{sch}."{tab}"'
    con.execute(f"create table {q} as select * from read_json_auto('{f}', format='newline_delimited', sample_size=-1, maximum_object_size=50000000)")
    n[name] = con.execute(f'select count(*) from {q}').fetchone()[0]
con.execute("""create view obs_values as
 select i.slug as indicator_slug, i.name_default as indicator, i.unit, e.slug as entity_slug, e.name_default as entity_name,
        e.iso_code, e.entity_type, year(o.period_start) as year, o.value_number as value, o.is_projection, s.name as source
 from observations o join indicators i on i.id = o.indicator_id join entities e on e.id = o.entity_id
 left join source_documents d on d.id = o.source_document_id left join sources s on s.id = d.source_id""")
con.execute(f"create table indicator_catalog as select * from read_json_auto('{src}/views/public.indicator_catalog.jsonl', format='newline_delimited')")
con.execute(f"create table common.fx_annual as select * from read_json_auto('{src}/views/common.fx_annual.jsonl', format='newline_delimited')")
con.execute("create index obs_ind on observations(indicator_id); create index obs_ent on observations(entity_id)")
print(json.dumps(n))
print(con.execute("select entity_name, year, value from obs_values where indicator_slug='life-expectancy-birth' and iso_code='FR' order by year desc limit 2").fetchall())
print(con.execute("select count(*), count(distinct indicator_slug), min(year), max(year) from obs_values").fetchall())
print(con.execute("describe observations").fetchall()[:6])
con.close()
