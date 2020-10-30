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
  const { event, identify, setUserProperty, forgetUser,
    histogram } = useLogger('IndexPage')

  const handlePurchase = useCallback(() => event('Foobar purchased', {
    amount: 20, currency: 'EUR'
  }), [])

  const crashingHandler = useCallback(() => {
    throw new Error("Something went wrong")
  }, [])

  const identifyHandler = useCallback(() => identify('ABC123', 'ABC321'), [])

  const setUserPropertyHandler = useCallback(() => setUserProperty('ABC123', 'key', 'value'), [])

  const forgetUserHandler = useCallback(() => forgetUser('ABC123'), [])

  const histogramHandler = useCallback(() => histogram({}, {}, 1), [])

  return (
    <Layout>
      <h1>Example usage of Logary with _app.tsx file</h1>
      <Button id='purchase' onClick={handlePurchase}>
        Place purchase
      </Button>
      <Button id='abort' onClick={crashingHandler}>
        Abort (crashes)
      </Button>
      <Button id='identify' onClick={identifyHandler}>
        Identify user
      </Button>
      <Button id='setUserProperty' onClick={setUserPropertyHandler}>
        Set user property
      </Button>
      <Button id='forgetUser' onClick={forgetUserHandler}>
        Forget user
      </Button>
      <Button id='histogram' onClick={histogramHandler}>
        Histogram
      </Button>
    </Layout>
  )
}

export default IndexPage