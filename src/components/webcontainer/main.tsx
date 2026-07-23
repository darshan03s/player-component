'use client'

import { Button } from '@/components/ui/button'
import { PanelRight } from 'lucide-react'
import { useFileSystemContext } from './filesystem-provider'
import { cn } from '@/lib/utils'
import { useWebcontainerContext } from './webcontainer-provider'

const Main = () => {
  const { fileSystemOpen, toggleFileSystem } = useFileSystemContext()
  const { activeFile } = useWebcontainerContext()

  return (
    <div className="flex-1">
      <div
        className={cn(
          'main-tree sticky top-0 left-0 h-8 border-b flex items-center px-1 bg-background z-10'
        )}
      >
        <div hidden={fileSystemOpen} className="flex items-center">
          <Button
            variant={'ghost'}
            size={'icon-xs'}
            title="Toggle sidebar"
            onClick={toggleFileSystem}
          >
            <PanelRight />
          </Button>
        </div>
        <span className="text-xs font-semibold">{activeFile.path}</span>
      </div>
      <div>{activeFile.content}</div>
    </div>
  )
}

export default Main
