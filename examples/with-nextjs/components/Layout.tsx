import '../lib/tracer'

type Props = Readonly<{
  children: any
}>

export default function Layout({ children }: Props) {
  return (
    <div>
      {children}
    </div>
  )
}