import { IconDownload, IconShare, IconUpload } from '@tabler/icons-react'
import { useState } from 'react'
import { useFamilyPlanner } from '@/context/FamilyPlannerContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SettingsView() {
  const { state, updateGlobalSettings, importData, exportData } =
    useFamilyPlanner()
  const [yearLimit, setYearLimit] = useState(state.globalSettings.yearLimit)

  const handleYearLimitChange = (value: number) => {
    setYearLimit(value)
    updateGlobalSettings({ yearLimit: value })
  }

  const handleExportCSV = () => {
    const csvRows = ['Member,Entry Date,Departure Date,Notes']

    state.trips.forEach((trip) => {
      const member = state.members.find((m) => m.id === trip.memberId)
      if (member) {
        csvRows.push(
          `${member.name},${trip.entryDate},${trip.departureDate},"${trip.notes || ''}"`,
        )
      }
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `family-visits-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const rows = text.split('\n').slice(1) // Skip header

      rows.forEach((row) => {
        const [memberName] = row
          .split(',')
          .map((s) => s.trim().replace(/"/g, ''))

        const member = state.members.find((m) => m.name === memberName)
        if (!member && memberName) {
          // CSV import for trips requires members to exist first
          // This is a placeholder for future implementation
        }
      })
      alert(
        'CSV import is currently limited. Please use JSON import for full data.',
      )
    }
    reader.readAsText(file)
  }

  const handleExportJSON = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `family-planner-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        importData(data)
        alert('Data imported successfully!')
      } catch (error) {
        alert('Error importing data. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleShareURL = () => {
    const data = exportData()
    const encoded = btoa(JSON.stringify(data))
    const url = `${window.location.origin}?data=${encoded}`

    navigator.clipboard.writeText(url).then(() => {
      alert('Shareable link copied to clipboard!')
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure global application settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="yearLimit">Maximum Days Per Year</Label>
            <Input
              id="yearLimit"
              type="number"
              value={yearLimit}
              onChange={(e) => handleYearLimitChange(Number(e.target.value))}
              min={1}
              max={365}
            />
            <p className="text-sm text-muted-foreground">
              Members staying more than this will be flagged as over limit
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Import, export, and share your planning data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Export Data</h3>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleExportJSON}
                  variant="outline"
                  className="w-full"
                >
                  <IconDownload className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="w-full"
                >
                  <IconDownload className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button
                  onClick={handleShareURL}
                  variant="outline"
                  className="w-full"
                >
                  <IconShare className="h-4 w-4 mr-2" />
                  Copy Shareable Link
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Import Data</h3>
              <div className="flex flex-col gap-2">
                <Label htmlFor="import-json" className="cursor-pointer">
                  <div className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md hover:bg-accent">
                    <IconUpload className="h-4 w-4 mr-2" />
                    Import JSON File
                  </div>
                  <Input
                    id="import-json"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportJSON}
                  />
                </Label>

                <Label htmlFor="import-csv" className="cursor-pointer">
                  <div className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md hover:bg-accent">
                    <IconUpload className="h-4 w-4 mr-2" />
                    Import CSV File
                  </div>
                  <Input
                    id="import-csv"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleImportCSV}
                  />
                </Label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Importing data will replace your current
              data. Make sure to export a backup first.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
