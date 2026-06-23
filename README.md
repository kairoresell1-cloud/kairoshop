# Kairo Shop — Fase 1

Questa è la **base reale e funzionante** di Kairo Shop:

✅ Login Google con ruoli (USER / ADMIN / OWNER / SUPER_OWNER)
✅ Super Owner automatico per `kairoresell1@gmail.com`
✅ Sistema permessi granulare per gli Admin
✅ Database completo (prodotti, varianti, prezzi bulk, ordini, fornitori, coupon, promo, audit log)
✅ Shop + carrello (solo "aggiungi al carrello", spedizione fissa 7€)
✅ Checkout senza pagamento diretto → genera codice `KS-XXXX-XXXX` e lo copia negli appunti
✅ Dashboard admin con statistiche base e link ai moduli
✅ Design Sakura/glass/dark con font Raleway, petali animati discreti
✅ Manifest PWA con il tuo logo

I moduli avanzati (BI, multilingua, AI search, 2FA, resi, ecc.) si aggiungono
nelle fasi successive sopra a questa base — dimmi semplicemente quale modulo
vuoi dopo aver testato questa Fase 1.

---

## 1. Carica su GitHub

```bash
cd kairo-shop
git init
git add .
git commit -m "Kairo Shop - Fase 1"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/kairo-shop.git
git push -u origin main
```

## 2. Crea il progetto Google OAuth (necessario per il login)

1. Vai su https://console.cloud.google.com/
2. Crea un nuovo progetto (es. "Kairo Shop")
3. Vai su **API e servizi → Schermata consenso OAuth** → tipo "Esterno" → compila nome app, email di supporto
4. Vai su **Credenziali → Crea credenziali → ID client OAuth**
   - Tipo applicazione: **Applicazione web**
   - URI di reindirizzamento autorizzati:
     `https://TUO-PROGETTO.up.railway.app/api/auth/callback/google`
5. Copia **Client ID** e **Client Secret** — ti serviranno al passo 4.

## 3. Crea il progetto su Railway

1. Vai su https://railway.app/ → accedi con GitHub
2. **New Project → Deploy from GitHub repo** → seleziona `kairo-shop`
3. **+ New → Database → Add PostgreSQL** (Railway genera da solo `DATABASE_URL`)

## 4. Variabili d'ambiente su Railway

Nel servizio del progetto (non nel database), vai su **Variables** e aggiungi:

```
NEXTAUTH_URL=https://TUO-PROGETTO.up.railway.app
NEXTAUTH_SECRET=     <- genera con: openssl rand -base64 32
GOOGLE_CLIENT_ID=    <- dal passo 2
GOOGLE_CLIENT_SECRET=<- dal passo 2
SUPER_OWNER_EMAIL=kairoresell1@gmail.com
SHIPPING_FLAT_FEE=7
STOCK_RESERVATION_MINUTES=20
```

`DATABASE_URL` viene collegata automaticamente da Railway se aggiungi la
variabile come riferimento al Postgres (Railway te lo propone da solo).

## 5. Inizializza il database

Dopo il primo deploy, da Railway apri il terminale del servizio (o in locale
con `railway run`) ed esegui:

```bash
npx prisma db push
node prisma/seed.js
```

## 6. Primo accesso

Vai sul sito e clicca "Accedi con Google" usando **kairoresell1@gmail.com**.
Al primo login questo account diventa automaticamente **Super Owner** con
accesso totale a tutta la piattaforma.

---

## Sviluppo in locale

```bash
npm install
cp .env.example .env   # poi compila i valori
npx prisma db push
node prisma/seed.js
npm run dev
```

Apri http://localhost:3000
