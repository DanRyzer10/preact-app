import { h, render } from "preact";
import { useState, useEffect } from "preact/hooks";
import {
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
} from "./validations.js";
import { usePadCenterToCardNumber } from "./hooks/usePadCenterToCardNumber.js";
import { CardNumberInput } from "./components/CardNumberInputs.jsx";
import { ExpiryDateInput } from "./components/ExpiryDateInput.jsx";
import { CVVInput } from "./components/CvvInput.jsx";
import { OtpModal } from "./components/Modal.jsx";
import Encryptor from "./utils/encryptor.js";
import handleForm from "./utils/handleForm.js";
import "./paymentButton.css";

function PaymentButton({ config, services }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [expiredLabel, setExpiredLabel] = useState("MM/AA");
  const [errors, setErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [centeredCardNumber, padCenterToCardNumber] =
    usePadCenterToCardNumber(cardNumber);
  const [otpDetails, setOtpDetails] = useState({});
  const [key, setKey] = useState("");
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [payload, setPayload] = useState({});

  const fetchKey = async () => {
    const response = await fetch(services.service_key);
    const data = await response.json();
    return data.key;
  };

  useEffect(() => {
    fetchKey().then((data) => setKey(data));
  }, []);

  const handleOtpChange = (otp) => {
    setOtp(otp);
  };

  useEffect(async () => {
    if (otp.length === 6) {
      const payloadWithOtp = {
        ...payload,
        paramsOtp: {
          ...otpDetails,
          otpCode: otp,
        },
      };
      await postData(
        services.service_bridge,
        payloadWithOtp,
        setIsVisibleModal,
        setProcessing,
        setCardNumber,
        setExpiryDate,
        setCvv,
        setErrors
      );
    }
  }, [otp]);

  useEffect(async () => {
    if (Object.keys(payload).length > 0) {
      await postData(
        services.service_bridge,
        payload,
        setIsVisibleModal,
        setProcessing,
        setCardNumber,
        setExpiryDate,
        setCvv,
        setErrors
      );
    }
  }, [payload]);

  useEffect(() => {
    padCenterToCardNumber(cardNumber);
  }, [cardNumber]);

  useEffect(() => {
    const [month, year] = expiredLabel.split("/");
    if (expiryDate.includes("/")) {
      setExpiredLabel(expiryDate);
    }
  }, [expiryDate]);

  const postData = async (
    url,
    payload,
    setIsVisibleModal,
    setProcessing,
    setCardNumber,
    setExpiryDate,
    setCvv,
    setErrors
  ) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.code === 103) {
        const challengeUrl = data.detail.url;
        const params = data.detail.parameters;
        const queryParams = params
          .map(
            (param) =>
              `${encodeURIComponent(param.name)}=${encodeURIComponent(
                param.value
              )}`
          )
          .join("&");
        const fullUrl = `${challengeUrl}&${queryParams}`;
        window.location.href = `${
          process.env.SERVICE_CHALLENGE_URL
        }?challengeUrl=${encodeURIComponent(fullUrl)}`;
      }
      if (data.code === 100) {
        setIsVisibleModal(true);
        setOtpDetails(data.detail);
      }
      if (data.code === 0) {
        onRedirect(config.redirectUrl, data.detail);
        return;
      }
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcessing(false);
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setErrors({ cardNumber: "", expiryDate: "", cvv: "" });
    }
  };

  const onRedirect = (url, data) => {
    const baseUrl = url;
    const queryParams = new URLSearchParams(data).toString();
    const fullUrl = `${baseUrl}?${queryParams}`;
    window.location.href = fullUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //validacion de campos
    const cardNumberError = validateCardNumber(cardNumber);
    const expiryDateError = validateExpiryDate(expiryDate);
    const cvvError = validateCVV(cvv);
    if (cardNumberError || expiryDateError || cvvError) {
      setErrors({
        cardNumber: cardNumberError,
        expiryDate: expiryDateError,
        cvv: cvvError,
      });
      return;
    }
    const [expiryMonth, expiryYear] = expiryDate.split("/");
    //encriptacion de datos
    const rawKey = handleForm(key);
    console.log(rawKey);
    const encryptor = new Encryptor(btoa(rawKey));
    const cardNumberEnc = encryptor.encrypt(cardNumber);
    const expiryMonthEncrypt = encryptor.encrypt(expiryMonth);
    const expiryYearEncrypt = encryptor.encrypt(expiryYear);
    const cvvEnc = encryptor.encrypt(cvv);
    setPayload({
      card: {
        number: cardNumberEnc,
        expirationMonth: expiryMonthEncrypt,
        expirationYear: expiryYearEncrypt,
        cvv: cvvEnc,
      },
    });
    setProcessing(true);
  };

  return (
    <div>
      <OtpModal
        open={isVisibleModal}
        onAction={() => {}}
        onOtpChange={handleOtpChange}
      />
      <div className="ppxiss-top-label">
        {`Estas realizando un pago para ${config.companyName}`}
      </div>
      <div className="card-brandName">
        <div className="card-label">{centeredCardNumber}</div>
        <div className="card-label-light">{expiredLabel}</div>
        <div className="card-label">{config.clientName}</div>
      </div>
      <form className="card-registration-form" onSubmit={handleSubmit}>
        <CardNumberInput
          value={cardNumber}
          onInput={(e) => setCardNumber(e.target.value)}
          error={errors.cardNumber}
        />
        <ExpiryDateInput
          value={expiryDate}
          onInput={(e) => setExpiryDate(e.target.value)}
          error={errors.expiryDate}
        />
        <CVVInput
          value={cvv}
          onInput={(e) => setCvv(e.target.value)}
          error={errors.cvv}
        />
        <button type="submit" className="submit-button" disabled={processing}>
          {processing
            ? "Procesando..."
            : `Pagar (${config.amount}${config.currency})`}
        </button>
      </form>
    </div>
  );
}

export default PaymentButton;