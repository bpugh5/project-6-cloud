const jwt = require('jsonwebtoken')

const secret_key = process.env.APP_SECRET_KEY;

function requireAuthentication(req, res, next) {
  const auth_header = req.get('Authorization') || '';
  if (auth_header) {
      const header_parts = auth_header.split(' ');
      
      const token = header_parts[0] == "Bearer"? header_parts[1] : null;
      
        try {
          const payload = jwt.verify(token, secret_key);
          req.user = payload.sub;
          next();
        } catch (err) {
          res.status(401).json({"error": "invalid token"});
        }
      }

  }
  
  exports.requireAuthentication = requireAuthentication;