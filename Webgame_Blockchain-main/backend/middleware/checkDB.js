/**
 * Middleware kiểm tra MongoDB connection
 * 
 * Block các request cần database nếu MongoDB chưa kết nối
 * Trả về 503 Service Unavailable với thông báo rõ ràng
 */

const { isConnected } = require('../db/connection');

/**
 * Middleware kiểm tra DB connection
 * Chỉ cho phép request tiếp tục nếu MongoDB đã kết nối
 */
function checkDBConnection(req, res, next) {
  if (!isConnected()) {
    return res.status(503).json({
      success: false,
      error: 'Database chưa sẵn sàng. Vui lòng kiểm tra kết nối MongoDB và thử lại sau.',
      details: 'MongoDB connection is not established. Please check server logs for details.'
    });
  }
  next();
}

module.exports = checkDBConnection;
