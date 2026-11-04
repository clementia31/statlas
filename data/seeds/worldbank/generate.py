import json
I=[
# slug, code, name, category, unit, hib, definition
("population-density","EN.POP.DNST","Population density","demographics","people per km2",None,"Midyear population divided by land area in square kilometres."),
("urban-population-share","SP.URB.TOTL.IN.ZS","Urban population","demographics","percent of population",None,"Share of the population living in urban areas, as defined by national statistical offices."),
("population-65-plus","SP.POP.65UP.TO.ZS","Population aged 65 and over","demographics","percent of population",None,"Share of the total population aged 65 or older."),
("population-0-14","SP.POP.0014.TO.ZS","Population aged 0 to 14","demographics","percent of population",None,"Share of the total population aged 0 to 14."),
("birth-rate","SP.DYN.CBRT.IN","Birth rate","demographics","per 1,000 people",None,"Live births during the year per 1,000 people (crude birth rate)."),
("death-rate","SP.DYN.CDRT.IN","Death rate","demographics","per 1,000 people",None,"Deaths during the year per 1,000 people (crude death rate)."),
("net-migration","SM.POP.NETM","Net migration","demographics","people",None,"Number of immigrants minus number of emigrants, including citizens and non-citizens."),
("land-area","AG.LND.TOTL.K2","Land area","geography","km2",None,"Country area excluding inland water bodies, in square kilometres."),
("infant-mortality","SP.DYN.IMRT.IN","Infant mortality rate","health","per 1,000 live births",False,"Deaths of infants under one year old per 1,000 live births."),
("under5-mortality","SH.DYN.MORT","Under-5 mortality rate","health","per 1,000 live births",False,"Probability of dying before age five, per 1,000 live births."),
("maternal-mortality","SH.STA.MMRT","Maternal mortality ratio","health","per 100,000 live births",False,"Women who die from pregnancy-related causes per 100,000 live births (modelled estimate)."),
("health-expenditure-gdp","SH.XPD.CHEX.GD.ZS","Health expenditure","health","percent of gdp",None,"Current health expenditure, public and private, as a share of GDP."),
("health-expenditure-per-capita","SH.XPD.CHEX.PC.CD","Health expenditure per person","health","usd",None,"Current health expenditure per person, in current US dollars."),
("physicians-density","SH.MED.PHYS.ZS","Physicians","health","per 1,000 people",True,"Medical doctors per 1,000 people."),
("literacy-rate-adult","SE.ADT.LITR.ZS","Adult literacy rate","education","percent of population 15+",True,"Share of people aged 15 and over who can read and write a short simple statement about their everyday life."),
("school-enrollment-primary","SE.PRM.ENRR","Primary school enrollment","education","percent gross",None,"Gross enrollment ratio in primary education; can exceed 100% because of over- and under-age pupils."),
("school-enrollment-tertiary","SE.TER.ENRR","Tertiary education enrollment","education","percent gross",True,"Gross enrollment ratio in tertiary (university-level) education."),
("education-expenditure-gdp","SE.XPD.TOTL.GD.ZS","Public spending on education","education","percent of gdp",None,"Government expenditure on education as a share of GDP."),
("renewable-energy-share","EG.FEC.RNEW.ZS","Renewable energy","environment","percent of final energy consumption",True,"Share of renewable energy in total final energy consumption."),
("forest-area-share","AG.LND.FRST.ZS","Forest area","environment","percent of land area",None,"Land under natural or planted stands of trees of at least 5 metres, as a share of land area."),
("electricity-access","EG.ELC.ACCS.ZS","Access to electricity","infrastructure","percent of population",True,"Share of the population with access to electricity."),
("co2-emissions-total","EN.GHG.CO2.MT.CE.AR5","CO2 emissions","environment","mt co2e",None,"Total carbon dioxide emissions excluding land use, in million tonnes."),
("pm25-exposure","EN.ATM.PM25.MC.M3","Air pollution (PM2.5)","environment","µg/m3",False,"Mean annual population-weighted exposure to fine particulate matter (PM2.5)."),
("exports-gdp","NE.EXP.GNFS.ZS","Exports","economy","percent of gdp",None,"Exports of goods and services as a share of GDP."),
("imports-gdp","NE.IMP.GNFS.ZS","Imports","economy","percent of gdp",None,"Imports of goods and services as a share of GDP."),
("trade-gdp","NE.TRD.GNFS.ZS","Trade openness","economy","percent of gdp",None,"Sum of exports and imports of goods and services as a share of GDP."),
("current-account-gdp","BN.CAB.XOKA.GD.ZS","Current account balance","economy","percent of gdp",None,"Current account balance as a share of GDP; positive values are surpluses."),
("remittances-gdp","BX.TRF.PWKR.DT.GD.ZS","Remittances received","economy","percent of gdp",None,"Personal remittances received from workers abroad, as a share of GDP."),
("agriculture-share-gdp","NV.AGR.TOTL.ZS","Agriculture","economy","percent of gdp",None,"Value added by agriculture, forestry and fishing as a share of GDP."),
("industry-share-gdp","NV.IND.TOTL.ZS","Industry","economy","percent of gdp",None,"Value added by industry, including construction, as a share of GDP."),
("services-share-gdp","NV.SRV.TOTL.ZS","Services","economy","percent of gdp",None,"Value added by services as a share of GDP."),
("gni-per-capita-atlas","NY.GNP.PCAP.CD","GNI per capita (Atlas method)","economy","usd",True,"Gross national income per person, converted with the World Bank Atlas method, in current US dollars."),
("extreme-poverty","SI.POV.DDAY","Extreme poverty","development","percent of population",False,"Share of the population living below the international poverty line ($3.00 a day, 2021 PPP)."),
("rd-expenditure-gdp","GB.XPD.RSDV.GD.ZS","Research and development spending","science","percent of gdp",True,"Gross domestic expenditure on research and development as a share of GDP."),
("tourist-arrivals","ST.INT.ARVL","International tourist arrivals","economy","people",None,"Number of international overnight visitors arriving in the country."),
("tax-revenue-gdp","GC.TAX.TOTL.GD.ZS","Tax revenue","public-finance","percent of gdp",None,"Compulsory transfers to the central government for public purposes, as a share of GDP."),
("military-expenditure-gdp","MS.MIL.XPND.GD.ZS","Military expenditure","military","percent of gdp",None,"Military expenditure as a share of GDP (SIPRI data published by the World Bank)."),
("military-expenditure-usd","MS.MIL.XPND.CD","Military expenditure (US$)","military","usd",None,"Military expenditure in current US dollars (SIPRI data published by the World Bank)."),
("armed-forces-personnel","MS.MIL.TOTL.P1","Armed forces personnel","military","people",None,"Active-duty military personnel, including paramilitary forces."),
("labor-force-participation","SL.TLF.CACT.ZS","Labour force participation","labour","percent of population 15+",None,"Share of the population aged 15 and over that is economically active (ILO modelled estimate)."),
("female-labor-participation","SL.TLF.CACT.FE.ZS","Female labour force participation","labour","percent of female population 15+",None,"Share of women aged 15 and over who are economically active (ILO modelled estimate)."),
("youth-unemployment","SL.UEM.1524.ZS","Youth unemployment","labour","percent of labor force 15-24",False,"Share of the labour force aged 15 to 24 without work but available and seeking employment (ILO modelled estimate)."),
("internet-users","IT.NET.USER.ZS","Internet users","infrastructure","percent of population",True,"Share of the population who used the internet in the last three months."),
("mobile-subscriptions","IT.CEL.SETS.P2","Mobile phone subscriptions","infrastructure","per 100 people",None,"Mobile cellular telephone subscriptions per 100 people."),
("homicide-rate","VC.IHR.PSRC.P5","Homicide rate","society","per 100,000 people",False,"Intentional homicides per 100,000 people (UNODC data published by the World Bank)."),
("women-in-parliament","SG.GEN.PARL.ZS","Women in parliament","politics","percent of seats",None,"Share of seats held by women in national parliaments (lower or single house)."),
]
json.dump(I,open('ind.json','w'))
def q(s): return "'"+s.replace("'","''")+"'"
head="insert into categories (slug, name_default) select 'society','Society' where not exists (select 1 from categories where slug='society');\n"
head+="insert into indicators (slug, name_default, category_id, unit, definition, higher_is_better)\nselect v.slug, v.name, c.id, v.unit, v.def, v.hib from (values\n"
head+=",\n".join(f"({q(s)},{q(n)},{q(cat)},{q(u)},{q(d)},{'null' if h is None else ('true' if h else 'false')}::boolean)" for s,code,n,cat,u,h,d in I)
head+="\n) v(slug,name,cat,unit,def,hib) join categories c on c.slug=v.cat\non conflict (slug) do nothing;\n"
open('01_indicators.sql','w').write(head)
batches=[I[i:i+6] for i in range(0,len(I),6)]
for bi,b in enumerate(batches):
    sql="select * from (values\n"+",\n".join(f"({q(s)}, public.import_worldbank({q(code)},{q(s)},{q(u)},{q(n)},date '2026-11-04'))" for s,code,n,cat,u,h,d in b)+"\n) t(slug, rows_loaded);"
    open(f'b{bi:02d}.sql','w').write(sql)
print(len(I),len(batches))
