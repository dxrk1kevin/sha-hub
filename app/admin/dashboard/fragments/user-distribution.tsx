import { BarChart, Bar, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const distributionData = [
  { role: "Students", count: 145 },
  { role: "Teachers", count: 28 },
  { role: "Admin", count: 5 },
  { role: "Moderators", count: 8 },
]

function UserDistribution() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">Active users by role</p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Users",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default UserDistribution
