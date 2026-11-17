const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');

/**
 * Handles user login and issues signed JWT bearer token.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase(), isActive: true } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      documentNumber: user.documentNumber
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      expiresIn: jwtConfig.expiresIn
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        documentNumber: user.documentNumber
      }
    });
  } catch (error) {
    next(error);
  }
};
