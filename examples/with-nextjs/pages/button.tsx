import { useCallback } from "react"
import tracer from '../lib/tracer'

const getData = (url) => new Promise((resolve, reject) => {
  // eslint-disable-next-line no-undef
  const req = new XMLHttpRequest()
  req.open('GET', url, true)
  req.send()
  req.onload = () => {
    let json
    try {
      json = JSON.parse(req.responseText)
      resolve(json)
    } catch (e) {
      reject(e)
    }
  }
})

const url1 = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/package.json'
const url2 = 'https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/master/packages/opentelemetry-web/package.json'

// example of keeping track of context between async operations
const buttonClicked = () => {
  let count = 0

  const mainSpan = tracer.startSpan('click button')

  function finish() {
    count++
    if (count === 2) {
      mainSpan.end()
    }
  }

  tracer.withSpan(mainSpan, () => {
    const span1 = tracer.startSpan('files-series-info-1', {
      parent: tracer.getCurrentSpan(),
    })

    const span2 = tracer.startSpan('files-series-info-2', {
      parent: tracer.getCurrentSpan(),
    })

    tracer.withSpan(span1, () => {
      getData(url1).then((data: any) => {
        console.log('current span is span1', tracer.getCurrentSpan() === span1)
        console.log('info from package.json', data.description, data.version)
        tracer.getCurrentSpan().addEvent('fetching-span1-completed')
        span1.end()
        finish()
      })
    })

    tracer.withSpan(span2, () => {
      getData(url2).then((data: any) => {
        setTimeout(() => {
          console.log('current span is span2', tracer.getCurrentSpan() === span2)
          console.log('info from package.json', data.description, data.version)
          tracer.getCurrentSpan().addEvent('fetching-span2-completed')
          span2.end()
          finish()
        }, 100)
      })
    })
  })
}

export default function IndexPage() {
  const handleClick = useCallback(buttonClicked, [])

  return (
    <>
      <p>
        Example of using Web Tracer with UserInteractionPlugin and XMLHttpRequestPlugin with console exporter and collector exporter
      </p>
      <button id="button1" className="btnAddClass" onClick={handleClick}>
        Add button
      </button>
    </>
  )
}