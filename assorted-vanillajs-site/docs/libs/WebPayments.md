# WebPayments

```ts
export class WebPaymentManager {
  private paymentDetails: PaymentDetailsInit;
  private paymentMethods?: PaymentMethodData[];
  private paymentRequest?: PaymentRequest;
  constructor(items: PaymentItem[]) {
    this.paymentDetails = this._constructCart(items);
  }

  private _constructCart(items: PaymentItem[]) {
    return {
      total: {
        label: "Total",
        amount: {
          currency: "USD",
          value: items
            .reduce((acc, item) => acc + Number(item.amount.value), 0)
            .toString(),
        },
      },
      displayItems: items,
    } as PaymentDetailsInit;
  }

  constructCart(items: PaymentItem[]) {
    this.paymentDetails = this._constructCart(items);
    this.setupPayment();
  }

  async canMakePayment() {
    if (!this.paymentRequest) {
      throw new Error("Payment request not set");
    }
    return await this.paymentRequest.canMakePayment();
  }

  async makePayment() {
    try {
      if (!this.paymentRequest) {
        throw new Error("Payment request not set");
      }
      const canMakePayment = await this.paymentRequest.canMakePayment();
      if (!canMakePayment) {
        throw new Error("Cannot make payment");
      }
      const paymentResponse = await this.paymentRequest.show();
      await paymentResponse.complete("success");
      return paymentResponse;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  setupPayment() {
    if (!this.paymentMethods) {
      throw new Error("Payment methods not set");
    }
    this.paymentRequest = new PaymentRequest(
      this.paymentMethods!,
      this.paymentDetails
    );
  }

  setupPaymentMethod({
    gateway,
    gatewayMerchantId,
    merchantName,
    merchantId,
    environment = "TEST",
  }: {
    environment?: "TEST" | "PRODUCTION";
    gateway: string;
    gatewayMerchantId: string;
    merchantName: string;
    merchantId: string;
  }) {
    this.paymentMethods = [
      {
        supportedMethods: "https://google.com/pay",
        data: {
          environment: environment, // Use 'PRODUCTION' in a live environment
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [
            {
              type: "CARD",
              parameters: {
                allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                allowedCardNetworks: [
                  "AMEX",
                  "DISCOVER",
                  "JCB",
                  "MASTERCARD",
                  "VISA",
                ],
              },
              tokenizationSpecification: {
                type: "PAYMENT_GATEWAY",
                parameters: {
                  gateway: gateway || "", // Replace with your gateway
                  gatewayMerchantId: gatewayMerchantId || "", // Replace with your merchant ID
                },
              },
            },
          ],
          merchantInfo: {
            merchantName: merchantName || "",
            merchantId: merchantId || "", // Replace with your Google Pay merchant ID
          },
        },
      },
    ];
  }
}
```

And here is how to use it:

```ts
const paymentManager = new WebPaymentManager([
  { label: "Item 1", amount: { currency: "USD", value: "1.50" } },
  { label: "Item 2", amount: { currency: "USD", value: "1.50" } },
]);
paymentManager.setupPaymentMethod({
  gateway: "example",
  gatewayMerchantId: "exampleMerchantId",
  merchantName: "Example Merchant",
  merchantId: "01234567890123456789",
  environment: "TEST",
});
paymentManager.setupPayment();

document.querySelector("#pay").addEventListener("click", async () => {
  const details = await paymentManager.makePayment();
  if (!details) {
    console.error("Payment failed");
    return;
  }
  console.log(details);
});
```
