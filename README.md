# Gruppe 13 - InfluxDB Event Position Tracking

## Installation
### Allgemein
Dieses Projekt benötigt folgende Software, um ausgeführt zu werden:
- Docker (Version 4.20.1)
- Node (Version 19.9.0)

Diese versionen wurden zum Entwickeln verwendet, es kann sein, dass das Projekt auch mit anderen Versionen funktioniert.
### Frontend
Das frontend ist mithilfe von Angular realisiert. Installiert wird es, indem in dem `frontend`-Ordner folgender Befehl ausgeführt wird:
```bash
npm install
```
Gestartet werden kann das Frontend mit dem Befehl:
```bash
npm run start
```
oder
```bash
ng serve
```

### Backend
Das Backend ist mithilfe von Node.js realisiert. Die Dependencies werden in dem `backend`-Ordner wie folgt installiert:
```bash
npm install
```
Um die Benötigte influx Datenbank in einem Docker Container zu installieren und zu starten, wird folgender Befehl ausgeführt:
```bash
docker-compose up -d
```
Gestartet werden kann das Backend mit dem Befehl:
```bash
npm run watch
```
