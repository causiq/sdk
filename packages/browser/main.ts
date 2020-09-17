import Logary, { RuttaTarget, getLogary, LogLevel, Config } from '../logary'
import { ValueOf } from "../logary/src"
import browser from '../logary-plugin-browser/dist'
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

export default function initLogary(): Logary {
  let instance: Logary

  // real instance exists, but we just loaded the browser script; reconfigure
  // @ts-ignore
  if (_lgy != null && 'reconfigure' in _lgy) {
    // @ts-ignore
    _lgy.reconfigure()
    // @ts-ignore
    instance = _lgy
  }
  // @ts-ignore
  else if (_lgy != null) {
    // instance not existing, create it and configure it from the init value
    // @ts-ignore
    instance = getLogary(getConfig(_lgy.i))
  } else {
    // instance not existing and we don't have a config for it either
    // @ts-ignore
    instance = getLogary(getConfig())
  }

  browser(instance)
  
  // @ts-ignore
  return window._lgy = instance
}