// utils/toastUtils.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const commonOptions = {
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light", // can be 'dark' or 'colored'
    position: "bottom-right",
};

// ✅ Success toast
export const notifySuccess = (message, duration = 2000) => {
    toast.success(message, {
        ...commonOptions,
        autoClose: duration,
        icon: "✅",
    });
};

// ✅ Error toast
export const notifyError = (message, duration = 2000) => {
    toast.error(message, {
        ...commonOptions,
        autoClose: duration,
        icon: "❌",
    });
};

// ✅ Info toast
export const notifyInfo = (message, duration = 2000) => {
    toast.info(message, {
        ...commonOptions,
        autoClose: duration,
        icon: "ℹ️",
    });
};

// ⚠️ Warning (your missing piece)
export const notifyWarning = (message, duration = 2000) => {
    toast.warning(message, {
        ...commonOptions,
        autoClose: duration,
        icon: '⚠️',
    });
};

// ✅ Waiting toast (warning style)
export const notifyWaiting = (message, duration = 2000) => {
    toast.warning(message, {
        ...commonOptions,
        autoClose: duration,
        icon: "⏳",
    });
};

// ✅ Loading toast (non-auto close)
// Returns toastId so you can update or dismiss it later
export const notifyLoading = (message = "Loading...") => {
    return toast.loading(message, {
        ...commonOptions,
        autoClose: false,
        icon: "🔄",
    });
};

// ✅ Update toast (used for loading to success/error/etc.)
export const notifyUpdateToast = (toastId, type = "success", message = "", duration = 2000) => {
    toast.update(toastId, {
        render: message,
        type,
        isLoading: false,
        autoClose: duration,
        icon: type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️",
    });
};
