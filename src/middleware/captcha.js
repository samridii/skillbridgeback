// verifies the hcaptcha token with hcaptcha before allowing the request through
const verifyCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ error: 'CAPTCHA verification required' });
  }

  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.HCAPTCHA_SECRET_KEY}&response=${captchaToken}`,
    });
    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ error: 'CAPTCHA verification failed' });
    }

    delete req.body.captchaToken; // strip it out, downstream validators dont expect this field
    next();
  } catch (err) {
    res.status(500).json({ error: 'CAPTCHA verification error' });
  }
};

module.exports = verifyCaptcha;