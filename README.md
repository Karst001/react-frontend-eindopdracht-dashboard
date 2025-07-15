# Opdrachtbeschrijving
1. [Inleiding](#inleiding)
2. [Beschrijving montage machine](#Hoe-werken-deze-machines)
3. [Koppeling ERP systeem](#Koppeling-ERP-systeem)
4. [Kernfunctionaliteiten van de website](#kernfunctionaliteiten-van-de-website)
5. [API](#api)
6. [Environment variable](#Environment-variable)
7. [Applicatie starten](#applicatie-starten)
8. [Admin login gegevens](#Admin-login-gegevens) 
9. [Beschrijving website](#applicatie-starten)

## Voorwoord.
Ik was al een heel eind met de eindopdracht en aangezien ik nog niet echt gewend ben aan Git Hub had ik dus geen PR en merges gemaakt...
Nieuw project begonnen en stapsgewijs de bestaande structuur en content van het oude project naar dit project gecopieerd dus het lijkt dat ik superman ben en binnen enkele uren heel veel bestanden e.d. gemaakt heb wat dus niet het geval is.

## Project inleiding.
Voor een fabrikant van hoogwaardige montage machines voor de flexo-grafische industrie heb ik een verzoek ontvangen om
een webapplicatie te bouwen die data van de montagemachines kan weergeven in diverse grafieken.
De fabrikant levert en installeert deze machines wereldwijd en de eindgebruikers zijn drukkerijen, deze montage machines komen in de zogenaamde 'prepress' te staan om het 
voorbereidende werkt te doen alvorens de rollen 'sleeves' met drukplaten 'plates' de drukpers in gaan. Als opdrachten worden verwerkt op de montage machines noemen we deze 'jobs'.
Deze termen zullen in de website te zien zijn omdat de website in het engels opgelevert dient te worden. 
Een drukpers is een zeer geavanceerde machine die op hoge snelheid afdrukken kan maken op bijvoorbeeld melkartonnen, verpakkingen van koekjes, snoep, vuilniszakken e.d.
Als een drukpers eenmaal start zijn er hoge kosten aan verbonden om de pers te stoppen, te denken valt aan arbeidsloon om de pers weer gereed te maken, afval materialen te verwijderen etc. 
Het is daarom van groot belang dat de montage machines 100% functioneren en de plates uiterst nauwkeuring op de sleeves gemonteerd worden.
De klant wil kunnen zien hoeveel jobs, sleevs & plates er per dag verwerkt zijn. Op de montage machine is ook data aanwezig die laat zien hoe nauwkeurig de plates gemonteerd zijn.
Dit valt buiten de scope voor de opdracht.

Scenario:
Deze fabrikant ontwerpt en fabriceert montage machines zoals onderstaand is weergegeven:

![FAMM3.0.png](src/assets/FAMM3.0.png)

### Hoe werken deze machines.
De flexibele platen worden gemonteerd op sleeves die vervolgens de drukpers ingaan om afdrukken te maken op
melkkartonnen, plastic vuilnis zakken, plastic omhulsels voor frisdranken, plastic verpakking voor snacks etc.

Omdat de consument tegenwoordig hoge eisen stelt aan drukwerk en de verpakking er zeer goed uit moet zien, zijn deze machines ontwikkeld om de flexibele platen met 
een nauwkeurigheid van 2 micron te plakken op de sleeves. Iedere sleeve komt overeen met 1 kleur in de drukpers; de totale combinatie van alle kleuren vormt het uiteindelijke resultaat in de drukpers.

De klant heeft zelf de besturingssoftware ontwikkeld en kan de resultaten van de montagedata uploaden naar een API; zodra een sleeve compleet gemonteerd is wordt de API aangestuurd 
vanuit de machine.
Ook kan de klant data uploaden naar de API als het gaat om de hoeveelheid orders die per dag verwerkt moeten worden, en een forecast van orders voor de komen week.
De machine-operator kan zo zien wat van hem/haar wordt verwacht die dag en dagen daarna. Het managementteam kan dit te allen tijde ook zien, immers het is een website.

Aangezien de te ontwikkelen website de machine niet kan aansturen heeft de klant een API met Microsoft SQL Server backend beschikbaar gesteld waar al veel data in is opgeslagen.
Deze data dient weergegeven te worden in grafieken op de website.

### Koppeling ERP systeem.
Het ERP systeem van de klant zal in de toekomst data aanleveren aan de website m.b.t. de hoeveelheid orders die per dag verwerkt moeten worden.
Aangezien dit ERP systeem nu nog niet beschikbaar is, gebruiken we een JSON dataset met vastgesteld waarden die we oploaden naar de API zodat de website de data vervolgens kan 
weergeven in grafieken.
In de website kunnen we dit triggeren en zal er een willekeure set data naar de API worden verzonden.
Hetzelfde doen we voor het aantal orders voor de volgende week zodat het management team en de machine operators kunnen zien wat de verwachte werkdruk zal zijn.

## Kernfunctionaliteiten van de website.
1. Zodra de website gestart wordt komt de gebruiker op een hoofdpagina.  Op de desktop pagina zal altijd een bedrijfsvideo worden weergegeven en daaronder diverse content om het
   bedrijf te beschrijven en wat product informatie. Deze video start automatische omdat op een desktop er vanuit wordt gegaan een goede internet verbinding te hebben.
   Op de mobile pagina wordt de video niet automatisch gestart, dit kan belastend zijn voor de performance, de gebruiker kan de video zelf starten als dat gewenst wordt.
2. Zodra je op de hoofdpagina scrollt verdwijnt de video op een gegeven moment om plaats te maken voor de producten. Als de gebruiker weer naar boven scrollt komt de video weer tevoorschijn
3. De wens van de klant is dat de menubalk bovenaan de pagina komen te staan, direct daaronder de bedrijsvideo en daaronder de overige  content.  De video is 'sticky' wat betekend dat het altijd boven aan de pagine staat en zodra de
   gebruiker naar beneden scrollt, wordt de overige content weergegeven en de video is dan de achtergrond en de content is dan op de voorgrond te zie en dekt de video af naarmate de gebruiker verder naar beneden scrollt.
   De overige content zal bestaan uit foto's van andere machines en een beschrijving. De foto's en beschrijving moeten om-en-om worden weergegeven, eerst links op de pagina een foto 
   en dan bijbehorende tekst en buttons. Dan tekst van het volgende product en bijbehorende foto, dan weer foto en tekst etc.
   Op de mobiele pagina moet altijd eerst de foto zichtbaar zijn, dan de bijbehorende tekst en buttons.
4. Als je de eerste keer op de hoofdpagina land en naar beneden scrollt, dan zullen de producten één voor één tevoorschijnkomen en ook van links-naar-rechts en rechts-naar-links geanimeerd op de pagina verschijnen. 
   Zodra alle content op de pagina is weergegeven stopt de animate, ook als je weer omhoog- of omlaag scrollt.
5. In het menu is ook een Client Portaal link nodig, deze navigeert de gebruiker naar een Sign In pagina. Alleen de website beheerder kan gebruikers toevoegen aan de database omdat de data
   gerelateerd is aan bepaalde drukkerijen dus dit moet via de administrator worden ingesteld anders zou een nieuwe gebruiker toegang kunnen krijgen tot data van andere drukkerijen.
   In de database is een admin gebruiker beschikbaar, de login gegevens kunnen gevonden worden in hoofdstuk [Administrator login](#Admin-login-gegevens)
    1. De login pagina is zo opgebouwd dat de website gebruiker eerst zijn e-mail adres moet invoeren en dan op 'Volgende' klikt
    2. Op dat moment wordt een controle uitgevoerd via de API om te kijken of deze gebruiker bestaat, za ja dan volgt de mogelijkheid om een wachtwoord in te voeren. Als het e-mailadres niet bekend is in de database wordt er een foutmelding weergegeven.
    3. Zodra het wachtwoord klopt met de waarde in de database wordt de gebruikeer ingelogd
    4. Een gebruiker die is ingelogd is krijgt toegang tot de machine data van die drukkerij, data van andere drukkerijen is niet zichtbaar
4. Een gebruiker die is ingelogd moet het volgende kunnen zien:
    1. Hoeveel orders er die dag verwerkt moeten worden en hoeveel orders er al verwerkt zijn op die dag.
    2. Wat de komende 7 dagen de verwachte orderhoeveelheid is
    3. Het managementteam moet kunnen zien wat het totaal aantal productieorders is die compleet zijn gemonteerd
    4. De machineoperator moet kunnen zien wat de gemiddelde tijd is in seconden tussen de verschillende sleeves; deze data komt direct van de montagemachine af
5. Aangezien er geen ERP systeem en montage machine van de drukkerij beschikbaar is zal de website een functionaliteit hebben waarme we data kunnen simuleren zodat we de functionaliteit van de website kunnen zien.
6. Als een Administrator inlogt is er naast de menu balk boven aan de pagina ook nog een tweede menu balk voor het:
   1. aanmaken nieuwe gebruikers (Add user)
   2. overzicht van alle gebruikers en mogelijkheid om een gebruiker te deactiveren (Edit user)
   3. Toevoegen van een product, zodra dit product is toegevoegd aan de database, wordt het gelijk zichtbaar op de hoofdpagina (Add Product)


## API.
De backend bestaat uit een Microsoft SQl Server Express Database met Stored Procedures en een een API geschreven in C#, de API kan gevonden worden op  https://softwarethatworks.ca/dashboardapi/
De API key voor deze API is:

De C# code is in de ZIP file meegestuurd.

## Environment variable
- Maak in de root map (op dezelfde hoogte als de .gitignore en package.json) een .env én een .env.dist file aan.
- Voeg het woord .env toe aan het .gitignore bestand
- Open de .env.dist en zet daar VITE_API_KEY=. De waarde laten we hier leeg. Het is conventie om environment variables in hoofdletters te schrijven. Bovendien moeten de namen altijd met VITE beginnen, omdat het framework van Vite ze anders niet kan vinden.
- Kopieer de naam van deze variabele en plak 'm in .env. Plak de waarde van jouw API key er direct achter (geen spaties of quotes):
- VITE_API_KEY=ditIsEenVoorbeeld
- Run het commando npm run build in de terminal; dit is nodig omdat het env bestand gewijzigd is
- stop nu de development server met CNTR + C
- start de server met npm run dev

## Applicatie starten.

Als je het project gecloned hebt naar jouw locale machine, installeer je eerst de `node_modules` door het volgende
commando in de terminal te runnen:

```shell
npm install
```
of gebruik de WebStorm knop (npm run dev). Open http://localhost:5173 om de website in de browser te bekijken.

## Admin login gegevens
On nieuwe gebruikers aan te maken volg deze stappen:
- login met 'Admin' en 'Welc0me64!@'
- navigeer naar 'Add new user'
- vul alle velden in 
  - voor Customer ID gebruik 'XXXXXX', dit legt de relatie voor klant 'Belmark' 
- klik op 'Add User'
- Maak een tweede gebruiker aan net als hierboven maar gebruik ditmaal Customer ID XXXXXX, dit legt de relatie naar klant 'XXXXXX'
- Log out 
- Log nu in en gebruik de login details die zojuist waren aangemaakt voor klant 'Belmark'
- Nu is te zien dat de gebruiker geen Admin rechten meer heeft en alleen toegang tot de basis functionaliteit van de website
  - Dashboard met Belmark data
  - Newsletter
  - Contact
  - Profile
- Log nu uit 
- Login met gegevens voor klant XXXXXX, nu zijn alle gegevens voor klant XXXX zichtbaar

## Gebruikers handleiding.
Zodra website start kom je op de indexpagina, hierop is een video te zien met daaronder content.
De gebruiker kan omlaag scrollen en krijgt daar meer content te zien van de machines die deze fabrikant aanbiedt. In eerste instantie wordt er een korte omschrijving gegeven op de index pagina, de gebruiker kan op de foto of bijbehorende tekst klikken en navigeert dan naar een gedetaileerde pagina met alle product informatie.

Geregistreerde gebruikers (drukkerijen) hebben een login gekregen. Zij kunnen zelf geen account aanmaken omdat de data in de database voor meerder klanten geldt en daarom kan alleen de administrator een account maken voor de eindgebruikers.
Zodra de gebruiker is ingelogd ziet deze de volgende pagina:

****** pagina schermafdruk invoegen *******

Een drukkerij kan één of meerdere mortage machines hebben en iedere machine stuurt montage data naar de API. De configuratie instellingen op de montagemachine zijn dusdanig dat alle machines ongeacht klant of type machine in één gemeenschappelijke database opgeslagen kunnen worden.
Om het zo gebruikersvriendelijk mogelijk te houden kan de gebruiker via een dropdown de machine selecteren. Dit zijn uitereerd alleen de machines van deze drukkerij.
Als de gebruiker een andere machine selecteerd zal andere data op het dashboard worden weergegeven. Tevens is het zo dat deze selectie wordt opgeslagen als globale parameter en van toepassing is op alle pagina's, dit zorgt ervoor dat de gebruiker sneller de gewenste informatie kan zien met minimale inspanningen.

Zodra de gebruiker is ingelogd zijn de volgende pagina's ter beschikking:
1. Dashboard
2. Performance Analysis with a submenu of;
    1. Total Jobs/Sleeves/Plates
    2. Average Time Between Jobs
    3. Average Time Between Sleeves
3. Overview of the production schedule
4. Machine details

Gedetaileerde informatie per pagina:
1. Dashboard, hier kan de gebruiker het overzicht zien van alle
    1. Jobs die op die dag verwerkt moeten worden
    2. Jobs die al gereed ziejn op diezelfde dag
    3. Jobs/Sleeves die gepland staan voor de volgende 2 dagen (dit is gedaan zodat de machine operator kan zien hoe druk het de volgende 2 dagen zal worden)
    4. Forecast van één week vooruit met de geplande orders
    5. Overzicht van alle verwerkte orders 'YTD Jobs', 'YTD Sleeves', 'YTD Plates' en 'MTD Jobs', de gebruiker kan op iedere groep klikken en een nieuw scherm wordt weergegeven met de onderliggende data

2. Total Jobs/Sleeves/Plates: hier kan de gebruiker het totaal aantal Jobs/Sleeves/Plates zien die verwerkt waren per maand voor een geselecteerd jaartal
3. Average Time Between Jobs: hier kan de gebruiker de gemiddelde tijd zien die is verstreken tussen de jobs, dit geeft aan hoe efficient de machine operator is
4. Average Time Between Sleeves: hier kan de gebruiker de gemiddelde tijd zien die is verstreken tussen het verwisselen van de sleeves, dit geeft aan hoe efficient de machine operator is
5. Overview of the production schedule: dit is een overzicht van één pagina met het productieschema voor deze machine, voor iedere machine kan een ander productieschema zijn
6. Machine details: op deze pagina is een overzicht te zien van machine type en gegevens zoals serie nummer, versie van het Windows Operating system, versie PLC software, AVMOM software versie (dit is de software die de klant zelf heeft ontwikkeld), de SQL Server versie (op deze montage machines wordt gebruikt gemaakt van een SQL database voor het opslaan van montage data) en ten laatste de gegevens van de AV-Connect Uploader, dit is een applicatie die communiceert met de API van deze website
