import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Input,
  HStack,
  Text,
  List,
  ListItem,
  InputGroup,
  useBreakpointValue,
  Spinner,
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
  const isMobile = useBreakpointValue({ base: true, md: false })

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
    <Box ref={wrapperRef} position="relative" maxW={isMobile ? "100%" : "600px"} mx="auto" w="100%" px={isMobile ? 4 : 0}>
      <InputGroup size="lg">
        <Input
          placeholder="Search by ticker or company name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          bg="#1e293b"
          border="1px solid #334155"
          borderRadius="8px"
          color="white"
          fontSize={isMobile ? "md" : "md"}
          px={isMobile ? 4 : 4}
          _placeholder={{ color: '#64748b' }}
          _hover={{ borderColor: '#475569' }}
          _focus={{ borderColor: '#3b82f6', boxShadow: '0 0 0 1px #3b82f6' }}
          onFocus={() => query.length >= 2 && results.length > 0 && setShowResults(true)}
        />
      </InputGroup>

      {loading && (
        <Box
          position="absolute"
          top="100%"
          mt={2}
          left={0}
          right={0}
          zIndex={10}
          bg="#1e293b"
          border="1px solid #334155"
          borderRadius="8px"
          p={4}
          textAlign="center"
        >
          <Spinner size="sm" color="#3b82f6" />
          <Text color="#64748b" fontSize="sm" mt={2}>Searching...</Text>
        </Box>
      )}

      {!loading && showResults && results.length > 0 && (
        <List
          position="absolute"
          top="100%"
          mt={2}
          left={0}
          right={0}
          zIndex={10}
          bg="#1e293b"
          border="1px solid #334155"
          borderRadius="8px"
          maxH="320px"
          overflowY="auto"
          boxShadow="0 10px 40px rgba(0,0,0,0.5)"
        >
          {results.map((company) => (
            <ListItem
              key={company.ticker}
              p={isMobile ? 3 : 4}
              cursor="pointer"
              borderBottom="1px solid #334155"
              _last={{ borderBottom: 'none' }}
              _hover={{ bg: '#334155' }}
              onClick={() => {
                onSelectCompany(company)
                setQuery('')
                setShowResults(false)
              }}
            >
              <HStack justify="space-between" flexWrap={isMobile ? "wrap" : "nowrap"} gap={2}>
                <Text
                  fontWeight="bold"
                  color="#3b82f6"
                  fontFamily="mono"
                  fontSize="sm"
                  minW="70px"
                >
                  {company.ticker}
                </Text>
                <Text
                  flex={1}
                  color="white"
                  ml={isMobile ? 0 : 4}
                  isTruncated
                  fontSize={isMobile ? "sm" : "md"}
                >
                  {company.name}
                </Text>
                {!isMobile && (
                  <Text fontSize="xs" color="#64748b" fontFamily="mono">
                    CIK: {company.cik}
                  </Text>
                )}
              </HStack>
            </ListItem>
          ))}
        </List>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <Box bg="#1e293b" p={4} mt={2} border="1px solid #334155" borderRadius="8px" textAlign="center">
          <Text color="#64748b">No companies found</Text>
        </Box>
      )}
    </Box>
  )
}
