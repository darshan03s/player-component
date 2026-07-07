'use client'
import { MediaPlayer } from '@/components/media-player'

import Main from '@/components/main'
import FileImport from '@/components/file-import'
import { useState } from 'react'

const Page = () => {
  const [file, setFile] = useState<File | null>(null)

  return (
    <Main className="flex items-center justify-center ">
      <div>{!file ? <FileImport setFile={setFile} /> : <MediaPlayer file={file} />}</div>
    </Main>
  )
}

export default Page
