'use client'

import { useWebcontainer, WebcontainerProvider } from './webcontainer-provider'
import { FileSystem } from './file-system'
import { FileSystemProvider } from './filesystem-provider'
import { Editor } from './editor'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Terminal } from 'lucide-react'

type PlaygroundProps = {
  loadFromSnapshot?: string
  rootDir?: string
}

export const Playground = ({ ...props }: PlaygroundProps) => {
  return (
    <WebcontainerProvider rootDir={props.rootDir}>
      <Comp {...props} />
    </WebcontainerProvider>
  )
}

const Comp = ({ loadFromSnapshot }: PlaygroundProps) => {
  const { init } = useWebcontainer()

  useEffect(() => {
    init(loadFromSnapshot)
  }, [])

  return (
    <div className="[--playground-width:--spacing(240)] [--playground-height:--spacing(140)] w-(--playground-width) h-(--playground-height) border rounded-lg flex flex-col">
      <div className="bg-background rounded-tl-lg rounded-tr-lg min-h-10 h-10 px-2 flex items-center justify-between border-b">
        <span></span>
        <Button variant={'secondary'} size={'icon-xs'}>
          <Terminal />
        </Button>
      </div>
      <FileSystemProvider>
        <div className="flex flex-1 min-h-0 [--inner-header-height:--spacing(8)] [--fs-width:--spacing(64)]">
          <FileSystem />
          <Editor />
        </div>
      </FileSystemProvider>
    </div>
  )
}
