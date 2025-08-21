import { useQuery } from '@tanstack/react-query'
import API from '../api/axios'

const fetchDetails = async (id) => {
  // 🔥 सही endpoint backend urls.py के हिसाब से
  const { data } = await API.get(`/crm/verified/${id}/compare/`)
  return data
}

export function useVerifiedOrderDetails(id) {
  return useQuery({
    queryKey: ['crm-verified-detail', id],
    queryFn: () => fetchDetails(id),
    enabled: !!id, // id होने पर ही call करे
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
  })
}
