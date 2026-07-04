'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const Player = ({ file }: { file: File }) => {
  const videoUrl = URL.createObjectURL(file)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{file.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <video src={videoUrl} className="aspect-video min-w-100 w-100 rounded-md bg-transparent" />
      </CardContent>
    </Card>
  )
}

export default Player
