package com.praspit.personalportfolio.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
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

    fun searchCompanies(query: String): List<CompanySearchResult> {
        return try {
            val process = Runtime.getRuntime().exec(
                arrayOf(venvPython, "$basePath/edgar_wrapper.py", "search", query)
            )
            val result = String(process.inputStream.readBytes())
            val json: Map<String, Any> = objectMapper.readValue(result)
            @Suppress("UNCHECKED_CAST")
            val results = json["results"] as? List<Map<String, Any>> ?: emptyList()
            results.map {
                CompanySearchResult(
                    ticker = it["ticker"] as? String ?: "",
                    name = it["name"] as? String ?: "",
                    cik = it["cik"] as? String ?: ""
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    fun getFinancials(ticker: String): Map<String, Any> {
        val process = Runtime.getRuntime().exec(
            arrayOf(venvPython, "$basePath/edgar_wrapper.py", "financials", ticker.uppercase())
        )
        val result = String(process.inputStream.readBytes())
        return objectMapper.readValue(result)
    }
}

data class CompanySearchResult(
    val ticker: String,
    val name: String,
    val cik: String
)
