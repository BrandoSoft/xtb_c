const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 100000
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// MIDDLEWARE PRZED ZAPISEM
userSchema.pre('save', async function () {
    console.log("DEBUG: Middleware pre-save odpala się dla użytkownika:", this.username);
    // Jeśli hasło nie zostało zmienione, przejdź dalej
    if (!this.isModified('password')) {
        return;
    }

    // Generujemy "sól" i haszujemy hasło
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// METODA DO PORÓWNYWANIA HASEŁ (przy logowaniu)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);