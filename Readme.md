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

---

### SK)
*   **Bezpieczeństwo haseł (Punkt 4 projektu)**:
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