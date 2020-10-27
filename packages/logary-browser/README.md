# Logary JS — Browser Plugin

A plugin for browser.

## Usage

For details, see [`./examples/with-plain-html`](https://github.com/logary/logary-js/tree/master/examples) in the repository.

In your `index.html` head:

```html
  <head>
    <script src="https://app.logary.tech/logary.min.js" async></script>
    <script>
      window.logary = window.logary||{i:[]};
      logary.i.push(['appId', 'LA-35710335']);
      logary.i.push(['serviceName', 'with-plain-html']);
      logary.i.push(['js', Date.now()]);
    </script>
  </head>
```

Extra features: To specify events such as 'Purchase made'
In your `index.html` (this require the script tag in header to be defined):

```html
  <script>
    function handlePurchase(e) {
      if (!('getLogger' in logary)) return;
      let logger = logary.getLogger('Cart checkout page');
      logger.event('Purchase made', { amount: 20.3, currency: 'USD' });
    }
  </script>
  <body>    
    <button onClick={handlePurchase}>
      Make purchase
    </button>
  </body>
```
