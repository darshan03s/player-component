import Main from '@/components/main'
import Link from 'next/link'

const Page = () => {
  return (
    <Main className="flex items-center justify-center ">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Components</h1>
        <div className="flex flex-col gap-2 items-center">
          <Link href="/media-player" className="underline">
            Media Player
          </Link>
        </div>
      </div>
    </Main>
  )
}

export default Page
