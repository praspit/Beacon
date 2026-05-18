package com.praspit.personalportfolio.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.praspit.personalportfolio.exception.EdgarException
import com.praspit.personalportfolio.exception.NetworkException
import com.praspit.personalportfolio.exception.ProcessExecutionException
import com.praspit.personalportfolio.exception.SecRateLimitException
import com.praspit.personalportfolio.exception.SecServerException
import com.praspit.personalportfolio.exception.TickerNotFoundException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.io.File

@Service
class EdgarService(
    @Value("\${edgar.identity:your.email@example.com}") private val identity: String
) {
    private val objectMapper = ObjectMapper()
    private val basePath = File(".").canonicalPath
    private val venvPython = "$basePath/.venv/bin/python"

    init {
        setIdentity(identity)
    }

    private fun setIdentity(identity: String) {
        val code = "import edgar; edgar.set_identity('$identity')"
        val process = Runtime.getRuntime().exec(arrayOf("python3", "-c", code))
        process.waitFor()
    }

    private fun parseProcessError(errorOutput: String): EdgarException {
        return when {
            errorOutput.contains("429") || errorOutput.contains("rate limit") ->
                SecRateLimitException()
            errorOutput.contains("ticker") && (errorOutput.contains("not found") || errorOutput.contains("No such file")) ->
                TickerNotFoundException("Ticker not found: $errorOutput")
            errorOutput.contains("500") || errorOutput.contains("502") || errorOutput.contains("503") ->
                SecServerException()
            else -> NetworkException("SEC EDGAR request failed: $errorOutput")
        }
    }

    suspend fun searchCompanies(query: String): List<CompanySearchResult> {
        return withContext(Dispatchers.IO) {
            try {
                val process = Runtime.getRuntime().exec(
                    arrayOf(venvPython, "$basePath/edgar_wrapper.py", "search", query)
                )
                val exitCode = process.waitFor()
                val result = String(process.inputStream.readBytes())
                val errorOutput = String(process.errorStream.readBytes())

                val json: Map<String, Any> = objectMapper.readValue(result)

                // Python returns {"error": ...} on exceptions even with exit code 0
                if (json.containsKey("error")) {
                    throw parseProcessError(json["error"].toString())
                }

                if (exitCode != 0) {
                    throw parseProcessError(errorOutput.ifEmpty { result })
                }

                @Suppress("UNCHECKED_CAST")
                val results = json["results"] as? List<Map<String, Any>> ?: emptyList()
                results.map {
                    CompanySearchResult(
                        ticker = it["ticker"] as? String ?: "",
                        name = it["name"] as? String ?: "",
                        cik = it["cik"] as? String ?: ""
                    )
                }
            } catch (e: EdgarException) {
                throw e
            } catch (e: Exception) {
                throw NetworkException("Failed to search companies: ${e.message}")
            }
        }
    }

    suspend fun getFinancials(ticker: String): Map<String, Any> {
        return withContext(Dispatchers.IO) {
            try {
                val process = Runtime.getRuntime().exec(
                    arrayOf(venvPython, "$basePath/edgar_wrapper.py", "financials", ticker.uppercase())
                )
                val exitCode = process.waitFor()
                val result = String(process.inputStream.readBytes())
                val errorOutput = String(process.errorStream.readBytes())

                val json: Map<String, Any> = objectMapper.readValue(result)

                // Python returns {"error": ...} on exceptions even with exit code 0
                if (json.containsKey("error")) {
                    throw parseProcessError(json["error"].toString())
                }

                if (exitCode != 0) {
                    throw parseProcessError(errorOutput.ifEmpty { result })
                }

                @Suppress("UNCHECKED_CAST")
                json
            } catch (e: EdgarException) {
                throw e
            } catch (e: Exception) {
                throw ProcessExecutionException("Failed to get financials: ${e.message}")
            }
        }
    }
}

data class CompanySearchResult(
    val ticker: String,
    val name: String,
    val cik: String
)
