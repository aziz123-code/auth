const errorMiddleware = (err, req, res, next) => {
    if (res.headersSent) return next(err);
  
    const errorId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    console.error(`[${new Date().toISOString()}] Error ID: ${errorId}`);
    console.error('Path:', req.method, req.originalUrl);
    console.error('Body:', req.body);
    console.error('Error:', err);
  
    let statusCode = err.status || err.statusCode || 500;
  
    let message = err.message || 'Внутренняя ошибка сервера';
  
    const isProduction = process.env.NODE_ENV === 'production';
  
    if (isProduction && statusCode >= 500) {
      message = 'Что-то пошло не так. Мы уже чиним!';
    }
  
    const isClientError = statusCode >= 400 && statusCode < 500;
  
    const safeMessages = [
      'неверный', 'существует', 'отсутствует', 'не найден', 'истёк', 'код', 'пароль',
      'email', 'Google', 'отменён', 'доступ запрещён', 'слишком много попыток'
    ];
  
    const shouldExposeMessage = safeMessages.some(word => 
      typeof err.message === 'string' && err.message.toLowerCase().includes(word)
    );
  
    if (!isProduction || isClientError || shouldExposeMessage) {
    } else {
      message = 'Произошла ошибка. Попробуйте позже';
    }
  
    res.status(statusCode).json({
      success: false,
      message,
      ...( !isProduction && { errorId, stack: err.stack } )
    });
  };
  
  export default errorMiddleware;