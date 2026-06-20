# Payment Scenarios

## SC-PAY-01 Read Payment Signals On Order Detail

- Given an operations admin needs payment facts while reading an order
- When the system presents payment method and payment-related signals on the order
- Then the admin understands the payment context as operational fact
- And the admin does not treat that context as a payment execution control surface

## SC-PAY-02 Read Payment Context During Refund Review

- Given an operations admin reviews a refund request
- When the system presents payment-related facts relevant to that refund
- Then the admin uses those facts to interpret the refund context
- But the payment context does not decide the refund outcome by itself
