import { useCallback } from "react"
import Link from 'next/link'
import Layout from "../components/Layout"
import logary from '../lib/logary'
// import { useLogger } from '@logary/plugin-react'
// import { withLogary } from "@logary/plugin-nextjs"

function Button({ children, ...rest }) {
  return (
    <button {...rest}>
      {children}
    </button>
  )
}

function IndexPage() {
  const asd = logary.appId

  // const { event } = useLogger('IndexPage')

  // const handlePurchase = useCallback(() =>
  //   event('Product purchased', {
  //     amount: 20, currency: 'EUR'
  //   }, {
  //     id: "57b9d",
  //     name: "Kiosk T-Shirt",
  //     price: "55.00",
  //     brand: "Kiosk",
  //     category: "T-Shirts",
  //     variant: "red",
  //     dimension1: "M",
  //     quantity: 1
  //   }), [])

  const crashingHandler = useCallback(() => {
    throw new Error("Something went wrong")
  }, [])

  return (
    <Layout>
      <h1>Example Logary app</h1>
      <fieldset>
        <legend>Buttons for users in an e-commerce site</legend>
        {/* <Button onClick={handlePurchase}>
          Make purchase
        </Button> */}
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

      <fieldset>
        <legend>Navigation events</legend>

        <Link href='/contact'>
          <a>Contact us</a>
        </Link>
      </fieldset>
    </Layout>
  )
}

export default IndexPage