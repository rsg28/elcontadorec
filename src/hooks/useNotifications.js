// Verificado
import { toast, ToastContainer as ToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Custom hook for handling toast notifications
 * @returns {Object} Methods for displaying different types of notifications
 */
const useNotifications = () => {
  // Default configuration for toast notifications
  const defaultOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  };

  /**
   * Display a success notification
   * @param {string} message - The message to display
   * @param {Object} options - Optional toast configuration to override defaults
   */
  const success = (message, options = {}) => {
    toast.success(message, { ...defaultOptions, ...options });
  };

  /**
   * Display an error notification
   * @param {string} message - The message to display
   * @param {Object} options - Optional toast configuration to override defaults
   */
  const error = (message, options = {}) => {
    toast.error(message, { ...defaultOptions, ...options });
  };

  /**
   * Display a warning notification
   * @param {string} message - The message to display
   * @param {Object} options - Optional toast configuration to override defaults
   */
  const warning = (message, options = {}) => {
    toast.warning(message, { ...defaultOptions, ...options });
  };

  /**
   * Display an info notification
   * @param {string} message - The message to display
   * @param {Object} options - Optional toast configuration to override defaults
   */
  const info = (message, options = {}) => {
    toast.info(message, { ...defaultOptions, ...options });
  };

  return {
    success,
    error,
    warning,
    info,
    ToastContainer: ToastifyContainer
  };
};

export default useNotifications; 