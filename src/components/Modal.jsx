import { h } from 'preact';
import { useState,useEffect } from 'preact/hooks';

export function OtpModal({open,onAction,onOtpChange}) {
    const [visible,setVisible] = useState(open);
    const [otp,setOtp] = useState('');
    useEffect(() => {
        setVisible(open);
    }, [open]);
    const handleOtpInputChange = (e) =>{
        const newOtp = e.target.value;
        setOtp(newOtp);
        onOtpChange(newOtp)
    }
    const handleAction = async () =>{
        onAction();
        setVisible(false);
    }

    return (
        <dialog className='modal-container' open={visible} >
            <div className="modal-content">
                <h2>OTP Verification</h2>
                <p>Enter the OTP sent to your mobile number</p>
                <input value={otp} onChange={handleOtpInputChange} type="text" placeholder="Enter OTP" />
                <button onClick={handleAction}>Verify OTP</button>
            </div>
        </dialog>
    )
}

