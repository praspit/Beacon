# Tasks - Beacon

A financial data platform for viewing US stock financial statements from SEC EDGAR.

---

## Priority Overview

| Priority | Count | Description |
|----------|-------|-------------|
| P0-Critical | 4 | Security, reliability, or data integrity issues |
| P1-High | 6 | Significant functionality or performance problems |
| P2-Medium | 5 | Technical debt or suboptimal patterns |
| P3-Low | 3 | Nice-to-have improvements |

---

## P0 - Critical Issues

### 1. EdgarService blocks Spring thread pool
**Location:** `src/main/kotlin/.../EdgarService.kt`

**Problem:** Uses `Runtime.exec()` synchronously. Each API call blocks a Spring thread for the duration of the Python process. Under load, this exhausts the thread pool and freezes the application.

**Fix:** Use `kotlinx.coroutines` with `Dispatchers.IO`, or spawn Python processes asynchronously.

**Status:** ✅ Fixed (2025-05-14) - All service methods now use `suspend` with `withContext(Dispatchers.IO)`; controller methods updated to `suspend` as well.

### 2. Silent error handling hides failures
**Location:** `src/main/kotlin/.../EdgarService.kt`

**Problem:** All exceptions are caught and logged via `e.printStackTrace()` but return empty results. API consumers have no way to know if failure was a network issue, bad ticker, or SEC rate limit.

**Fix:** Return a structured error response or throw domain-specific exceptions.

**Status:** ✅ Fixed (2025-05-14) - EdgarService now throws domain-specific exceptions; @RestControllerAdvice provides consistent JSON error responses with errorCode, message, timestamp.

### 3. Hardcoded SEC identity
**Location:** `edgar_wrapper.py`, `EdgarService.kt`

**Problem:** Uses placeholder email `your.email@example.com` in two places. SEC requires legitimate identification for API access.

**Fix:** Extract to `application.yml` under `edgar.identity`, use real email.

**Status:** ✅ Fixed (2025-05-14) - `application.yml` created with `edgar.identity` config; `EdgarService.kt` uses `@Value` injection; `edgar_wrapper.py` reads from `EDGAR_IDENTITY` env var.

### 4. CORS excludes production
**Location:** `src/main/kotlin/.../config/WebConfig.kt`

**Problem:** Only `localhost:5173` and `localhost:5174` are allowed. Once deployed, no browser can access the API.

**Fix:** Use environment variables for allowed origins, add production domain.

---

## P1 - High Priority

### 5. No input validation on API endpoints
**Location:** `src/main/kotlin/.../controller/FinancialDataController.kt`

**Problem:** Accepts any query string without sanitization. Special characters or very long strings could cause issues downstream.

**Fix:** Add `@Valid` annotations or manual validation for length, character allowed.

### 6. FinancialStatement frontend shows only one period
**Location:** `frontend/src/components/FinancialStatement.tsx`

**Problem:** `renderTable()` renders only `valueKeys[0]` (first period). SEC returns multi-year data but user only sees one column.

**Fix:** Dynamically render all available periods as columns, or add period selector.

### 7. No centralized error handling
**Location:** `src/main/kotlin/.../controller/` (all controllers)

**Problem:** Each endpoint handles errors differently (or not at all). No consistent error response format.

**Fix:** Add `@RestControllerAdvice` with `@ExceptionHandler` for uniform error responses.

### 8. Python process failures not detected
**Location:** `src/main/kotlin/.../EdgarService.kt`

**Problem:** `process.waitFor()` is called but exit code is never checked. Failed Python scripts return empty data silently.

**Fix:** Check `process.exitValue()` and return error response on non-zero exit.

### 9. No retry logic on frontend API calls
**Location:** `frontend/src/components/FinancialStatement.tsx`, `CompanySearch.tsx`

**Problem:** Network hiccups show permanent error. User must manually refresh.

**Fix:** Implement retry with exponential backoff (e.g., 3 attempts).

### 10. Type safety issues in frontend
**Location:** `frontend/src/components/FinancialStatement.tsx`

**Problem:** Uses `any` for financial data. Easy to introduce runtime errors.

**Fix:** Define TypeScript interfaces for `IncomeStatement`, `BalanceSheet`, `CashFlow` data structures.

---

## P2 - Medium Priority

### 11. Unused PortfolioController
**Location:** `src/main/kotlin/.../controller/PortfolioController.kt`

**Problem:** Just returns "Hello world!" - no useful functionality.

**Fix:** Remove or replace with actual portfolio tracking endpoints.

### 12. No caching for SEC data
**Location:** `EdgarService.kt`, API endpoints

**Problem:** SEC EDGAR data is updated quarterly. Every request refetches from SEC, hitting rate limits and adding latency.

**Fix:** Add Redis or in-memory cache with 24h TTL for company lookups and financials.

### 13. Architecture: Python/JVM boundary is inefficient
**Location:** `EdgarService.kt`, `edgar_wrapper.py`

**Problem:** Spawning Python from JVM adds ~200ms latency per call, complicates deployment, and adds failure modes.

**Fix:** Either (a) use edgar Kotlin port, (b) expose Python as HTTP service, or (c) embed Python via GraalVM.

### 14. No application.yml configuration
**Location:** (nonexistent - hardcoded in code)

**Problem:** All config (port, CORS, edgar identity) is in code. No environment-specific overrides.

**Fix:** Create `src/main/resources/application.yml` with externalized config.

### 15. No rate limiting awareness
**Location:** `EdgarService.kt`, `edgar_wrapper.py`

**Problem:** SEC caps requests; no throttling or queueing. Burst traffic could hit 429s.

**Fix:** Add request throttling, possibly a queue for SEC API calls.

---

## P3 - Low Priority

### 16. No unit tests
**Location:** `src/test/kotlin/.../PersonalportfolioApplicationTests.kt`

**Problem:** Test file exists but has no real test coverage.

**Fix:** Add tests for EdgarService, FinancialDataController.

### 17. No Dockerfile or docker-compose
**Location:** (nonexistent)

**Problem:** Local development and deployment require manual setup of Java 17, Gradle, Python, etc.

**Fix:** Add containerization for reproducible builds.

### 18. No cache-busting headers
**Location:** All API endpoints

**Problem:** Responses don't include ETag or Last-Modified; clients can't conditionally fetch.

**Fix:** Add caching headers, support conditional GET.

---

## Completed
- [x] Initialize git repository (2025-05-14)
- [x] Set up SSH remote for GitHub (2025-05-14)
- [x] Rename repo to Beacon (2025-05-14)
- [x] Add Edgar SEC data fetching service (2025-05-13)
- [x] Create frontend with Vite and React (2025-05-13)
- [x] Add CompanySearch component (2025-05-13)
- [x] Add FinancialStatement component (2025-05-13)

## Backlog
- [ ] Add authentication
- [ ] Add user portfolio tracking
- [ ] Deploy frontend
- [ ] Add caching for SEC API responses
- [ ] Add input validation for company search
