import { useEffect, useState } from 'react'
import { supabase } from "@/lib/supabase"
import { useOrganization } from "@/contexts/OrganizationContext"

type AccountReceivable = {
  id: string
  description: string
  status: string | null
  due_date: string | null
}

export default function AccountsReceivable() {
  const [data, setData] = useState<AccountReceivable[]>([])
  const [loading, setLoading] = useState(true)
  const { activeOrganization } = useOrganization()

  useEffect(() => {
    async function fetchData() {
      if (!activeOrganization) {
        setData([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('organization_id', activeOrganization.id)

      if (!error && data) {
        setData(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [activeOrganization])

  if (loading) {
    return <p>Carregando...</p>
  }

  return (
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">Descrição</th>
          <th className="p-2">Status</th>
          <th className="p-2">Vencimento</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item: AccountReceivable) => (
          <tr key={item.id} className="border-t">
            <td className="p-2">{item.description}</td>
            <td className="p-2">{item.status}</td>
            <td className="p-2">{item.due_date ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
