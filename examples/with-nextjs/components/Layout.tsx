import { ReactNode } from "react"

type Props = Readonly<{ children: ReactNode }>

export default function Layout({ children }: Props) {
  return (
    <div id='layout'>
      {children}

      <style global jsx>{`
        html, body {
          font-size: 16px;
        }

        form {
          display: grid;
          grid-template-columns: 100px 1fr;
          grid-gap: 16px;
        }

        input, button {
          grid-column: 2 / 3;
        }

        fieldset {
          margin: 0.5em 0;
          padding: 1em;
        }
      `}</style>
    </div>
  )
}