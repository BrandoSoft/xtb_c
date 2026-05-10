# XTB Clone - Backend API

## Status Projektu: Etap 1 i 2 zakończony

### AK):
*   **Inicjalizacja środowiska**: Konfiguracja serwera Express.js oraz połączenia z bazą danych MongoDB Atlas.
*   **Architektura plików**: Wprowadzenie profesjonalnego podziału na foldery: `models/`, `routes/`, `middleware/`.
*   **Model Użytkownika**: Stworzenie schematu Mongoose dla użytkowników (User Model) z walidacją pól.
*   **Podstawowy CRUD**: Implementacja tras API (`GET`, `POST`, `PUT`, `DELETE`) do zarządzania profilami użytkowników.
*   **Zaawansowana Obsługa Błędów (Punkt 2 projektu)**:
    *   Stworzenie centralnego `errorMiddleware` do standaryzacji odpowiedzi błędu w formacie JSON.
    *   Implementacja `express-async-handler` do czystej obsługi operacji asynchronicznych bez nadmiarowych bloków try-catch.
    *   Obsługa specyficznych kodów błędów: **400 Bad Request** (dla błędnych formatów ID i duplikatów) oraz **404 Not Found**.
    *   Zabezpieczenie przed wyciekiem danych (ukrywanie Stack Trace w trybie produkcyjnym).
*   **Dokumentacja Swagger**: Pełna konfiguracja Swagger UI pod adresem `/api-docs` wraz z opisem parametrów ścieżki i modeli.
    System transakcyjny (waluty + akcje): Implementacja pełnego modułu kupna i sprzedaży aktywów z aktualizacją balansu i portfela użytkownika.
*   **Rozszerzenie modelu użytkownika:** Dodanie struktury portfolio (waluty + akcje) z polami: amount, lastBuyPrice, profit.
*   **Dodanie modelu Transaction:** (typ, aktywo, cena, ilość, zysk).
*   **Endpointy transakcyjne**
*   **Diagramy techniczne**

---

### SK)
*   **Bezpieczeństwo haseł **:
    *   Implementacja biblioteki **bcryptjs** do bezpiecznego przechowywania danych wrażliwych.
    *   Stworzenie middleware **pre-save** w modelu użytkownika, który automatycznie hashuje hasło przed zapisem do bazy.
    *   Zabezpieczenie przed ponownym hashowaniem haseł przy edycji profilu (`isModified`).
*   **System Autentykacji i JWT**:
    *   Implementacja metody `matchPassword` do bezpiecznej weryfikacji poświadczeń podczas logowania.
    *   Stworzenie endpointu logowania (`POST /api/users/login`) wystawiającego tokeny **JSON Web Token (JWT)**.
    *   Opracowanie funkcji `generateToken` zarządzającej czasem wygasania dostępu (30 dni).
*   **Ochrona zasobów (Middleware Autoryzacji)**:
    *   Stworzenie autorskiego middleware `protect`, który weryfikuje poprawność tokena w nagłówku **Authorization: Bearer**.
    *   Implementacja mechanizmu wyciągania danych zalogowanego użytkownika (`req.user`) bezpośrednio z tokena.
    *   Zabezpieczenie trasy profilu (`GET /api/users/profile`), uniemożliwiające dostęp nieautoryzowanym żądaniom.
*   **Rozszerzona dokumentacja Swagger**:
    *   Konfiguracja **Security Schemes (Bearer Auth)** w Swagger UI, umożliwiająca testowanie zablokowanych tras po zalogowaniu.
    *   Integracja opisów OpenAPI dla nowych endpointów logowania i profilu użytkownika.
*   **Prywatność danych**:
    *   Implementacja mechanizmu usuwania hasła (`delete userResponse.password`) z odpowiedzi serwera (Response Body) dla wszystkich endpointów użytkownika.

---

---

### AM (Adrian Michałowski)
* **Integracja zewnętrznych API finansowych**:
    * **Narodowy Bank Polski (NBP)**: Implementacja serwisu pobierającego aktualne tabele kursów walut (USD, EUR, GBP, CHF).
    * **Alpha Vantage**: Integracja z profesjonalnym API giełdowym dla 5 kluczowych spółek technologicznych (AAPL, MSFT, AMZN, GOOGL, TSLA) z wykorzystaniem bezpiecznych kluczy API w zmiennych środowiskowych.
* **Autorski Algorytm Market Noise**:
    * Opracowanie funkcji symulującej rzeczywiste wahania rynkowe poprzez dodawanie losowego "szumu" (+/- 0.05%) do statycznych kursów.
    * Zapewnienie efektu "żywego rynku" na frontendzie bez konieczności nadmiarowego odświeżania danych z API.
* **Zaawansowany System Smart Caching**:
    * Implementacja mechanizmu **Lazy Loading**, który pobiera dane z zewnętrznych serwerów tylko raz dziennie, drastycznie redukując zużycie limitów API.
    * Zastosowanie asynchronicznych opóźnień (`delay`) podczas inicjalizacji danych giełdowych, aby uniknąć blokad typu *Rate Limit* przy darmowych kluczach dostępowych.
* **Rozbudowa Architektury i Dokumentacji**:
    * Wprowadzenie nowej warstwy usługowej (`services/`) w celu odseparowania logiki pobierania danych od kontrolerów tras.
    * Stworzenie dedykowanego modułu `marketRoutes.js` zarządzającego danymi rynkowymi.
    * Pełna dokumentacja Swagger dla nowych endpointów: `GET /api/market/rates` oraz `GET /api/market/stocks`.



--- 
### Diagram architektury backendu (Node.js + Express + MongoDB)

                          ┌──────────────────────────────┐
                          │          FRONTEND            │
                          │           (React)            │
                          └───────────────┬──────────────┘
                                          │
                                          │  HTTP (REST API)
                                          ▼
                    ┌────────────────────────────────────────────┐
                    │                 EXPRESS API                 │
                    │                (server.js)                  │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
        ┌──────────────────────┐       ┌────────────────────────┐
        │      ROUTES          │       │     MIDDLEWARE          │
        │ (marketRoutes, auth) │       │  protect (JWT auth)     │
        └───────────┬──────────┘       └──────────┬─────────────┘
                    │                               │
                    ▼                               ▼
        ┌──────────────────────┐       ┌────────────────────────┐
        │     CONTROLLERS      │       │   ERROR HANDLING        │
        │ (marketController)   │       │ asyncHandler, 404, etc. │
        └───────────┬──────────┘       └────────────────────────┘
                    │
                    │  logika biznesowa:
                    │  - kupno/sprzedaż walut
                    │  - kupno/sprzedaż akcji
                    │  - aktualizacja portfolio
                    │  - aktualizacja balansu
                    │  - zapis transakcji
                    ▼
        ┌────────────────────────────────────────────────────────┐
        │                        SERVICES                        │
        │  rateService → NBP tabela C (bid/ask)                  │
        │  stockService → Alpha Vantage (GLOBAL_QUOTE)           │
        │  - cache dzienny                                       │
        │  - szum rynkowy                                        │
        └──────────────────────────┬─────────────────────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────────┐
                     │            MODELS             │
                     │        (Mongoose ODM)         │
                     ├──────────────────────────────┤
                     │ User:                         │
                     │  - balance                    │
                     │  - portfolio:                 │
                     │      currencies[]             │
                     │      stocks[]                 │
                     ├──────────────────────────────┤
                     │ Transaction:                  │
                     │  - type (buy/sell)            │
                     │  - assetType (currency/stock) │
                     │  - symbol                     │
                     │  - quantity                   │
                     │  - price                      │
                     │  - totalValue                 │
                     │  - profit                     │
                     └──────────────────────────────┘
                                   │
                                   │  MongoDB queries
                                   ▼
                     ┌──────────────────────────────┐
                     │            MONGODB            │
                     │  (Atlas / lokalnie / Docker) │
                     └──────────────────────────────┘

---

### Diagram bazy danych (ERD) – User + Transaction

```
┌──────────────────────────────────────────────────────────┐
│                          USER                             │
├──────────────────────────────────────────────────────────┤
│ _id: ObjectId                                             │
│ email: String                                             │
│ password: String                                          │
│ balance: Number                                           │
│                                                          │
│ portfolio:                                                │
│   ┌────────────────────────────────────────────────────┐  │
│   │                 currencies[]                       │  │
│   ├────────────────────────────────────────────────────┤  │
│   │ code: String (USD/EUR/GBP/CHF)                     │  │
│   │ amount: Number                                     │  │
│   │ lastBuyPrice: Number                               │  │
│   │ profit: Number                                     │  │
│   └────────────────────────────────────────────────────┘  │
│                                                          │
│   ┌────────────────────────────────────────────────────┐  │
│   │                   stocks[]                          │  │
│   ├────────────────────────────────────────────────────┤  │
│   │ symbol: String (AAPL/MSFT/TSLA/GOOGL/AMZN)          │  │
│   │ amount: Number                                      │  │
│   │ lastBuyPrice: Number                                │  │
│   │ profit: Number                                      │  │
│   └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                           │ 1
                           │
                           │ has many
                           ▼
┌──────────────────────────────────────────────────────────┐
│                      TRANSACTION                         │
├──────────────────────────────────────────────────────────┤
│ _id: ObjectId                                             │
│ user: ObjectId (ref → User)                               │
│ type: "buy" | "sell"                                      │
│ assetType: "currency" | "stock"                           │
│ symbol: String                                            │
│ quantity: Number                                          │
│ price: Number                                             │
│ totalValue: Number                                        │
│ profit: Number (only for sell)                            │
│ createdAt: Date                                           │
└──────────────────────────────────────────────────────────┘
```
___

### ### Diagram przepływu JWT (autoryzacja użytkownika)

```
                          ┌──────────────────────────────┐
                          │      UŻYTKOWNIK (Frontend)    │
                          └───────────────┬──────────────┘
                                          │
                                          │ 1. POST /login
                                          │    (email + password)
                                          ▼
                    ┌────────────────────────────────────────────┐
                    │               AUTH CONTROLLER               │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 2. Weryfikacja hasła (bcrypt)
                                    │ 3. Generowanie JWT (userId)
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │           JWT TOKEN (signed)               │
                    │   - userId                                 │
                    │   - expiresIn                              │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 4. Token wraca do frontendu
                                    ▼
                          ┌──────────────────────────────┐
                          │  FRONTEND zapisuje token      │
                          │  (localStorage / memory)      │
                          └───────────────┬──────────────┘
                                          │
                                          │ 5. Każde żądanie:
                                          │    Authorization: Bearer <token>
                                          ▼
                    ┌────────────────────────────────────────────┐
                    │              protect middleware             │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 6. Weryfikacja tokena (jwt.verify)
                                    │ 7. Pobranie usera z DB
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │           ROUTES / CONTROLLERS             │
                    │   (market, portfolio, transactions)        │
                    └────────────────────────────────────────────┘
```

### Diagram logiki portfolio (waluty + akcje)

```
                          ┌──────────────────────────────┐
                          │      UŻYTKOWNIK (Frontend)    │
                          └───────────────┬──────────────┘
                                          │
                                          │ 1. POST /buy-* lub /sell-*
                                          ▼
                    ┌────────────────────────────────────────────┐
                    │             marketController                │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 2. Pobranie kursu:
                                    │    - waluty → NBP tabela C
                                    │    - akcje → Alpha Vantage
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │               SERVICES                      │
                    │   rateService / stockService                │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 3. Obliczenia:
                                    │    - price (bid/ask)
                                    │    - totalCost / totalGain
                                    │    - profit (sell only)
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │               USER MODEL                    │
                    ├────────────────────────────────────────────┤
                    │ balance: update (+/-)                      │
                    │ portfolio:                                  │
                    │   currencies[] / stocks[]:                  │
                    │     - amount += / -= quantity               │
                    │     - lastBuyPrice = price (buy)            │
                    │     - profit += calculatedProfit (sell)     │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 4. Zapis historii
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │             TRANSACTION MODEL               │
                    │   - type (buy/sell)                         │
                    │   - assetType (currency/stock)              │
                    │   - symbol, quantity, price                 │
                    │   - totalValue, profit                      │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 5. Odpowiedź do frontendu
                                    ▼
                          ┌──────────────────────────────┐
                          │   balance + portfolio + tx    │
                          └──────────────────────────────┘
```
### Diagram działania cache (NBP + Alpha Vantage)

```
                          ┌──────────────────────────────┐
                          │      marketController         │
                          └───────────────┬──────────────┘
                                          │
                                          │ 1. Żądanie danych:
                                          │    - getRates()
                                          │    - getStocks()
                                          ▼
                    ┌────────────────────────────────────────────┐
                    │                 SERVICE                     │
                    │   rateService / stockService               │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 2. Sprawdzenie cache:
                                    │    - czy istnieje zapis?
                                    │    - czy nie wygasł?
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │                CACHE (in-memory)            │
                    │  - lastFetchTime                            │
                    │  - cachedData                               │
                    └───────────────┬────────────────────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     │ Cache HIT                   │ Cache MISS
                     │ (dane aktualne)             │ (dane nieaktualne)
                     ▼                             ▼
        ┌──────────────────────┐       ┌────────────────────────┐
        │ 3a. Zwróć dane z     │       │ 3b. Pobierz dane z API │
        │     pamięci          │       │     - NBP tabela C     │
        │                      │       │     - Alpha Vantage     │
        └───────────┬──────────┘       └──────────┬─────────────┘
                    │                               │
                    │                               │ 4. Zapisz:
                    │                               │    - cachedData
                    │                               │    - lastFetchTime
                    │                               ▼
                    │                 ┌──────────────────────────┐
                    │                 │      Aktualizacja cache   │
                    │                 └──────────────────────────┘
                    │
                    ▼
        ┌────────────────────────────────────────────────────────┐
        │ 5. Zwróć dane do marketController                      │
        └────────────────────────────────────────────────────────┘
```
### Diagram lifecycle requestu (Express + Middleware + Controller + DB)

```
                          ┌──────────────────────────────┐
                          │      UŻYTKOWNIK (Frontend)    │
                          └───────────────┬──────────────┘
                                          │
                                          │ 1. Request (HTTP)
                                          ▼
                    ┌────────────────────────────────────────────┐
                    │                 EXPRESS API                 │
                    │                (server.js)                  │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 2. Routing
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │                   ROUTES                    │
                    │   (marketRoutes, authRoutes, userRoutes)    │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 3. Middleware globalne
                                    │    - JSON parser
                                    │    - CORS
                                    │    - logger (opcjonalnie)
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │             protect middleware              │
                    │     (jeśli endpoint wymaga JWT)            │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 4. Weryfikacja tokena
                                    │    - jwt.verify
                                    │    - pobranie usera
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │               CONTROLLER                    │
                    │   (marketController, authController)        │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 5. Logika biznesowa:
                                    │    - pobranie kursów
                                    │    - obliczenia
                                    │    - aktualizacja portfolio
                                    │    - zapis transakcji
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │                 MODELS (Mongoose)           │
                    │   User, Transaction                         │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 6. Zapytania do MongoDB
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │                    MONGODB                  │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 7. Wynik wraca do kontrolera
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │               RESPONSE JSON                 │
                    │   - balance                                 │
                    │   - portfolio                               │
                    │   - transakcja                              │
                    └────────────────────────────────────────────┘
```
### Diagram obsługi błędów (Express error flow)

```
                          ┌──────────────────────────────┐
                          │      UŻYTKOWNIK (Frontend)    │
                          └───────────────┬──────────────┘
                                          │
                                          │ 1. Request
                                          ▼
                    ┌────────────────────────────────────────────┐
                    │                 ROUTES                      │
                    └───────────────┬────────────────────────────┘
                                    │
                                    │ 2. Wywołanie kontrolera
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │             asyncHandler()                  │
                    │   (łapie błędy z funkcji async)             │
                    └───────────────┬────────────────────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     │ 3a. Sukces                  │ 3b. Błąd
                     │     → next()                │     → next(error)
                     ▼                             ▼
        ┌──────────────────────┐       ┌────────────────────────┐
        │   RESPONSE JSON      │       │   ERROR MIDDLEWARE      │
        │   (status 200)       │       │   (ostatni w chainie)   │
        └───────────┬──────────┘       └──────────┬─────────────┘
                    │                               │
                    │                               │ 4. Formatowanie błędu:
                    │                               │    - status code
                    │                               │    - message
                    │                               │    - stack (dev only)
                    ▼                               ▼
        ┌────────────────────────────────────────────────────────┐
        │                 JSON ERROR RESPONSE                    │
        │   {                                                   │
        │     "message": "Za mało środków",                     │
        │     "status": 400                                     │
        │   }                                                   │
        └────────────────────────────────────────────────────────┘
```
