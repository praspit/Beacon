package com.praspit.personalportfolio.exception

sealed class EdgarException(
    message: String,
    val errorCode: String
) : RuntimeException(message)

class NetworkException(
    message: String = "Network error occurred while connecting to SEC EDGAR"
) : EdgarException(message, "NETWORK_ERROR")

class TickerNotFoundException(
    message: String = "Ticker not found in SEC EDGAR database"
) : EdgarException(message, "TICKER_NOT_FOUND")

class SecRateLimitException(
    message: String = "SEC EDGAR rate limit exceeded (HTTP 429)"
) : EdgarException(message, "RATE_LIMIT_EXCEEDED")

class SecServerException(
    message: String = "SEC EDGAR server error (HTTP 5xx)"
) : EdgarException(message, "SEC_SERVER_ERROR")

class ProcessExecutionException(
    message: String = "Python process execution failed"
) : EdgarException(message, "PROCESS_ERROR")
