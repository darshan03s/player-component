'use client'

import { Button } from '@/components/ui/button'
import { PanelRight, Terminal } from 'lucide-react'
import { useFileSystemContext } from './filesystem-provider'
import { cn } from '@/lib/utils'
import { useWebcontainerContext } from './webcontainer-provider'

const Main = () => {
  const { fileSystemOpen, toggleFileSystem } = useFileSystemContext()
  const { rootDir } = useWebcontainerContext()

  return (
    <div className="flex-1">
      <div
        className={cn(
          'main-tree sticky top-0 left-0 h-8 px-2 border-b flex items-center',
          fileSystemOpen ? 'justify-end' : 'justify-between'
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
          <span className="text-xs font-semibold">{rootDir}</span>
        </div>
        <Button variant={'ghost'} size={'icon-xs'}>
          <Terminal />
        </Button>
      </div>
      <div>Main</div>
    </div>
  )
}

export default Main
