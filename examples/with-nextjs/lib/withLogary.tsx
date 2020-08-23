import { NextPage } from "next"
import { useMemo } from "react"
import Logary, { getLogary } from "../../../dist"
import { Config } from "../../../dist/config"
import { UniversalRendering } from "../../../dist/features"
import { NextJSFeature, NextJSSupporter } from "../../../dist/plugins/nextjs"
import { LogaryProvider } from "./useLogary"

type WithLogaryProps = Readonly<{
  logary?: Logary;
  config?: Config;
}>

const optInFeatures = [ NextJSFeature, UniversalRendering ]

export default function withLogary<P, IP = P>(
  Page: NextPage<P, IP>,
  { logary, config }: WithLogaryProps
) {
  const WithLogary: NextPage<P, IP> = ({ ...pageProps }: any) => {
    const value = useMemo(
      () => getLogary(config, logary),
      [])

    return (
      <LogaryProvider.Provider value={value}>
        <Page {...pageProps} />
      </LogaryProvider.Provider>
    )
  }

  if (process.env.NODE_ENV !== "production") {
    const displayName = Page.displayName || Page.name || "NextPage"
    if (displayName === "App") console.warn("This withLogary HOC only works with NextPage:s.")
    WithLogary.displayName = `withLogary(${displayName}, <<Config>>)`
  }

  let supporters: NextJSSupporter[] | undefined

  const ssrOptIn =
    logary != null
    && (supporters = logary.getSupporters(optInFeatures) as NextJSSupporter[])
    && supporters.some(x => x.getInitialProps != null)

  if (ssrOptIn || Page.getInitialProps) {
    const __logary = logary || getLogary(config, logary)

    WithLogary.getInitialProps = async ctx => {
      let pageProps = Page.getInitialProps ? await Page.getInitialProps(ctx) : {} as IP

      if (supporters != null) {
        for (const supporter of supporters) {
          if (supporter.getInitialProps) {
            const res = await supporter.getInitialProps<IP>(ctx, __logary)
            if (res != null) {
              pageProps = { ...pageProps, ...res }
            }
          }
        }
      }

      return pageProps
    }
  }

  return WithLogary
}