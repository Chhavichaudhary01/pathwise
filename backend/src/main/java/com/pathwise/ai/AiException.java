package com.pathwise.ai;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class AiException extends RuntimeException {
    private final boolean retryable;

    public AiException(String message, boolean retryable) {
        super(message);
        this.retryable = retryable;
    }

    public AiException(String message, Throwable cause, boolean retryable) {
        super(message, cause);
        this.retryable = retryable;
    }
}
