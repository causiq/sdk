import Logary, { Target } from 'logary'

interface LogaryWindow extends Window {
  logary?: { i: any[] } | Logary;
  stubTarget?: Target
}