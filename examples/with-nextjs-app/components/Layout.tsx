import Head from 'next/head'
import { ReactNode } from "react"

type Props = Readonly<{ children: ReactNode }>

export default function Layout({ children }: Props) {
  return (
    <div id='layout'>
      <Head>
        <title>Logary Analytics — with-nextjs-app</title>
      </Head>
      {children}
    </div>
  )
}