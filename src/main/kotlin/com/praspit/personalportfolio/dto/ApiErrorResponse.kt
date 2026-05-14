package com.praspit.personalportfolio.dto

import java.time.Instant

data class ApiErrorResponse(
    val errorCode: String,
    val message: String,
    val timestamp: String = Instant.now().toString()
)
