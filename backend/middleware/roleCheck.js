/**
 * Role-check middleware
 * Simulates authorization by reading the user's role from the x-user-role header.
 */

const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];

    if (!userRole) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          details: {
            requiredHeader: 'x-user-role'
          }
        }
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          details: {
            userRole,
            allowedRoles
          }
        }
      });
    }

    next();
  };
};

module.exports = roleCheck;