'use client'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { File, Upload } from 'lucide-react'
import { useRef } from 'react'

const VIDEO_EXTENSIONS = [
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.webm',
  '.flv',
  '.wmv',
  '.mpeg',
  '.mpg',
  '.3gp'
]

const FileImport = ({ setFile }: { setFile: (file: File) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  return (
    <div>
      <Empty className="border border-dashed w-100">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <File />
          </EmptyMedia>
          <EmptyTitle>Import file</EmptyTitle>
          <EmptyDescription>Import a file to get started.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button variant="outline" onClick={handleButtonClick}>
            <Upload />
            Import
          </Button>
        </EmptyContent>
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          accept={VIDEO_EXTENSIONS.join(',')}
        />
      </Empty>
    </div>
  )
}
export default FileImport
