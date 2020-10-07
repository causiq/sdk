import { LogaryWindow } from './LogaryWindow'
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
  const w = window as LogaryWindow
  let instance: Logary

  const { config, jsExec } = getConfig(w.logary?.i || [])

  // real instance exists, but we just loaded the browser script; reconfigure
  if (w.logary != null && 'reconfigure' in w.logary) {
    //console.log('Logary already instantiated')
    w.logary.reconfigure()
    instance = w.logary
  }
  else if (w.logary != null) {
    // instance does not exist, create it and configure it from the init value
    instance = getLogary(config)
  } else {
    // instance not existing and we don't have a config ("i" array) for it either, non-async script ref?
    instance = getLogary(config)
  }

  browser(instance)

  instance.getLogger('Logary', 'browser').log(LogLevel.info, jsExec)
  
  return instance
}


export default initLogary()