#!/usr/bin/env python3
"""EdgarTools Python wrapper for financial data - using direct access instead of iteration."""

import sys
import json
import os
from pathlib import Path

os.environ['DEVELOPER'] = '1'
os.environ['EDGAR_NO_CACHE'] = '1'
os.environ['PYTHONDONTWRITEBYTECODE'] = '1'
os.environ['PYTHONUNBUFFERED'] = '1'

_venv_site = str(Path(__file__).parent / ".venv/lib/python3.12/site-packages")
sys.path.insert(0, _venv_site)

import edgar
edgar.set_identity(os.environ.get('EDGAR_IDENTITY', 'your.email@example.com'))

from edgar import Company

def search_companies(query):
    """Search for companies by name or ticker - using direct access."""
    try:
        results_raw = edgar.find_company(query)
        if results_raw:
            c = results_raw[0]
            if c:
                return {"results": [{"ticker": c.tickers[0] if c.tickers else "", "name": c.name, "cik": str(c.cik)}]}
        return {"results": []}
    except Exception as e:
        return {"error": str(e), "results": []}

def get_financials(ticker, periods=10):
    """Get all financial statements for a company."""
    try:
        company = Company(ticker)
        income = company.income_statement(periods=periods)
        balance = company.balance_sheet(periods=periods)
        cash = company.cash_flow_statement(periods=periods)
        
        def to_list(stmt):
            items = []
            for item in stmt:
                row = {"label": item.label}
                if hasattr(item, 'values') and item.values:
                    for period, value in item.values.items():
                        if value is not None:
                            row[period] = value
                items.append(row)
            return items
        
        return {
            "incomeStatement": to_list(income),
            "balanceSheet": to_list(balance),
            "cashFlow": to_list(cash)
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python edgar_wrapper.py <command> <args> [periods]")
    else:
        command = sys.argv[1]
        arg = sys.argv[2]
        periods = int(sys.argv[3]) if len(sys.argv) > 3 else 10
        
        if command == "search":
            result = search_companies(arg)
        elif command == "financials":
            result = get_financials(arg, periods)
        else:
            result = {"error": f"Unknown command: {command}"}
        
        print(json.dumps(result))
