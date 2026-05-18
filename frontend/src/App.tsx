import { Box, Container, Heading, Text, VStack, Divider, useBreakpointValue, Link } from '@chakra-ui/react'
import { useSearchParams } from 'react-router-dom'
import CompanySearch from './components/CompanySearch'
import FinancialStatement from './components/FinancialStatement'

interface Company {
  ticker: string
  name: string
  cik: string
}

type TabType = 'income-statement' | 'balance-sheet' | 'cash-flow'
type PeriodType = 'annual' | 'quarterly' | 'ttm'

function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const ticker = searchParams.get('ticker')
  const tab = (searchParams.get('tab') as TabType) || 'income-statement'
  const periodType = (searchParams.get('period') as PeriodType) || 'annual'
  const isMobile = useBreakpointValue({ base: true, md: false })

  const companyFromUrl: Company | null = ticker
    ? { ticker: ticker.toUpperCase(), name: '', cik: '' }
    : null

  const handleSelectCompany = (company: Company) => {
    setSearchParams({ ticker: company.ticker, tab: 'income-statement', period: 'annual' })
  }

  const handleTabChange = (newTab: TabType) => {
    if (ticker) {
      setSearchParams({ ticker, tab: newTab, period: periodType })
    }
  }

  const handlePeriodChange = (newPeriod: PeriodType) => {
    if (ticker) {
      setSearchParams({ ticker, tab, period: newPeriod })
    }
  }

  return (
    <Box minH="100vh" bg="#0f172a" color="white" display="flex" flexDirection="column" py={isMobile ? 4 : 10}>
      <Container maxW="1400px" px={isMobile ? 2 : 6} flex="1">
        {/* Header */}
        <VStack spacing={isMobile ? 4 : 6} align="stretch">
          <Box pb={isMobile ? 2 : 4}>
            <Box>
              <Heading size={isMobile ? "lg" : "xl"} color="white" fontWeight="bold" mb={1}>
                Beacon
              </Heading>
              <Text color="#94a3b8" fontSize={isMobile ? "xs" : "sm"}>
                Real-time SEC EDGAR financial data
              </Text>
            </Box>
          </Box>

          <Divider borderColor="#1e293b" />

          {/* Search */}
          <CompanySearch onSelectCompany={handleSelectCompany} />

          {/* Financial Statement */}
          {companyFromUrl && (
            <Box px={isMobile ? 0 : 0}>
              <FinancialStatement
                company={companyFromUrl}
                activeTab={tab}
                onTabChange={handleTabChange}
                periodType={periodType}
                onPeriodChange={handlePeriodChange}
              />
            </Box>
          )}
        </VStack>
      </Container>

      {/* Footer */}
      <Box py={6} textAlign="center" borderTop="1px solid #1e293b" mt={8}>
        <Text color="#64748b" fontSize="xs">
          Data sourced from{' '}
          <Link href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany" target="_blank" rel="noopener" color="#3b82f6" _hover={{ textDecoration: 'underline' }}>
            SEC EDGAR
          </Link>
          {' '}- US Securities and Exchange Commission
        </Text>
      </Box>
    </Box>
  )
}

export default App
