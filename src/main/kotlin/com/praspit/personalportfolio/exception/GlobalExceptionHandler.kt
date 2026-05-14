package com.praspit.personalportfolio.exception

import com.praspit.personalportfolio.dto.ApiErrorResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(EdgarException::class)
    fun handleEdgarException(ex: EdgarException): ResponseEntity<ApiErrorResponse> {
        val response = ApiErrorResponse(
            errorCode = ex.errorCode,
            message = ex.message ?: "Unknown error"
        )
        val status = when (ex) {
            is TickerNotFoundException -> HttpStatus.NOT_FOUND
            is SecRateLimitException -> HttpStatus.TOO_MANY_REQUESTS
            is SecServerException -> HttpStatus.BAD_GATEWAY
            is NetworkException -> HttpStatus.SERVICE_UNAVAILABLE
            is ProcessExecutionException -> HttpStatus.INTERNAL_SERVER_ERROR
        }
        return ResponseEntity.status(status).body(response)
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ApiErrorResponse> {
        val response = ApiErrorResponse(
            errorCode = "INTERNAL_ERROR",
            message = "An unexpected error occurred: ${ex.message}"
        )
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response)
    }
}
