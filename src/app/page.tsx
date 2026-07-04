'use client'
import Player from '@/components/player'

import Main from '@/components/main'
import FileImport from '@/components/file-import'
import { useState } from 'react'

const Page = () => {
  const [file, setFile] = useState<File | null>(null)

  console.log(file)

  return (
    <Main className="flex items-center justify-center ">
      <div>
        {!file ? (
          <FileImport setFile={setFile} />
        ) : (
          <Player file={file} showOverlayControls={true} />
        )}
      </div>
    </Main>
  )
}

export default Page
