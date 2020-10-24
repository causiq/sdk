import Layout from "../components/Layout"
import Link from "next/link"
import { withLogary } from "@logary/plugin-nextjs"
import logary from '../lib/logary'

function ContactPage() {
  return <Layout>
    <h1>Contact us</h1>

    <fieldset>
      <legend>About you</legend>

      <label htmlFor='name'>Your name</label>
      <input id='name' type='text' autoFocus />

      <label htmlFor='name'>Your e-mail</label>
      <input id='email' type='email' />
    </fieldset>

    <fieldset>
      <legend>Navigation events</legend>

      <Link href='/'>
        <a>Home</a>
      </Link>
    </fieldset>

  </Layout>
}

export default withLogary(ContactPage, { logary })