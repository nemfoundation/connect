
## NEM2: Decrypt message
Asks device to decrypt an encrypted message payload.
User is asked to confirm message details on Trezor.


ES6
```javascript
const result = await TrezorConnect.nem2DecryptMessage(params);
```

CommonJS
```javascript
TrezorConnect.nem2DecryptMessage(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/params.js#L114-L117)
* `path` — *obligatory* `string | Array<number>` minimum length is `5`. [read more](path.md)
* `payload` - *obligatory* `string`: plain text message to encrypt
* `senderPublicKey` - *obligatory* `string | Array<number>`: public key of message sender

### Example
Encrypt simple message
```javascript

TrezorConnect.nem2DecryptMessage(
    path: "m/44'/43'/0'/0'/0'",
    payload: "12aa902949c24c9814e7de8663a7c67666e5e1c38d3d44978841311e477753cbfa4b2177116bcff83c2949f86bf36f05d872ccbc283c6bb648a80149c367819a"
    senderPublicKey: "596FEAB15D98BFD75F1743E9DC8A36474A3D0C06AE78ED134C231336C38A6297",
});
```

### Result
###### [flowtype](../../src/js/types/response.js#L271-L274)
```javascript
{
    success: true,
    payload: {
        payload: string, // encrypted message (hex encoded)
    }
}
```
Error
```javascript
{
    success: false,
    payload: {
        error: string // error message
    }
}
```
