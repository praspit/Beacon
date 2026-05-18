package com.praspit.personalportfolio.controller

import com.praspit.personalportfolio.service.CompanySearchResult
import com.praspit.personalportfolio.service.EdgarService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class FinancialDataController(
    private val edgarService: EdgarService
) {

    @GetMapping("/search")
    suspend fun searchCompanies(@RequestParam q: String): Map<String, List<CompanySearchResult>> {
        val results = edgarService.searchCompanies(q)
        return mapOf("results" to results)
    }

    @GetMapping("/financials/{ticker}")
    suspend fun getFinancials(
        @PathVariable ticker: String,
        @RequestParam(defaultValue = "10") periods: Int,
        @RequestParam(defaultValue = "annual") periodType: String
    ): Map<String, Any> {
        return edgarService.getFinancials(ticker.uppercase(), periods, periodType)
    }

    @GetMapping("/financials/{ticker}/income-statement")
    suspend fun getIncomeStatement(
        @PathVariable ticker: String,
        @RequestParam(defaultValue = "10") periods: Int,
        @RequestParam(defaultValue = "annual") periodType: String
    ): Map<String, Any> {
        val financials = edgarService.getFinancials(ticker.uppercase(), periods, periodType)
        @Suppress("UNCHECKED_CAST")
        return mapOf("data" to (financials["incomeStatement"] ?: emptyList<Any>()))
    }

    @GetMapping("/financials/{ticker}/balance-sheet")
    suspend fun getBalanceSheet(
        @PathVariable ticker: String,
        @RequestParam(defaultValue = "10") periods: Int,
        @RequestParam(defaultValue = "annual") periodType: String
    ): Map<String, Any> {
        val financials = edgarService.getFinancials(ticker.uppercase(), periods, periodType)
        @Suppress("UNCHECKED_CAST")
        return mapOf("data" to (financials["balanceSheet"] ?: emptyList<Any>()))
    }

    @GetMapping("/financials/{ticker}/cash-flow")
    suspend fun getCashFlowStatement(
        @PathVariable ticker: String,
        @RequestParam(defaultValue = "10") periods: Int,
        @RequestParam(defaultValue = "annual") periodType: String
    ): Map<String, Any> {
        val financials = edgarService.getFinancials(ticker.uppercase(), periods, periodType)
        @Suppress("UNCHECKED_CAST")
        return mapOf("data" to (financials["cashFlow"] ?: emptyList<Any>()))
    }
}
