'use client'

import Main from '@/components/main'
import FileImport from '@/components/file-import'
import { useState } from 'react'

const Page = () => {
  const [file, setFile] = useState<File | null>(null)

  return (
    <Main className="flex items-center justify-center ">
      <div>{!file && <FileImport setFile={setFile} />}</div>
    </Main>
  )
}

export default Page
