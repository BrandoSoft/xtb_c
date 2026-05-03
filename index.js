const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes')

const app = express();

// Middleware'y
app.use(cors());
app.use(express.json()); // Pozwala serwerowi czytać dane w formacie JSON
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Połączenie z bazą danych online
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Sukces! Połączono z bazą MongoDB Atlas"))
    .catch(err => console.error("❌ Błąd połączenia z bazą:", err));

app.use('/api/', userRoutes);

// Uruchomienie serwera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serwer śmiga na porcie ${PORT}`);
});