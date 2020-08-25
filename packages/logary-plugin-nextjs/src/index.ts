import { NextPageContext } from 'next'
import Logary from "logary"
import { ReactJSFeature } from "@logary/plugin-react"

export const NextJSFeature = 'nextjs'

export interface NextJSSupporter {
  readonly getInitialProps?: <P>(context: NextPageContext, logary: Logary) => P | Promise<P>;
}

export const name = 'plugins/nextjs'

export const features = [
  NextJSFeature,
  ReactJSFeature
]

export default function nextjs(logary: Logary) {
  logary.register({
    name,
    features,
    supports(feature) {
      return features.indexOf(feature) !== -1
    },
    run() {
      return () => { }
    }
  })
}

export { default as useLogary, LogaryProvider } from './useLogary'
export { default as useLogger } from './useLogger'
export { default as withLogary } from './withLogary'