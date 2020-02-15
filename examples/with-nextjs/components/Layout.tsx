import tracer from '../lib/tracer'

type Props = Readonly<{
  children: any
}>

export default function Layout({ children }: Props) {
  console.log('tracer', tracer)

  return (
    <div>
      {children}
    </div>
  )
}