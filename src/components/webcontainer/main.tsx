'use client'

import { Button } from '@/components/ui/button'
import { File, PanelRight } from 'lucide-react'
import { useFileSystemContext } from './filesystem-provider'
import { cn } from '@/lib/utils'
import { useWebcontainerContext } from './webcontainer-provider'
import { Spinner } from '@/components/ui/spinner'

const Editor = () => {
  const { activeFile } = useWebcontainerContext()

  return <div className="flex-1 overflow-scroll no-scrollbar">{activeFile.content}</div>
}

const Main = () => {
  const { fileSystemOpen, toggleFileSystem } = useFileSystemContext()
  const { activeFile, mounted } = useWebcontainerContext()

  return (
    <div className="flex-1 flex flex-col">
      <div
        className={cn(
          'main-tree sticky top-0 left-0 h-(--inner-header-height) min-h-(--inner-header-height) border-b flex items-center px-1 bg-background z-10'
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
      {mounted ? (
        activeFile.path.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs">
            <span>
              <File className="size-20 text-muted" />
            </span>
          </div>
        ) : (
          <Editor />
        )
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  )
}

export default Main
