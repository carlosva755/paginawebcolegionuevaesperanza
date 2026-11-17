// JWT shared configuration for decentralized token verification
module.exports = {
  secret: process.env.JWT_SECRET || 'ClaveSecretaSuperSeguraParaJWTEnNuevaEsperanzaSoacha2026Minimo32Caracteres!',
  issuer: process.env.JWT_ISSUER || 'NuevaEsperanzaAuthServer',
  audience: process.env.JWT_AUDIENCE || 'NuevaEsperanzaPlatform',
  expiresIn: `${process.env.JWT_EXPIRATION_MINUTES || 60}m`
};
