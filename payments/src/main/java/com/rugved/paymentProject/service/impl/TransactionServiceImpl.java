package com.rugved.paymentProject.service.impl;

import com.rugved.paymentProject.dto.TransactionRequest;
import com.rugved.paymentProject.dto.TransactionResponse;
import com.rugved.paymentProject.model.BankAccount;
import com.rugved.paymentProject.model.Transaction;
import com.rugved.paymentProject.model.VirtualPaymentAddress;
import com.rugved.paymentProject.repository.BankAccountRepository;
import com.rugved.paymentProject.repository.TransactionRepository;
import com.rugved.paymentProject.repository.VpaRepository;
import com.rugved.paymentProject.service.TransactionService;
import com.rugved.paymentProject.service.UPIPinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final VpaRepository vpaRepository;
    private final BankAccountRepository bankAccountRepository;
    private final UPIPinService upiPinService;

    @Override
    @Async("transactionTaskExecutor")
    @Transactional
    public CompletableFuture<TransactionResponse> initiateTransaction(TransactionRequest request, Long userId) {
        try {
//            validate upi pin
            if (!upiPinService.validateUPIPin(userId, request.getUpiPin())) {
                throw new RuntimeException("Invalid UPI Pin");
            }
//            Get sender primary VPA and bank account
            VirtualPaymentAddress senderVpa = vpaRepository.findByUserIdAndIsPrimaryTrue(userId)
                    .orElseThrow(() -> new RuntimeException("No Primary VPA Found"));

            BankAccount senderAccount = senderVpa.getBankAccount();
            if (senderAccount == null) {
                throw new RuntimeException("No bank account linked with VPA");
            }
//            Get Reciever's VPA
            VirtualPaymentAddress reciverVPA = vpaRepository.findByVpa(request.getRecieverVpa())
                    .orElseThrow(() -> new RuntimeException("Receiver VPA not found"));

//            Check sufficient balance
            BankAccount senderAccountLocked = bankAccountRepository.findById(senderAccount.getId())
                    .orElseThrow(() -> new RuntimeException("Sender account not found"));

            if (senderAccountLocked.getBalance().compareTo(request.getAmount()) < 0) {
                throw new RuntimeException("Insufficient Balance");
            }
//            create Transaction record
            Transaction transaction = Transaction.builder()
                    .transactionId(generateTransactionId())
                    .type(Transaction.TransactionType.P2P_TRANSFER)
                    .status(Transaction.TransactionStatus.PROCESSING)
                    .amount(request.getAmount())
                    .description(request.getDescription())
                    .sender(senderVpa.getUser())
                    .receiver(reciverVPA.getUser())
                    .senderVpa(senderVpa.getVpa())
                    .receiverVpa(reciverVPA.getVpa())
                    .build();

            transaction = transactionRepository.save(transaction);

//            Perform Fund Transfer (atomic operation)
            performFundTransfer(senderAccountLocked, reciverVPA, request.getAmount());

//            update status
            transaction.setStatus(Transaction.TransactionStatus.SUCCESS);
            transactionRepository.save(transaction);

            return CompletableFuture.completedFuture(TransactionResponse.fromTransaction(transaction));
        } catch (Exception E) {
            log.error("Transaction Failed: {}", E.getMessage());
//            failed transaction
            Transaction failedTransaction = createFailedTransaction(request, userId, E.getMessage());

            return CompletableFuture.completedFuture(TransactionResponse.fromTransaction(failedTransaction));
        }
    }

    @Transactional
    protected void performFundTransfer(BankAccount senderAccount, VirtualPaymentAddress recieverVpa, BigDecimal amount) {
//        debit sender
        senderAccount.setBalance(senderAccount.getBalance().subtract(amount));
        bankAccountRepository.save(senderAccount);

//        credit receiver
        BankAccount recieverAccount = recieverVpa.getBankAccount();
        if (recieverAccount != null) {
            recieverAccount.setBalance(recieverAccount.getBalance().add(amount));
            bankAccountRepository.save(recieverAccount);
        }
    }

    private Transaction createFailedTransaction(TransactionRequest request, Long userId, String errorMessage) {
        VirtualPaymentAddress senderVpa = vpaRepository.findByUserIdAndIsPrimaryTrue(userId)
                .orElseThrow(() -> new RuntimeException("No primary VPA found"));

        Transaction transaction = Transaction.builder()
                .transactionId(generateTransactionId())
                .type(Transaction.TransactionType.P2P_TRANSFER)
                .status(Transaction.TransactionStatus.FAILED)
                .amount(request.getAmount())
                .description("Failed: " + errorMessage)
                .sender(senderVpa.getUser())
                .senderVpa(senderVpa.getVpa())
                .receiverVpa(request.getRecieverVpa())
                .build();

        return transactionRepository.save(transaction);
    }

    @Override
    public TransactionResponse getTransaction(String transactionId, Long userId) {
        Transaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Security check: user must be either sender or receiver
        if (!transaction.getSender().getId().equals(userId) &&
                !transaction.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return TransactionResponse.fromTransaction(transaction);
    }

    @Override
    public List<TransactionResponse> getUserTransactions(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        return transactions.stream()
                .map(TransactionResponse::fromTransaction)
                .collect(Collectors.toList());
    }

    @Override
    public void processingPendingTransactions() {
        log.info("Processing pending transactions...");
    }

    @Override
    public String generateTransactionId() {
        return "UPI" + LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
