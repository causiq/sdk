import { useCallback } from "react"
import Layout from "../components/Layout"
import { useLogger } from '@logary/plugin-react'

function Button({ onClick, children, ...rest }) {
  return (
    <button id="purchase" className="primary" onClick={onClick} {...rest}>
      {children || 'Place purchase'}
    </button>
  )
}

function IndexPage() {
  const { event } = useLogger('IndexPage')

  const handlePurchase = useCallback(() => event('Foobar purchased', {
    amount: 20, currency: 'EUR'
  }), [])

  const crashingHandler = useCallback(() => {
    throw new Error("Something went wrong")
  }, [])

  return (
    <Layout>
      <h1>Example usage of Logary with _app.tsx file</h1>
      <Button id='purchase' onClick={handlePurchase}>
        Place purchase
      </Button>
      <Button id='abort' onClick={crashingHandler}>
        Abort (crashes)
      </Button>
    </Layout>
  )
}

export default IndexPage