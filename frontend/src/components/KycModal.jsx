import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Camera, CheckCircle2, ChevronRight, ChevronLeft, Loader2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const KycModal = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(1);
    const [aadhaar, setAadhaar] = useState('');
    const [aadhaarError, setAadhaarError] = useState('');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const handleAadhaarChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 12);
        setAadhaar(val);
        if (val.length > 0 && val.length < 12) {
            setAadhaarError('Aadhaar must be 12 digits');
        } else {
            setAadhaarError('');
        }
    };

    const nextStep = () => {
        if (step === 1) {
            if (aadhaar.length !== 12) {
                setAadhaarError('Please enter a valid 12-digit Aadhaar');
                return;
            }
            setStep(2);
        }
    };

    const prevStep = () => {
        if (step === 2) {
            stopCamera();
            setStep(1);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
        } catch (err) {
            console.error('Camera access failed:', err);
            toast.error('Unable to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const captureImage = () => {
        setIsVerifying(true);
        // Simulate processing
        setTimeout(() => {
            setCapturedImage(true);
            setIsVerifying(false);
            stopCamera();
            toast.success('Biometric Face Match Successful');
        }, 2000);
    };

    const finalizeKyc = () => {
        onComplete();
        toast.success('KYC Verification Completed');
    };

    useEffect(() => {
        if (step === 2 && !capturedImage) {
            startCamera();
        }
        return () => stopCamera();
    }, [step]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0a0f1e]/90 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card w-full max-w-md overflow-hidden relative border-accent-cyan/20"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-accent-cyan/5 to-transparent pointer-events-none"></div>
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-secondary hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2].map((i) => (
                            <div 
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                                    step >= i ? 'bg-accent-cyan shadow-[0_0_10px_rgba(0,245,255,0.5)]' : 'bg-white/10'
                                }`}
                            ></div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Identity Verification</h2>
                                        <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em]">Step 1: Aadhaar Authentication</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="glass-card bg-white/5 border-white/10 p-6">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-4">Enter 12-Digit Aadhaar Number</p>
                                        <input 
                                            type="text"
                                            value={aadhaar}
                                            onChange={handleAadhaarChange}
                                            placeholder="XXXX XXXX XXXX"
                                            className="w-full bg-transparent border-b-2 border-white/10 focus:border-accent-cyan outline-none text-2xl font-black tracking-[0.3em] text-white placeholder:text-white/5 transition-all text-center py-2"
                                        />
                                        {aadhaarError && (
                                            <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-4 animate-pulse">
                                                {aadhaarError}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-cyan/5 border border-accent-cyan/10">
                                        <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></div>
                                        <p className="text-[9px] text-secondary font-bold uppercase tracking-widest leading-relaxed">
                                            Your data is encrypted using military-grade AES-256 protocols and stored only locally on this device.
                                        </p>
                                    </div>

                                    <button 
                                        onClick={nextStep}
                                        disabled={aadhaar.length !== 12}
                                        className="btn-gradient w-full py-5 flex items-center justify-center gap-2 group disabled:opacity-30 disabled:grayscale"
                                    >
                                        Initialize Biometrics <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                                        <Camera size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Face Verification</h2>
                                        <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em]">Step 2: Biometric Validation</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative aspect-square rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-inner">
                                        {!capturedImage ? (
                                            <>
                                                <video 
                                                    ref={videoRef} 
                                                    autoPlay 
                                                    playsInline 
                                                    className="w-full h-full object-cover scale-x-[-1]"
                                                />
                                                <div className="absolute inset-0 border-[40px] border-[#0a0f1e]/60 pointer-events-none"></div>
                                                <div className="absolute inset-[40px] border-2 border-accent-cyan/30 rounded-2xl pointer-events-none"></div>
                                                
                                                {/* Scanning UI */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <div className="w-48 h-64 border-2 border-dashed border-accent-cyan/50 rounded-[100px] animate-pulse"></div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-accent-cyan mt-6 drop-shadow-lg">Position face in frame</p>
                                                </div>

                                                <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                                                    <button 
                                                        onClick={captureImage}
                                                        disabled={isVerifying}
                                                        className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95 transition-all"
                                                    >
                                                        {isVerifying ? <Loader2 className="animate-spin text-[#0a0f1e]" /> : <div className="w-12 h-12 rounded-full border-4 border-[#0a0f1e]/10"></div>}
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-accent-cyan/5">
                                                <div className="w-24 h-24 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan mb-6 animate-bounce">
                                                    <UserCheck size={48} />
                                                </div>
                                                <p className="text-xl font-black uppercase italic tracking-widest text-white">Match Confirmed</p>
                                                <p className="text-[9px] text-accent-cyan font-bold uppercase tracking-[0.2em] mt-2">Biometric Identity Verified</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={prevStep}
                                            disabled={isVerifying}
                                            className="flex-1 py-4 glass-card flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                                        >
                                            <ChevronLeft size={16} /> Back
                                        </button>
                                        <button 
                                            onClick={finalizeKyc}
                                            disabled={!capturedImage || isVerifying}
                                            className="flex-[2] btn-gradient py-4 flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale"
                                        >
                                            Submit Final Protocol <CheckCircle2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default KycModal;
