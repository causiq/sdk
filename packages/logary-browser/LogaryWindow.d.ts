import Logary from 'logary'

interface LogaryWindow extends Window {
  logary?: { i: any[] } | Logary;
}