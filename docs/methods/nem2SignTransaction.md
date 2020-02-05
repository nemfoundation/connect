
## NEM2: Sign transaction
Asks device to sign given transaction. User is asked to confirm all transaction
details on Trezor.



ES6
```javascript
const result = await TrezorConnect.nem2SignTransaction(params);
```

CommonJS
```javascript
TrezorConnect.nem2SignTransaction(params).then(function(result) {

});
```

### Params
[****Optional common params****](commonParams.md)
###### [flowtype](../../src/js/types/params.js#L114-L117)
* `path` - *obligatory* `string | Array<number>`
* `generationHash` - *obligatory* `string | Array<number>`: NEM2 network [generation hash](https://nemtech.github.io/guides/network/configuring-network-properties.html#config-network-properties)
* `transaction` - *obligatory* `Object` type of [NEM2Transaction](../../src/js/types/nem2.js#L41): transaction data as per [nem2-sdk](https://github.com/nemtech/nem2-sdk-typescript-javascript/tree/master/src)

### Example
Sign simple transfer
```javascript

TrezorConnect.nem2SignTransaction(
    path: "m/44'/43'/0'/0'/0'",
    generationHash: "CC42AAD7BD45E8C276741AB2524BC30F5529AF162AD12247EF9A98D6B54A385B",
    transaction: {
        "type": 16724,
        "network": 152,
        "version": 38913,
        "maxFee": "20000",
        "deadline": "113248176649",
        "recipientAddress": {
            "address": "TAO6QEUC3APBTMDAETMG6IZJI7YOXWHLGC5T4HA4",
            "networkType": 152
        },
        "mosaics": [
            {
                "amount": "1000000000",
                "id": "308F144790CD7BC4"
            }
        ],
        "message": {
            "type": 0,
            "payload": "Test Transfer"
        }
    }
});
```

### Result
###### [flowtype](../../src/js/types/response.js#L271-L274)
```javascript
{
    success: true,
    payload: {
        hash: string,
        payload: string,
        signature: string,
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
