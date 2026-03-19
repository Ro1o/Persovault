import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { getFeatureImportance } from "../../services/aiService"

export default function FeatureImportanceChart() {

  const [data, setData] = useState([])

  useEffect(() => {

    const loadData = async () => {
      const result = await getFeatureImportance()
      setData(result)
    }

    loadData()

  }, [])

  return (

    <div className="bg-white p-4 rounded-xl shadow">

      <h2 className="text-lg font-semibold mb-4">
        AI Risk Factors
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>

          <XAxis dataKey="feature" />
          <YAxis />
          <Tooltip />

          <Bar dataKey="importance" />

        </BarChart>
      </ResponsiveContainer>

    </div>

  )
}