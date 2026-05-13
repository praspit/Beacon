import { useState } from 'react'
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react'
import CompanySearch from './components/CompanySearch'
import FinancialStatement from './components/FinancialStatement'

interface Company {
  ticker: string
  name: string
  cik: string
}

function App() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

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

          <CompanySearch onSelectCompany={setSelectedCompany} />

          {selectedCompany && (
            <FinancialStatement company={selectedCompany} />
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default App
