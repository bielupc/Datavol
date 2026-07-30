# Registre d'entrenament — Mama i Papa

Aplicació web per veure l'evolució dels entrenaments a partir dels PDFs que dóna l'entrenador.

- **Dos perfils**: Mama i Papa, amb dades independents.
- **Resum** amb un gràfic gran on tries què mires (volum, repeticions, temps o exercicis) i un
  formatget del repartiment per grup muscular (per temps, volum o repeticions).
- **Millors marques** de tots els exercicis, del pes més alt al més baix.
- **Calendari de sessions** amb mapa de calor anual, ratxa de setmanes seguides i el detall de
  cada dia a un clic.
- **Fitxa de cada exercici** amb l'animació, els músculs treballats i l'evolució del pes,
  les repeticions, el temps sota tensió i el volum.
- **Importar PDFs nous** des de la mateixa aplicació, amb previsualització abans de desar.
- Interfície clara i de lletra gran, tota en **català**.

## Posar-ho en marxa

Cal tenir **Docker** i **Docker Compose**.

```bash
# 1. Descarregar el catàleg d'exercicis (~295 MB). Només el primer cop.
./scripts/fetch-dataset.sh

# 2. Arrencar-ho tot
docker compose up --build
```

Quan acabi, obre **http://localhost:8080**.

La primera arrencada crea la base de dades i hi carrega `1.pdf` i `2.pdf` al perfil de la Mama
(11 sessions, 14 exercicis, 76 registres). El perfil del Papa comença buit.

Per aturar-ho: `docker compose down`. Les dades es conserven en un volum de Docker.
Per començar de zero: `docker compose down -v`.

> **Si Docker Desktop no s'està executant** i surt l'error `Cannot connect to the Docker daemon`,
> fes servir el dimoni del sistema posant `DOCKER_CONTEXT=default` davant de cada ordre:
> `DOCKER_CONTEXT=default docker compose up --build`.

## Afegir un PDF nou

Ves a la pestanya **Importar**, comprova a dalt a la dreta que el perfil és el correcte i
arrossega-hi el PDF. Abans de desar res veuràs què s'afegirà: sessions noves, exercicis nous i
quants registres. Si un exercici no existeix, es crea sol i se li busca una animació al catàleg.

Reimportar el mateix PDF no duplica res, i cada importació es pot desfer.

## Estructura

| Carpeta | Què hi ha |
|---|---|
| `api/` | Servidor Fastify + PostgreSQL. Hi viu el parser dels PDFs. |
| `web/` | Interfície React + Vite. |
| `data/exercises-dataset/` | Catàleg d'exercicis descarregat (no es guarda al repositori). |
| `scripts/` | `fetch-dataset.sh` |

## Desenvolupament

```bash
# Base de dades
DOCKER_CONTEXT=default docker compose up -d db

# API (port 3001)
cd api && npm install
DATABASE_URL=postgres://gym:gym@localhost:5433/gym \
DATASET_DIR=../data/exercises-dataset SEED_DIR=.. npm run dev

# Interfície (port 5173)
cd web && npm install && npm run dev
```

Per comprovar que el parser llegeix bé els PDFs:

```bash
cd api && npm run parser:check
```

Contrasta els dos PDFs amb valors verificats a mà i falla si algun no quadra.

## Crèdits

Les animacions i fitxes dels exercicis venen del catàleg
[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)
(imatges © [Gym visual](https://gymvisual.com/)).
