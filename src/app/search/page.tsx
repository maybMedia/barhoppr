"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Construction } from "lucide-react"

export default function WipPage() {
  return (
    <div className="flex items-center justify-center pt-8 bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center">
          <Construction className="h-14 w-14 mb-2 text-tertiary" />
          <CardTitle className="text-2xl">Work In Progress</CardTitle>
        </CardHeader>

        <CardContent className="text-muted-foreground text-lg">
          <p className="mb-6">
            The &quot;Search&quot; page is currently under development.<br />
            Check back soon!
          </p>
          <Button variant="default" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
