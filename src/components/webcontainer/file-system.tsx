'use client'

import { ChevronDown, ChevronRight, File, FilePlus, FolderPlus, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFileSystemContext } from './filesystem-provider'
import { useWebcontainerContext } from './webcontainer-provider'
import { useEffect, useState } from 'react'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { ReadDirEntry } from './types'

export const FileSystem = () => {
  const { fileSystemOpen, toggleFileSystem } = useFileSystemContext()
  const { mounted, readDir, rootDir } = useWebcontainerContext()
  const [fsItems, setFsItems] = useState<ReadDirEntry[]>([])

  async function loadItems() {
    const items = await readDir(rootDir, {
      withFileTypes: true
    })
    setFsItems(items)
  }

  useEffect(() => {
    if (!mounted) return
    loadItems()
  }, [mounted])

  return (
    <div
      className="w-64 border-r overflow-scroll no-scrollbar text-xs relative"
      hidden={!fileSystemOpen}
    >
      <div className="filesystem-header sticky top-0 left-0 h-8 px-1 border-b bg-background z-10 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant={'ghost'}
            size={'icon-xs'}
            title="Toggle sidebar"
            onClick={toggleFileSystem}
          >
            <PanelLeft />
          </Button>
          <span className="font-semibold">{rootDir}</span>
        </div>
        <div className="flex items-center">
          <Button variant={'ghost'} size={'icon-xs'} title="Add file">
            <FilePlus />
          </Button>
          <Button variant={'ghost'} size={'icon-xs'} title="Add file">
            <FolderPlus />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-1">
        <FsTree fsItems={fsItems} />
      </div>
    </div>
  )
}

const FsItem = ({ item }: { item: ReadDirEntry }) => {
  const { readDir, activePath } = useWebcontainerContext()
  const [children, setChildren] = useState<ReadDirEntry[]>([])

  async function handleFsItemClick() {
    if (item.isDirectory()) {
      if (children.length > 0) {
        setChildren([])
      } else {
        const items = await readDir(item.path, {
          withFileTypes: true
        })
        setChildren(items)
      }
    } else if (item.isFile()) {
      activePath(item.path)
    }
  }

  return (
    <>
      <Item
        size={'xs'}
        variant={'default'}
        className="cursor-pointer p-0 m-0 select-none"
        onClick={handleFsItemClick}
      >
        <ItemMedia>
          {item.isDirectory() ? (
            children.length > 0 ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )
          ) : (
            <File className="size-3" />
          )}
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-xs">{item.name}</ItemTitle>
        </ItemContent>
      </Item>
      {children.length > 0 && (
        <div className="flex flex-col gap-2 ml-2 pl-2 border-l">
          <FsTree fsItems={children} />
        </div>
      )}
    </>
  )
}

const FsTree = ({ fsItems }: { fsItems: ReadDirEntry[] }) => {
  return (
    <>
      {fsItems.map((item) => (
        <FsItem
          key={`${item.name}-${String(item.isFile)}-${String(item.isDirectory)}`}
          item={item}
        ></FsItem>
      ))}
    </>
  )
}
