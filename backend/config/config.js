module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'pg_management_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
};
