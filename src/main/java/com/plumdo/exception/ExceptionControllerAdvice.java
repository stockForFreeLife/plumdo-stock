package com.plumdo.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * 异常全局捕获
 * 
 * @author wengwenhui
 * 
 */
@ControllerAdvice
public class ExceptionControllerAdvice {
	private final Logger logger = LoggerFactory.getLogger(ExceptionControllerAdvice.class);

	@Autowired
	private ExceptionFactory exceptionFactory;

	@ExceptionHandler(ResponseException.class)
	@ResponseBody
	@ResponseStatus(value = HttpStatus.FORBIDDEN)
	public ErrorResponse handleResponse(ResponseException e) {
		logger.error("全局捕获自定义异常", e);
		if (e.getErrorResponse() != null) {
			return e.getErrorResponse();
		}
		return exceptionFactory.createInternalError();
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseBody
	@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
	public ErrorResponse handleOtherException(Exception e) {
		logger.error("全局捕获未知异常", e);
		return exceptionFactory.createInternalError();
	}

}