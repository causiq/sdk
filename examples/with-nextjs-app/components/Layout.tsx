import { ReactNode } from "react"

type Props = Readonly<{ children: ReactNode }>

export default function Layout({ children }: Props) {
  return (
    <div id='layout'>
      {children}
    </div>
  )
}