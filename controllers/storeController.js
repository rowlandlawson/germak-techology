// controllers/storeController.js
const products = [
    { id: 1, name: 'Smart Switch', description: 'Automated smart light switch', price: 15000 },
    { id: 2, name: 'Surveillance Camera', description: 'HD Night Vision Camera', price: 45000 },
    { id: 3, name: 'Inverter Setup', description: '3KVA full home inverter installation', price: 120000 }
  ];
  
  const services = [
    { id: 1, name: 'Fan Installation', description: 'Wall and ceiling fan installation' },
    { id: 2, name: 'Home Wiring Audit', description: 'Professional inspection and recommendations' },
    { id: 3, name: 'AC Installation', description: 'Indoor/Outdoor split AC installation' }
  ];
  
  export const renderStorePage = (req, res) => {
    res.render('store', { products, services, user: req.user });
  };
  