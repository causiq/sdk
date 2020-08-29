import Layout from "../components/Layout";
import Link from "next/link";

export default function ContactPage() {
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