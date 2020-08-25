import { useCallback } from "react"
import Layout from "../components/Layout"
import logary from '../lib/logary'
import { useLogger } from '@logary/plugin-react'
import { withLogary } from "@logary/plugin-nextjs"

function MyButton({ onClick, children }) {
  return (
    <button id="button1" className="btnAddClass" onClick={onClick}>
      {children || 'Add button'}
    </button>
  )
}

function IndexPage() {
  const { info } = useLogger('IndexPage')
  const handleClick = useCallback(() => info('Button clicked'), [])
  const crashingHandler = useCallback(() => {
    throw new Error("Something went wrong")
  }, [])

  return (
    <Layout>
      <h1>Example Logary app</h1>
      <MyButton onClick={handleClick}>
        Test
      </MyButton>
      <MyButton onClick={crashingHandler}>
        Crashes
      </MyButton>
    </Layout>
  )
}

export default withLogary(IndexPage, { logary })