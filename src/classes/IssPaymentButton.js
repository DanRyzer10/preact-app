import { h, render } from "preact";
import PaymentButton from "../IssPaymentButton";

class ISSPaymentButton {
  constructor(config) {
    this._config = {
      apiKey: "",
      currency: "USD",
      amount: "34,32",
      description: "Pago de servicios",
      ...config,
    };
    this._container = document.getElementById("iss-checkout");
    this._services = {
      service_key: process.env.SERVICE_KEY_URL,
      service_bridge: process.env.SERVICE_BRIDGE_URL,
    };
    if (!this._container) {
      console.error("Container #iss-checkout not found");
      return;
    }
    this.render();
  }

  render() {
    render(
      <PaymentButton config={this._config} services={this._services} />,
      this._container
    );
  }

  updateConfig(newConfig) {
    this._config = { ...this._config, ...newConfig };
    this.render();
  }

  get config() {
    return this._config;
  }

  get container() {
    return this._container;
  }

  get services() {
    return this._services;
  }
}

export default ISSPaymentButton;