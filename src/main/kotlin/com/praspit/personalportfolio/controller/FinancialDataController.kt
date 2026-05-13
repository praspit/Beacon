package com.praspit.personalportfolio.controller

import com.praspit.personalportfolio.service.CompanySearchResult
import com.praspit.personalportfolio.service.EdgarService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:5174"])
class FinancialDataController(
    private val edgarService: EdgarService
) {

    @GetMapping("/search")
    fun searchCompanies(@RequestParam q: String): Map<String, List<CompanySearchResult>> {
        val results = edgarService.searchCompanies(q)
        return mapOf("results" to results)
    }

    @GetMapping("/financials/{ticker}")
    fun getFinancials(@PathVariable ticker: String): Map<String, Any> {
        return edgarService.getFinancials(ticker.uppercase())
    }

    @GetMapping("/financials/{ticker}/income-statement")
    fun getIncomeStatement(@PathVariable ticker: String): Map<String, Any> {
        val financials = edgarService.getFinancials(ticker.uppercase())
        @Suppress("UNCHECKED_CAST")
        return mapOf("data" to (financials["incomeStatement"] ?: emptyList<Any>()))
    }

    @GetMapping("/financials/{ticker}/balance-sheet")
    fun getBalanceSheet(@PathVariable ticker: String): Map<String, Any> {
        val financials = edgarService.getFinancials(ticker.uppercase())
        @Suppress("UNCHECKED_CAST")
        return mapOf("data" to (financials["balanceSheet"] ?: emptyList<Any>()))
    }

    @GetMapping("/financials/{ticker}/cash-flow")
    fun getCashFlowStatement(@PathVariable ticker: String): Map<String, Any> {
        val financials = edgarService.getFinancials(ticker.uppercase())
        @Suppress("UNCHECKED_CAST")
        return mapOf("data" to (financials["cashFlow"] ?: emptyList<Any>()))
    }
}
