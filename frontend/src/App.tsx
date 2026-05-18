import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react'
import { useSearchParams } from 'react-router-dom'
import CompanySearch from './components/CompanySearch'
import FinancialStatement from './components/FinancialStatement'

interface Company {
  ticker: string
  name: string
  cik: string
}

type TabType = 'income-statement' | 'balance-sheet' | 'cash-flow'

function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const ticker = searchParams.get('ticker')
  const tab = (searchParams.get('tab') as TabType) || 'income-statement'

  const companyFromUrl: Company | null = ticker
    ? { ticker: ticker.toUpperCase(), name: '', cik: '' }
    : null

  const handleSelectCompany = (company: Company) => {
    setSearchParams({ ticker: company.ticker, tab: 'income-statement' })
  }

  const handleTabChange = (newTab: TabType) => {
    if (ticker) {
      setSearchParams({ ticker, tab: newTab })
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" py={4}>
            <Heading size="xl" color="blue.600" mb={2}>
              Financial Data Platform
            </Heading>
            <Text color="gray.600">
              US Stock Financial Statements from SEC EDGAR
            </Text>
          </Box>

          <CompanySearch onSelectCompany={handleSelectCompany} />

          {companyFromUrl && (
            <FinancialStatement company={companyFromUrl} activeTab={tab} onTabChange={handleTabChange} />
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default App
