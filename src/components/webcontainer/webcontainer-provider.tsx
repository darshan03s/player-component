'use client'

import { createContext, useContext, useState } from 'react'
import {
  FileSystemAPI,
  FileSystemTree,
  LoadFilesOptions,
  WebContainer,
  WebContainerProcess
} from '@webcontainer/api'
import { ReadDirEntry } from './types'
import { DEFAULT_ROOT_DIR } from './constants'

type Boot = () => Promise<WebContainer>

type Mount = (projectFiles: FileSystemTree, options?: LoadFilesOptions) => Promise<void>

type Spawn = (
  baseCommand: string,
  args: string[],
  output?: { write: boolean; writeFn?: (data: string) => void }
) => Promise<{
  process: WebContainerProcess
  processExitCode: number
}>

type ReadFile = (
  ...args: Parameters<FileSystemAPI['readFile']>
) => ReturnType<FileSystemAPI['readFile']>

type WriteFile = (
  ...args: Parameters<FileSystemAPI['writeFile']>
) => ReturnType<FileSystemAPI['writeFile']>

type MkDir = (...args: Parameters<FileSystemAPI['mkdir']>) => ReturnType<FileSystemAPI['mkdir']>

type ReadDir = (
  path: Parameters<FileSystemAPI['readdir']>['0'],
  options: Parameters<FileSystemAPI['readdir']>['1'],
  foldersFirst?: boolean
) => Promise<ReadDirEntry[]>

type Rm = (...args: Parameters<FileSystemAPI['rm']>) => ReturnType<FileSystemAPI['rm']>

type Rename = (...args: Parameters<FileSystemAPI['rename']>) => ReturnType<FileSystemAPI['rename']>

type LoadSnapshot = (snapshotUrl: string) => Promise<void>

type Init = (loadFromSnapshot?: string) => Promise<void>

type ActiveFile = {
  path: string
  content: string
}

type WebcontainerContextType = {
  wc: WebContainer | null
  boot: Boot
  mount: Mount
  spawn: Spawn
  readFile: ReadFile
  writeFile: WriteFile
  mkDir: MkDir
  readDir: ReadDir
  rm: Rm
  rename: Rename
  loadSnapshot: LoadSnapshot
  mounted: boolean
  init: Init
  rootDir: string
  activePath: (path: string) => void
  activeFile: ActiveFile
}

const WebcontainerContext = createContext<WebcontainerContextType | undefined>(undefined)

export const WebcontainerProvider = ({
  children,
  rootDir = DEFAULT_ROOT_DIR
}: {
  children: React.ReactNode
  rootDir?: string
}) => {
  const [wc, setWc] = useState<WebContainer | null>(null)
  const [mounted, setMounted] = useState<boolean>(false)
  const [activeFile, setActiveFile] = useState<ActiveFile>({
    path: '',
    content: ''
  })

  function requireWc(): WebContainer {
    if (!wc) {
      throw new Error('WebContainer is not initialized. Call boot() first.')
    }

    return wc
  }

  const boot: Boot = async () => {
    if (wc) return wc
    const webcontainerInstance = await WebContainer.boot()
    setWc(webcontainerInstance)
    return webcontainerInstance
  }

  const mount: Mount = async (projectFiles, options) => {
    const wc = requireWc()
    await wc.fs.mkdir(rootDir)
    await wc.mount(projectFiles, options)
    setMounted(true)
  }

  const spawn: Spawn = async (baseCommand, args, output) => {
    const wc = requireWc()
    const process = await wc.spawn(baseCommand, args)

    const processExitCode = await process.exit

    if (output?.write) {
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            if (output.writeFn) {
              output.writeFn(data)
            } else {
              console.log(data)
            }
          }
        })
      )
    }

    return {
      process,
      processExitCode
    }
  }

  const readFile: ReadFile = async (path, encoding = 'utf-8') => {
    const wc = requireWc()
    const fileContent = await wc.fs.readFile(path, encoding)
    return fileContent
  }

  const writeFile: WriteFile = async (path, data, options) => {
    const wc = requireWc()
    return await wc.fs.writeFile(path, data, options)
  }

  const mkDir: MkDir = async (folderPath, options) => {
    const wc = requireWc()
    return await wc.fs.mkdir(folderPath, options)
  }

  const readDir: ReadDir = async (path, options, foldersFirst = false) => {
    const wc = requireWc()
    const items = await wc.fs.readdir(path, options)
    const itemsWithPath = items.map((item) => ({
      path: `${path}/${item.name}`,
      name: item.name,
      isFile: () => item.isFile(),
      isDirectory: () => item.isDirectory()
    }))
    if (foldersFirst) {
      const folders = itemsWithPath.filter((i) => i.isDirectory())
      const files = itemsWithPath.filter((i) => i.isFile())
      return [...folders, ...files]
    }
    return itemsWithPath
  }

  const rm: Rm = async (path, options) => {
    const wc = requireWc()
    return await wc.fs.rm(path, options)
  }

  const rename: Rename = async (oldPath, newPath) => {
    const wc = requireWc()
    return await wc.fs.rename(oldPath, newPath)
  }

  const loadSnapshot: LoadSnapshot = async (snapshotUrl: string) => {
    const wc = requireWc()

    const snapshotResponse = await fetch(snapshotUrl)
    const snapshot = await snapshotResponse.arrayBuffer()

    await wc.fs.mkdir(rootDir)
    await wc.mount(snapshot)
    setMounted(true)
  }

  const init: Init = async (loadFromSnapshot) => {
    const wc = await boot()

    if (loadFromSnapshot) {
      const response = await fetch(loadFromSnapshot)
      const snapshot = await response.arrayBuffer()
      await wc.fs.mkdir(rootDir)
      await wc.mount(snapshot, { mountPoint: rootDir })
      setMounted(true)
    }
  }

  const activePath = async (path: string) => {
    const content = await readFile(path, 'utf-8')
    setActiveFile({
      path,
      content
    })
  }

  return (
    <WebcontainerContext.Provider
      value={{
        boot,
        wc,
        mount,
        spawn,
        readFile,
        writeFile,
        mkDir,
        readDir,
        rm,
        rename,
        loadSnapshot,
        mounted,
        init,
        rootDir,
        activePath,
        activeFile
      }}
    >
      {children}
    </WebcontainerContext.Provider>
  )
}

export const useWebcontainerContext = () => {
  const context = useContext(WebcontainerContext)
  if (!context) {
    throw new Error('useWebcontainerContext must be used within a WebcontainerProvider')
  }
  return context
}
