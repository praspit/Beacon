import { useState, useEffect } from 'react'
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Heading, Text, Spinner, Alert, AlertIcon, Badge, HStack } from '@chakra-ui/react'

interface Company {
  ticker: string
  name: string
  cik: string
}

type TabType = 'income-statement' | 'balance-sheet' | 'cash-flow'

interface Props {
  company: Company
  activeTab?: TabType
  onTabChange?: (tab: TabType) => void
}

const TAB_INDEX_MAP: Record<TabType, number> = {
  'income-statement': 0,
  'balance-sheet': 1,
  'cash-flow': 2
}

const TAB_NAME_MAP: Record<number, TabType> = {
  0: 'income-statement',
  1: 'balance-sheet',
  2: 'cash-flow'
}

export default function FinancialStatement({ company, activeTab = 'income-statement', onTabChange }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleTabChange = (index: number) => {
    if (onTabChange) {
      onTabChange(TAB_NAME_MAP[index])
    }
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/financials/${company.ticker}`)
        if (!res.ok) throw new Error('Failed to fetch financial data')
        const result = await res.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [company.ticker])

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4} color="gray.500">Loading financial statements...</Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  if (!data) return null

  function renderTable(rows: any[] | undefined, maxRows: number = 10) {
    if (!rows || rows.length === 0) {
      return <Text>No data available</Text>
    }

    // Find a row that has actual data (has year columns with values)
    let sampleRow = rows.find((row: any) => {
      const keys = Object.keys(row).filter(k => k !== 'label')
      return keys.some(k => row[k] !== null && row[k] !== undefined && row[k] !== '')
    })
    if (!sampleRow) sampleRow = rows[1] || rows[0]

    const yearColumns = Object.keys(sampleRow)
      .filter(k => k !== 'label')
      .sort()
      .reverse()

    return (
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Item</Th>
              {yearColumns.map(year => (
                <Th key={year} isNumeric>{year}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {rows.slice(0, maxRows).map((row: any, idx: number) => {
              const label = row.label || 'N/A'
              return (
                <Tr key={idx}>
                  <Td fontWeight="medium">{label}</Td>
                  {yearColumns.map(year => {
                    const value = row[year]
                    return (
                      <Td key={year} isNumeric>
                        {typeof value === 'number' ? value.toLocaleString() : value ? String(value) : '-'}
                      </Td>
                    )
                  })}
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>
    )
  }

  return (
    <Box>
      <HStack mb={4} justify="space-between" align="center">
        <Box>
          <Heading size="md">{company.name}</Heading>
          <Text color="gray.500">Ticker: {company.ticker} | CIK: {company.cik}</Text>
        </Box>
        <Badge colorScheme="blue" fontSize="sm" p={2}>
          SEC EDGAR Data
        </Badge>
      </HStack>

      <Tabs index={TAB_INDEX_MAP[activeTab]} onChange={handleTabChange} variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Income Statement</Tab>
          <Tab>Balance Sheet</Tab>
          <Tab>Cash Flow</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0} pt={4}>
            <Box overflowX="auto">
              {renderTable(data.incomeStatement)}
            </Box>
          </TabPanel>
          <TabPanel p={0} pt={4}>
            <Box overflowX="auto">
              {renderTable(data.balanceSheet)}
            </Box>
          </TabPanel>
          <TabPanel p={0} pt={4}>
            <Box overflowX="auto">
              {renderTable(data.cashFlow)}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
