import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Input,
  HStack,
  Text,
  Spinner,
  List,
  ListItem,
  useColorModeValue,
} from '@chakra-ui/react'

interface Company {
  ticker: string
  name: string
  cik: string
}

interface Props {
  onSelectCompany: (company: Company) => void
}

export default function CompanySearch({ onSelectCompany }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const bgColor = useColorModeValue('white', 'gray.700')
  const hoverBg = useColorModeValue('blue.50', 'gray.600')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
        setShowResults(true)
      } catch (err) {
        console.error('Search failed:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <Box ref={wrapperRef} position="relative" maxW="600px" mx="auto" w="100%">
      <Input
        placeholder="Search by company name or ticker (e.g., Apple, AAPL)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        size="lg"
        bg={bgColor}
      />

      {loading && (
        <HStack justify="center" py={2}>
          <Spinner size="sm" />
          <Text fontSize="sm">Searching...</Text>
        </HStack>
      )}

      {showResults && results.length > 0 && (
        <List
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={10}
          bg={bgColor}
          boxShadow="md"
          borderRadius="md"
          maxH="300px"
          overflowY="auto"
        >
          {results.map((company) => (
            <ListItem
              key={company.ticker}
              p={3}
              cursor="pointer"
              _hover={{ bg: hoverBg }}
              onClick={() => {
                onSelectCompany(company)
                setQuery('')
                setShowResults(false)
              }}
            >
              <HStack justify="space-between">
                <Text fontWeight="bold">{company.ticker}</Text>
                <Text flex={1} ml={2} isTruncated>
                  {company.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  CIK: {company.cik}
                </Text>
              </HStack>
            </ListItem>
          ))}
        </List>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <Box bg={bgColor} p={4} boxShadow="md" borderRadius="md" textAlign="center">
          <Text color="gray.500">No companies found</Text>
        </Box>
      )}
    </Box>
  )
}
