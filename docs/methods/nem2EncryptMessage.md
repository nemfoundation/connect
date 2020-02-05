
## NEM2: Encrypt message
Asks device to create an encrypted message payload from the given plain text message.
User is asked to confirm message details on Trezor.


ES6
```javascript
const result = await TrezorConnect.nem2EncryptMessage(params);
```

CommonJS
```javascript
TrezorConnect.nem2EncryptMessage(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/params.js#L114-L117)
* `path` — *obligatory* `string | Array<number>` minimum length is `5`. [read more](path.md)
* `payload` - *obligatory* `string`: plain text message to encrypt
* `recipientPublicKey` - *obligatory* `string | Array<number>`: public key of message recipient

### Example
Encrypt simple message
```javascript

TrezorConnect.nem2EncryptMessage(
    path: "m/44'/43'/0'/0'/0'",
    payload: "Example Message"
    recipientPublicKey: "596FEAB15D98BFD75F1743E9DC8A36474A3D0C06AE78ED134C231336C38A6297",
});
```

### Result
###### [flowtype](../../src/js/types/response.js#L271-L274)
```javascript
{
    success: true,
    payload: {
        payload: string, // encrypted message, pre-pended with aes salt and iv
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
