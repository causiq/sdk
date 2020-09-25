import Logary, { RuttaTarget, getLogary, LogLevel, Config, EventMessage } from 'logary'
import { ValueOf } from "logary/src"
import browser from '@logary/plugin-browser'
import pkg from './package.json'

type Res = {
  config: Config;
  jsExec: EventMessage
}

function getConfig(init: [keyof Config | string, ValueOf<Config>][]): Res {
  let appId: string = 'unset', serviceName = window.location.hostname, jsExec = null
  const libraryVersion = pkg.version

  for (let i = 0; i < init.length; i++) {
    switch (init[i][0]) {
      case 'appId': {
        appId = init[i][1] as string || appId
        break
      }

      case 'serviceName': {
        serviceName = init[i][1] as string || serviceName
        break
      }

      case 'js': {
        const ts = BigInt('1000000') * BigInt(init[i][1])
        jsExec = new EventMessage('JS exec on load', null, null, LogLevel.info, ts)
        break
      }
    }
  }

  return {
    config: {
      serviceName,
      libraryVersion,
      appId,
      minLevel: LogLevel.verbose,
      targets: [ new RuttaTarget({ endpoint: 'https://i.logary.tech' }) ],
    },
    jsExec: jsExec || new EventMessage('JS exec on load')
  }
}

function initLogary(): Logary {
  let instance: Logary

  // @ts-ignore
  console.log('init logary called, window.logary', logary, window.logary)

  // @ts-ignore
  const { config, jsExec } = getConfig(logary?.i || [])

  // real instance exists, but we just loaded the browser script; reconfigure
  // @ts-ignore
  if (logary != null && 'reconfigure' in logary) {
    console.log('Logary already instantiated')
    // @ts-ignore
    logary.reconfigure()
    // @ts-ignore
    instance = logary
  }
  // @ts-ignore
  else if (logary != null) {
    // console.log('Logary stub exists')
    // instance does not exist, create it and configure it from the init value
    // @ts-ignore
    instance = getLogary(config)
  } else {
    // instance not existing and we don't have a config for it either
    // @ts-ignore
    instance = getLogary(config)
    console.log('else case')
  }

  browser(instance)

  instance.getLogger('Logary', 'browser').log(LogLevel.info, jsExec)
  
  // @ts-ignore
  // return window.logary = instance // with rollup
  return instance
}


export default initLogary()