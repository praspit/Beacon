import { useState, useEffect } from 'react'
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  Badge,
  useBreakpointValue,
  Skeleton,
  SkeletonText,
  VStack,
} from '@chakra-ui/react'

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
  const isMobile = useBreakpointValue({ base: true, md: false })

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
      <Box mt={6}>
        {/* Company Header Skeleton */}
        <HStack justify="space-between" align="center" mb={6}>
          <VStack align="start" gap={2}>
            <Skeleton height="32px" width="100px" startColor="#1e293b" endColor="#334155" />
            <Skeleton height="16px" width="150px" startColor="#1e293b" endColor="#334155" />
          </VStack>
          <Skeleton height="24px" width="80px" borderRadius="6px" startColor="#1e293b" endColor="#334155" />
        </HStack>

        {/* Tabs Skeleton */}
        <HStack gap={0} borderBottom="1px solid #334155" mb={4}>
          <Skeleton height="40px" width="120px" startColor="#1e293b" endColor="#334155" />
          <Skeleton height="40px" width="100px" startColor="#1e293b" endColor="#334155" ml={4} />
          <Skeleton height="40px" width="80px" startColor="#1e293b" endColor="#334155" ml={4} />
        </HStack>

        {/* Table Skeleton */}
        <Box overflowX="auto" borderRadius="8px" border="1px solid #334155" p={4}>
          <VStack align="stretch" gap={3}>
            {[...Array(8)].map((_, i) => (
              <HStack key={i} justify="space-between">
                <Skeleton height="20px" width="180px" startColor="#1e293b" endColor="#334155" />
                <Skeleton height="20px" width="80px" startColor="#1e293b" endColor="#334155" />
                <Skeleton height="20px" width="80px" startColor="#1e293b" endColor="#334155" display={isMobile ? 'none' : 'block'} />
                <Skeleton height="20px" width="80px" startColor="#1e293b" endColor="#334155" display={isMobile ? 'none' : 'block'} />
              </HStack>
            ))}
          </VStack>
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        bg="#1e293b"
        borderRadius="12px"
        p={6}
        border="1px solid #dc2626"
      >
        <Text color="#f87171">{error}</Text>
      </Box>
    )
  }

  if (!data) return null

  function renderTable(rows: any[] | undefined, maxRows: number = 15) {
    if (!rows || rows.length === 0) {
      return <Text color="#64748b">No data available</Text>
    }

    // Find a row that has actual data
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
      <Box overflowX="auto" borderRadius="8px" border="1px solid #334155">
        <Table variant="simple" size="sm">
          <Thead bg="#0f172a">
            <Tr>
              <Th
                color="#94a3b8"
                borderBottom="1px solid #334155"
                position="sticky"
                left={0}
                bg="#0f172a"
                zIndex={2}
                minW="200px"
              >
                Item
              </Th>
              {yearColumns.map(year => (
                <Th
                  key={year}
                  color="#94a3b8"
                  isNumeric
                  borderBottom="1px solid #334155"
                  fontWeight="600"
                  fontSize="xs"
                  minW="100px"
                >
                  {year}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {rows.slice(0, maxRows).map((row: any, idx: number) => {
              const label = row.label || 'N/A'
              return (
                <Tr
                  key={idx}
                  _odd={{ bg: '#1e293b' }}
                  _even={{ bg: '#162030' }}
                  _hover={{ bg: '#334155' }}
                  transition="background 0.15s"
                >
                  <Td
                    color="#e2e8f0"
                    borderBottom="1px solid #1e293b"
                    position="sticky"
                    left={0}
                    bg={idx % 2 === 0 ? '#1e293b' : '#162030'}
                    fontWeight="500"
                    fontSize="sm"
                  >
                    {label}
                  </Td>
                  {yearColumns.map(year => {
                    const value = row[year]
                    return (
                      <Td
                        key={year}
                        isNumeric
                        color="#e2e8f0"
                        borderBottom="1px solid #1e293b"
                        fontSize="sm"
                        fontFamily="mono"
                      >
                        {typeof value === 'number'
                          ? value.toLocaleString('en-US', { maximumFractionDigits: 0 })
                          : value
                          ? String(value)
                          : '-'}
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
    <Box mt={6}>
      {/* Company Header */}
      <HStack justify="space-between" align="center" mb={6}>
        <Box>
          <HStack gap={3}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="white"
            >
              {company.ticker}
            </Text>
            <Badge
              bg="#334155"
              color="#94a3b8"
              px={3}
              py={1}
              borderRadius="6px"
              fontSize="xs"
              fontWeight="500"
            >
              {company.name || company.ticker}
            </Badge>
          </HStack>
          {company.cik && (
            <Text color="#64748b" fontSize="xs" mt={1}>
              CIK: {company.cik}
            </Text>
          )}
        </Box>
        <Badge
          bg="#1e293b"
          color="#3b82f6"
          px={3}
          py={1}
          borderRadius="6px"
          fontSize="xs"
          border="1px solid #334155"
        >
          SEC EDGAR
        </Badge>
      </HStack>

      {/* Tabs - horizontal scroll on mobile */}
      <Box overflowX="auto" mx={-4} px={4}>
        <Tabs
          index={TAB_INDEX_MAP[activeTab]}
          onChange={handleTabChange}
          variant="unstyled"
        >
          <TabList gap={0} borderBottom="1px solid #334155" mb={4} minW="fit-content">
            <Tab
              color="#64748b"
              fontSize={isMobile ? "xs" : "sm"}
              fontWeight="500"
              px={isMobile ? 3 : 4}
              py={3}
              _selected={{ color: '#3b82f6', borderBottom: '2px solid #3b82f6' }}
              _hover={{ color: '#94a3b8' }}
              whiteSpace="nowrap"
            >
              Income Statement
            </Tab>
            <Tab
              color="#64748b"
              fontSize={isMobile ? "xs" : "sm"}
              fontWeight="500"
              px={isMobile ? 3 : 4}
              py={3}
              _selected={{ color: '#3b82f6', borderBottom: '2px solid #3b82f6' }}
              _hover={{ color: '#94a3b8' }}
              whiteSpace="nowrap"
            >
              Balance Sheet
            </Tab>
            <Tab
              color="#64748b"
              fontSize={isMobile ? "xs" : "sm"}
              fontWeight="500"
              px={isMobile ? 3 : 4}
              py={3}
              _selected={{ color: '#3b82f6', borderBottom: '2px solid #3b82f6' }}
              _hover={{ color: '#94a3b8' }}
              whiteSpace="nowrap"
            >
              Cash Flow
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              {renderTable(data.incomeStatement)}
            </TabPanel>
            <TabPanel p={0}>
              {renderTable(data.balanceSheet)}
            </TabPanel>
            <TabPanel p={0}>
              {renderTable(data.cashFlow)}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}
