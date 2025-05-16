const jwt = require('jsonwebtoken');
exports.adminLogin = (req, res) => {
    const { email, password } = req.body;
  
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
  
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
  
    res.status(200).json({ token });
  };
  