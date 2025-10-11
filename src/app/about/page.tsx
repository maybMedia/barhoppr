/* eslint-disable react/no-unescaped-entities */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="flex items-center justify-center bg-background p-4 pt-8">
      <main className="flex flex-col items-center justify-center w-full max-w-3xl text-center gap-6">
        <h1 className="text-4xl font-bold text-primary mb-2">About BarHoppr</h1>

        <Card className="w-full">
          <CardContent className="text-lg text-muted-foreground">
            BarHoppr is your ultimate companion for discovering and exploring bars around you.
            Whether you're looking for a cozy pub, a trendy cocktail lounge, or a lively nightclub,
            BarHoppr has got you covered.
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-left text-muted-foreground text-lg">
              <li className="">Interactive Map: Explore bars in your vicinity with our user-friendly map interface.</li>
              <li className="">Search Functionality: Find bars by name, drink, or location.</li>
              <li className="">User Reviews: Read and write reviews to share your experiences with the community.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="text-lg text-muted-foreground">
            Whether you're a local looking for new spots or a traveler seeking the best nightlife,
            BarHoppr is here to help you make the most of your bar-hopping adventures. Cheers!
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
