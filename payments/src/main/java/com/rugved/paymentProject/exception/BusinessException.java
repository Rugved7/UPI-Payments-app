package com.rugved.paymentProject.exception;

public class BusinessException extends RuntimeException {

    private final String errorCode;

    public BusinessException(String messsage) {
        super(messsage);
        this.errorCode = "BUSINESS_ERROR";
    }

    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public static class ErrorCodes {
        public static final String INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE";
        public static final String INVALID_UPI_PIN = "INVALID_UPI_PIN";
        public static final String VPA_NOT_FOUND = "VPA_NOT_FOUND";
        public static final String TRANSACTION_NOT_FOUND = "TRANSACTION_NOT_FOUND";
        public static final String BANK_ACCOUNT_NOT_LINKED = "BANK_ACCOUNT_NOT_LINKED";
    }
}
