import Logary, { RuttaTarget, getLogary, LogLevel, Config } from 'logary'
import { ValueOf } from "logary/src"
import browser from '@logary/plugin-browser'
import pkg from './package.json'

function getConfig(init: [keyof Config, ValueOf<Config>][]): Config {
  let appId: string = 'unset',
    serviceName = window.location.hostname
  const libraryVersion = pkg.version

  for (let i = 0; i < init.length; i++) {
    switch (init[i][0]) {
      case 'appId':
        // @ts-ignore
        appId = init[i][1] || appId
        break
      case 'serviceName':
        // @ts-ignore
        serviceName = init[i][1] || serviceName
        break
    }
  }

  return {
    serviceName,
    libraryVersion,
    appId,
    minLevel: LogLevel.verbose,
    targets: [ new RuttaTarget({ endpoint: 'https://i.logary.tech' }) ],
  }
}

export function initLogary(): Logary {
  let instance: Logary

  // real instance exists, but we just loaded the browser script; reconfigure
  // @ts-ignore
  if (logary != null && 'reconfigure' in logary) {
    // @ts-ignore
    logary.reconfigure()
    // @ts-ignore
    instance = logary
  }
  // @ts-ignore
  else if (logary != null) {
    // instance not existing, create it and configure it from the init value
    // @ts-ignore
    instance = getLogary(getConfig(logary.i))
  } else {
    // instance not existing and we don't have a config for it either
    // @ts-ignore
    instance = getLogary(getConfig())
  }

  browser(instance)
  
  // @ts-ignore
  // return window.logary = instance // with rollup
  return instance
}


export default initLogary()