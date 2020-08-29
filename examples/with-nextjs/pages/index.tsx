import { useCallback } from "react"
import Layout from "../components/Layout"
import logary from '../lib/logary'
import { useLogger } from '@logary/plugin-react'
import { withLogary } from "@logary/plugin-nextjs"

function Button({ children, ...rest }) {
  return (
    <button {...rest}>
      {children}
    </button>
  )
}

function IndexPage() {
  const { event } = useLogger('IndexPage')
  
  const handlePurchase = useCallback(() =>
    event('Product purchased', {
      amount: 20, currency: 'EUR'
    }, {
      id: "57b9d",
      name: "Kiosk T-Shirt",
      price: "55.00",
      brand: "Kiosk",
      category: "T-Shirts",
      variant: "red",
      dimension1: "M",
      quantity: 1
    }), [])

  const crashingHandler = useCallback(() => {
    throw new Error("Something went wrong")
  }, [])

  return (
    <Layout>
      <h1>Example Logary app</h1>
      <fieldset>
        <legend>Buttons for users in an e-commerce site</legend>
        <Button onClick={handlePurchase}>
          Make purchase
        </Button>
        <Button onClick={crashingHandler}>
          Crashes
        </Button>
        <Button data-track='Make alt. purchase'>
          Make alt. purchase
        </Button>
        </fieldset>

        <fieldset>
          <legend>
            An example form
          </legend>
          <form>
            <label htmlFor='email'>
              E-mail:
            </label>
            <input id='email' type='email' />
          </form>
        </fieldset>
        <style jsx>{`
        form {
          display: grid;
          grid-template-columns: 100px 1fr;
          grid-gap: 16px;
        }

        input, button {
          grid-column: 2 / 3;
        }
        `}</style>
    </Layout>
  )
}

export default withLogary(IndexPage, { logary })